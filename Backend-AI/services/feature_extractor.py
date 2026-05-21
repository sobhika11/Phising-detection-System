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
    "tpoint",
    "apple",
    "facebook",
    "instagram",
    "netflix",
    "bankofamerica"
]

LEGIT_DOMAINS = {
    "google": ["google.com"],
    "amazon": ["amazon.com"],
    "paypal": ["paypal.com"],
    "microsoft": ["microsoft.com"],
    "apple": ["apple.com"],
    "facebook": ["facebook.com"],
    "instagram": ["instagram.com"],
    "netflix": ["netflix.com"],
    "leetcode": ["leetcode.com"],
    "codechef": ["codechef.com"],
    "tpoint": ["tpointtech.com"],
    "bankofamerica": ["bankofamerica.com"]
}
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
def is_legit_domain(hostname: str) -> bool:
    """
    Checks whether hostname belongs to a real trusted domain.
    """
    hostname = hostname.lower()
    for domains in LEGIT_DOMAINS.values():
        for legit in domains:
            if hostname == legit or hostname.endswith("." + legit):
                return True
    return False
def check_typosquatting(hostname: str):
    """
    Detects fake domains pretending to be real brands.
    """
    hostname = hostname.lower()
    if is_legit_domain(hostname):
        return False, None
    parts = hostname.split(".")
    for part in parts:
        normalized = normalize_word(part)
        for brand in BRANDS:
            # exact brand inside fake hostname
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