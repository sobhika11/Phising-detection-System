import re
from urllib.parse import urlparse
import tldextract
from utils.helpers import calculate_entropy, check_typosquatting, SUSPICIOUS_TLDS
from models.request_models import Features
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
    # Fix missing scheme for robust parsing
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "http://" + url

    parsed_url = urlparse(url)
    domain = parsed_url.netloc
    
    length = len(url)
    digitCount = sum(c.isdigit() for c in url)
    isHttps = parsed_url.scheme == "https"
    
    # Calculate Shannon entropy on the whole URL to detect randomness (DGA)
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
