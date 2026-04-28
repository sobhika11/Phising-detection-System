import math
import tldextract
import Levenshtein

POPULAR_BRANDS = ["google", "facebook", "amazon", "paypal", "microsoft", "apple", "netflix"]
SUSPICIO
US_TLDS = [".xyz", ".top", ".tk", ".ml", ".ga", ".cf", ".gq", ".online", ".site", ".win"]

def calculate_entropy(text: str) -> float:
    """Calculates the Shannon entropy of a string."""
    if not text:
        return 0.0
    entropy = 0
    length = len(text)
    for x in set(text):
        p_x = text.count(x) / length
        entropy += - p_x * math.log2(p_x)
    return entropy

def check_typosquatting(domain: str) -> tuple[bool, str | None]:
    """
    Checks if a domain is potentially typosquatting a popular brand
    using Levenshtein distance.
    Returns (is_typosquatting, matched_brand)
    """
    ext = tldextract.extract(domain)
    domain_name = ext.domain.lower()
    
    for brand in POPULAR_BRANDS:
        if domain_name == brand:
            return False, None # It is the actual brand, handled elsewhere or safe
        
        distance = Levenshtein.distance(domain_name, brand)
        # If distance is 1 or 2, it might be heavily typosquatted (e.g., paypa1)
        # Exclude distances that are too far
        if 1 <= distance <= 2:
            return True, brand + "." + ext.suffix if ext.suffix else brand
            
    return False, None
