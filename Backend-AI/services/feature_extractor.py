import re
from urllib.parse import urlparse
import tldextract
from utils.helpers import calculate_entropy, check_typosquatting, SUSPICIOUS_TLDS
from models.request_models import Features
from utils.url_len import normalize_url
def extract_features(url: str) -> Features:
    """
    Extracts phishing-specific features from a given URL.
    - length
    - digitCount
    - isHttps
    - entropy
    - suspiciousTLD
    - typosquatting
    - matchedBrand
    """
    
    data = normalize_url(url)
    url = data["url"]
    parsed_url = data["parsed"]
    domain = data["domain"]
    
    length = len(url)
    digitCount = sum(c.isdigit() for c in url)
    isHttps = parsed_url.scheme == "https"
    
    entropy = calculate_entropy(url)
    
    ext = tldextract.extract(url)
    tld = "." + ext.suffix.lower()
    suspiciousTLD = tld in SUSPICIOUS_TLDS
    
    typo, brand = check_typosquatting(domain)
    
    return Features(
        length=length,
        digitCount=digitCount,
        isHttps=isHttps,
        entropy=round(entropy, 2),
        suspiciousTLD=suspiciousTLD,
        typosquatting=typo,
        matchedBrand=brand
    )
