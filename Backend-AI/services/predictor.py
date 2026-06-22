import os
import joblib
from models.request_models import Features, Infrastructure

# Load ML model if available
MODEL_PATH = "model.pkl"
rf_model = None

if os.path.exists(MODEL_PATH):
    try:
        rf_model = joblib.load(MODEL_PATH)
        print("ML model loaded successfully.")
    except Exception as e:
        print(f"Failed to load ML model: {e}")


def calculate_heuristic_score(features: Features, infrastructure: Infrastructure) -> float:
    score = 0.1

    if not features.isHttps:
        score += 0.2

    if features.entropy > 4.5:
        score += 0.15

    if features.suspiciousTLD:
        score += 0.25

    if features.typosquatting:
        score += 0.4

    if features.isHttps and not infrastructure.sslValid:
        score += 0.25

    if features.length > 75:
        score += 0.1

    if features.digitCount > 10:
        score += 0.1

    return min(max(score, 0.0), 1.0)


def predict_phishing(features: Features, infrastructure: Infrastructure):
    """
    Returns:
    risk_score, verdict, model_used
    """

    if rf_model is not None:
        try:
            X = [[
                features.length,
                features.digitCount,
                features.entropy,
                int(features.isHttps),
                int(features.suspiciousTLD),
                int(features.typosquatting),
                int(infrastructure.sslValid)
            ]]

            score = float(rf_model.predict_proba(X)[0][1])
            model_used = "Random Forest"

        except Exception as e:
            print(f"ML prediction failed: {e}")
            score = calculate_heuristic_score(features, infrastructure)
            model_used = "Heuristic"

    else:
        score = calculate_heuristic_score(features, infrastructure)
        model_used = "Heuristic"

    if score >= 0.70:
        verdict = "Malicious"
    elif score >= 0.40:
        verdict = "Suspicious"
    else:
        verdict = "Safe"

    return round(score, 2), verdict, model_used