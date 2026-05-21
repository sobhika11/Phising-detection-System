from urllib.parse import urlparse

def normalize_url(url: str):
    
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "http://" + url

    parsed_url = urlparse(url)

    domain = parsed_url.netloc.split(":")[0]

    return {
        "url": url,
        "parsed": parsed_url,
        "domain": domain
    }