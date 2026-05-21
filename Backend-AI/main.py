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
    
    # 1. Feature Extraction
    features = extract_features(url)
    
    # 2. Infra Lookup
    infrastructure = await check_infrastructure(url)
    
    # 3. Predictor Engine (Heuristics / ML)
    riskScore, verdict, modelUsed = predict_phishing(features, infrastructure)
    
    # 4. Sanitized Screenshot Capture
    # Done last or concurrently to avoid slowing down immediate rule evaluations
    sanitizedView = await capture_screenshot(url)
    # 5. Ingest threat data into Neo4j graph
    ip_address = infrastructure.ip if infrastructure.ip else ""
    await ingest_threat_data(url, ip_address, riskScore)
    
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
