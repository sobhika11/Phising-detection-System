import sys
import asyncio

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from models.request_models import PredictRequest, PredictResponse
from services.feature_extractor import extract_features
from services.infrastructure import check_infrastructure
from services.screenshot import capture_screenshot
from services.predictor import predict_phishing
from services.neo4j_service import register_neo4j_events, ingest_threat_data

app = FastAPI(
    title="Phishing Detection AI Service",
    description="Advanced Service for Feature Extraction, Heuristics, ML Prediction, and Live Intelligence Analysis",
    version="1.0.0"
)
# Register Neo4j driver lifecycle events
register_neo4j_events(app)

import os
os.makedirs("screenshots", exist_ok=True)
app.mount("/screenshots", StaticFiles(directory="screenshots"), name="screenshots")
@app.get("/health")
def health_check():
    """Returns the health status of the API."""
    return {"status": "ok", "service": "backend-ai"}

@app.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest):
    """
    Main analysis endpoint. Analyzes the provided URL by extracting features,
    looking up infrastructure, capturing a sanitized screenshot, and scoring the risk.
    """
    url = str(request.url)
    
    # Feature Extraction
    features = extract_features(url)

    # Start both tasks
    infrastructure = asyncio.create_task(check_infrastructure(url))
    sanitizedView = asyncio.create_task(capture_screenshot(url))

    # Wait for infrastructure when needed
    infrastructure = await infrastructure

    # Prediction
    riskScore, verdict, modelUsed = predict_phishing(features, infrastructure)
 
    # Wait for screenshot when needed
    sanitizedView = await sanitizedView

    # Neo4j
    ip_address = infrastructure.ip if infrastructure.ip else ""
    asyncio.create_task(
    ingest_threat_data(url, ip_address, riskScore)
)
    
    # Construct response
    response_data = PredictResponse(
        riskScore=riskScore,
        verdict=verdict,
        modelUsed=modelUsed,
        features=features,
        infrastructure=infrastructure,
        sanitizedView=sanitizedView
    )
    
    return response_data
