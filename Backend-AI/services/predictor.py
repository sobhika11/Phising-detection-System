import os
import joblib
from models.request_models import Features, Infrastructure

# Try to load ML model if it exists
MODEL_PATH = "model.pkl"
rf_model = None

if os.path.exists(MODEL_PATH):
    try:
        rf_model = joblib.load(MODEL_PATH)
    except Exception as e:
        print(f"Failed to load ML model: {e}")

def calculate_heuristic_score(features: Features, infrastructure: Infrastructure) -> float:
    """
    Calculates a risk score from 0.0 to 1.0 based on heuristic rules.
    """
    score = 0.1 # Base score

    # 1. Lack of HTTPS
    if not features.isHttps:
        score += 0.2

    # 2. Entropy (High randomness usually points to DGA)
    if features.entropy > 4.5:
        score += 0.15

    # 3. Suspicious TLD
    if features.suspiciousTLD:
        score += 0.25

    # 4. Typosquatting
    if features.typosquatting:
        score += 0.4

    # 5. SSL Validation Failure
    # Only penalize if HTTPS is used but SSL is invalid
    if features.isHttps and not infrastructure.sslValid:
        score += 0.25
        
    # 6. Randomness in URL length or digits
    if features.length > 75:
        score += 0.1
    if features.digitCount > 10:
        score += 0.1

    # Clamp the result between 0.0 and 1.0
    return min(max(score, 0.0), 1.0)

def predict_phishing(features: Features, infrastructure: Infrastructure) -> tuple[float, str, str]:
    """
    Evaluates the URL and returns (riskScore, verdict, modelUsed).
    """
    if rf_model is not None:
        try:
            # Note: For real ML usage, you must transform `features` into the correct shape.
            # Example: X = [[features.length, features.digitCount, int(features.isHttps)...]]
            # score = rf_model.predict_proba(X)[0][1]
            # using mock integration here for structural completeness
            X_mock = [[features.length, features.entropy]] 
            score = float(rf_model.predict_proba(X_mock)[0][1])
            model_used = "ML"
        except Exception:
            score = calculate_heuristic_score(features, infrastructure)
            model_used = "Heuristic"
    else:
        # Fallback to Heuristic engine
        score = calculate_heuristic_score(features, infrastructure)
        model_used = "Heuristic"

    # Verdict assignment
    if score >= 0.70:
        verdict = "Malicious"
    elif score >= 0.40:
        verdict = "Suspicious"
    else:
        verdict = "Safe"
        
    return round(score, 2), verdict, model_used
