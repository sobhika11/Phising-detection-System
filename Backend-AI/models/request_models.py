from pydantic import BaseModel

class PredictRequest(BaseModel):
    url: str

class GeoLocation(BaseModel):
    country: str | None = None
    region: str | None = None
    city: str | None = None


class Infrastructure(BaseModel):
    domain: str
    ip: str | None = None
    sslValid: bool = False
    geoLocation: GeoLocation | None = None

class Features(BaseModel):
    length: int
    digitCount: int
    isHttps: bool
    entropy: float
    suspiciousTLD: bool
    typosquatting: bool
    matchedBrand: str | None = None

class SanitizedView(BaseModel):
    screenshotCaptured: bool
    screenshotPath: str | None = None
    renderingStatus: str
    finalUrl: str | None = None
    pageTitle: str | None = None
    loginFormDetected: bool = False
    suspiciousVisualIndicators: list[str] = []
    error: str | None = None

class PredictResponse(BaseModel):
    riskScore: float
    verdict: str
    modelUsed: str
    features: Features
    infrastructure: Infrastructure
    sanitizedView: SanitizedView
