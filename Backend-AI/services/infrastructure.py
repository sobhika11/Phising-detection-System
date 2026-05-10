import socket
import ssl
import httpx
from urllib.parse import urlparse
from models.request_models import Infrastructure, GeoLocation

async def check_infrastructure(url: str) -> Infrastructure:
    """
    Performs live infrastructure lookup for a given URL.
    - DNS resolution to IP
    - SSL certificate check
    - Geo-location of the IP
    """
    # Pre-process URL
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "http://" + url
        
    parsed_url = urlparse(url)
    domain = parsed_url.netloc.split(':')[0] # Remove port if exists
    
    ip_address = None
    ssl_valid = False
    geo = GeoLocation()

    # 1. DNS Resolution
    try:
        ip_address = socket.gethostbyname(domain)
    except socket.gaierror:
        pass # DNS resolution failed

    # 2. SSL/TLS Verification
    if domain:
        context = ssl.create_default_context()
        try:
            with socket.create_connection((domain, 443), timeout=3) as sock:
                with context.wrap_socket(sock, server_hostname=domain) as ssock:
                    # If wrap_socket succeeds without throwing an error, the cert is generally valid
                    ssl_valid = True
        except Exception:
            ssl_valid = False

    # 3. Geo-Location Lookup
    if ip_address:
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                response = await client.get(f"http://ip-api.com/json/{ip_address}")
                if response.status_code == 200:
                    data = response.json()
                    if data.get("status") == "success":
                        geo = GeoLocation(
                            country=data.get("country"),
                            region=data.get("regionName"),
                            city=data.get("city")
                        )
        except Exception:
            pass # Fail gracefully if API is down

    return Infrastructure(
        domain=domain,
        ip=ip_address,
        sslValid=ssl_valid,
        geoLocation=geo
    )
