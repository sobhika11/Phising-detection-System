# services/neo4j_service.py
"""Neo4j async service for storing phishing threat data.

Provides:
- Lifecycle management of the Neo4j driver using FastAPI startup/shutdown events.
- `ingest_threat_data` function to merge URL and IP nodes and create a :HOSTED_ON relationship.
- Stores `risk_score` and `last_updated` on the URL node.

All Cypher queries use parameter binding to prevent injection.
"""

import os
import sys
import asyncio
from datetime import datetime
from typing import Any

from fastapi import FastAPI
from neo4j import AsyncGraphDatabase, AsyncTransaction

# Environment variables (ensure .env is loaded before app startup)
NEO4J_URI = os.getenv("NEO4J_URI")  # e.g., bolt://... or neo4j+s://...
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")  # default username
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy()) 
    
if not all([NEO4J_URI, NEO4J_PASSWORD]):
    raise RuntimeError("Neo4j connection credentials are missing in environment variables.")

# Global driver instance – will be initialised on FastAPI startup.
_driver: Any = None

def get_driver() -> AsyncGraphDatabase.driver:
    """Return the global Neo4j async driver.

    The driver is created once during the FastAPI startup event and closed on shutdown.
    """
    if _driver is None:
        raise RuntimeError("Neo4j driver has not been initialised. Ensure FastAPI startup event has run.")
    return _driver

async def _merge_threat_data(tx: AsyncTransaction, url: str, ip: str, risk_score: float) -> None:
    """Cypher MERGE query to ensure URL and IP nodes exist and relate them.

    Parameters are bound safely via the query's `$` placeholders.
    """
    cypher = """
    MERGE (u:URL {address: $url})
      ON CREATE SET u.risk_score = $risk_score,
                    u.last_updated = datetime()
      ON MATCH SET  u.risk_score = $risk_score,
                    u.last_updated = datetime()
    MERGE (i:IP {address: $ip})
    MERGE (u)-[:HOSTED_ON]->(i)
    RETURN u, i
    """
    await tx.run(cypher, url=url, ip=ip, risk_score=risk_score)

async def ingest_threat_data(url: str, ip: str, risk_score: float) -> None:
    """Public API – merges URL & IP nodes and creates a HOSTED_ON relationship.

    This function can be called from any FastAPI endpoint (e.g., the URL analysis flow).
    """
    driver = get_driver()
    async with driver.session() as session:
        await session.execute_write(_merge_threat_data, url, ip, risk_score)
# FastAPI lifecycle hooks – the main FastAPI instance lives in `main.py`.
# The following helper can be imported and added to the app in `main.py`:

def register_neo4j_events(app: FastAPI) -> None:
    """Attach startup and shutdown events to the given FastAPI app.

    Usage in `Backend-AI/main.py`:
        from services.neo4j_service import register_neo4j_events
        register_neo4j_events(app)
    """

    @app.on_event("startup")
    async def _startup() -> None:
        global _driver
        _driver = AsyncGraphDatabase.driver(
            NEO4J_URI,
            auth=(NEO4J_USER, NEO4J_PASSWORD),
            max_connection_pool_size=50,
        )
        # Verify connectivity once at startup.
        async with _driver.session() as session:
            result = await session.run("RETURN 1")
            await result.single()

    @app.on_event("shutdown")
    async def _shutdown() -> None:
        global _driver
        if _driver is not None:
            await _driver.close()
            _driver = None
