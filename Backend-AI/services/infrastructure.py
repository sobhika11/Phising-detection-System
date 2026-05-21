import socket
import ssl
import httpx
import ipaddress
from urllib.parse import urlparse
from models.request_models import Infrastructure, GeoLocation
from utils.url_len import normalize_url

def is_safe_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ('http', 'https'):
            return False
        hostname = parsed.hostname
        if not hostname:
            return False
        if hostname == 'localhost' or hostname.endswith('.local'):
            return False
        if hostname.startswith('127.') or hostname.startswith('192.168.') or hostname.startswith('10.'):
            return False

        ip_addr = socket.gethostbyname(hostname)
        ip = ipaddress.ip_address(ip_addr)
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast or ip.is_reserved:
            return False
            
        return True
    except Exception:
        return False

async def check_infrastructure(url: str) -> Infrastructure:
    """
    Performs live infrastructure lookup for a given URL.
    - DNS resolution to IP
    - SSL certificate check
    - Geo-location of the IP
    """
    data = normalize_url(url)
    url = data["url"]
    parsed_url = data["parsed"]
    domain = data["domain"]
    
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
