import re
from urllib.parse import urlparse
from difflib import SequenceMatcher

import tldextract

from utils.helpers import (
    calculate_entropy,
    SUSPICIOUS_TLDS
)

from models.request_models import Features
from utils.url_len import normalize_url
PHISH_KEYWORDS = [
    "login",
    "signin",
    "verify",
    "account",
    "secure",
    "update",
    "paypal",
    "amazon",
    "bank",
    "microsoft",
    "apple",
    "google"
]
BRANDS = [
    "amazon",
    "paypal",
    "google",
    "microsoft",
    "leetcode",
    "codechef",
    "Tpoint",
    "apple",
    "facebook",
    "instagram",
    "netflix",
    "bankofamerica"
]
COMMON_REPLACEMENTS = {
    "0": "o",
    "1": "l",
    "3": "e",
    "5": "s",
    "7": "t",
    "@": "a"
}
def normalize_word(word: str) -> str:
    word = word.lower()
    for fake, real in COMMON_REPLACEMENTS.items():
        word = word.replace(fake, real)
    return word

def check_typosquatting(hostname: str):
    """
    Detects typosquatting attempts inside hostname/subdomains.
    """
    hostname = hostname.lower()
    parts = hostname.split(".")
    for part in parts:
        normalized = normalize_word(part)
        for brand in BRANDS:
            if brand in normalized:
                return True, brand
            similarity = SequenceMatcher(
                None,
                normalized,
                brand
            ).ratio()
            if similarity >= 0.75:
                return True, brand
    return False, None

def extract_features(url: str) -> Features:
    """
    Extract phishing-related features from URL.
    """
    data = normalize_url(url)
    url = data["url"]
    parsed_url = data["parsed"]
    domain = data["domain"]
    hostname = parsed_url.hostname.lower() if parsed_url.hostname else ""
    length = len(url)
    digitCount = sum(c.isdigit() for c in url)
    isHttps = parsed_url.scheme == "https"
    entropy = calculate_entropy(url)
    ext = tldextract.extract(url)
    tld = "." + ext.suffix.lower()
    suspiciousTLD = tld in SUSPICIOUS_TLDS
    typo, brand = check_typosquatting(hostname)
    keywordHits = sum(
        1
        for kw in PHISH_KEYWORDS
        if kw in hostname
    )

    print("HOSTNAME:", hostname)
    print("TYPO:", typo)
    print("BRAND:", brand)
    print("KEYWORDS:", keywordHits)

    return Features(
        length=length,
        digitCount=digitCount,
        isHttps=isHttps,
        entropy=round(entropy, 2),
        suspiciousTLD=suspiciousTLD,
        typosquatting=typo,
        matchedBrand=brand,
        keywordHits=keywordHits
    )