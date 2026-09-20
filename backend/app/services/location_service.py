import math
import httpx
import asyncio
from typing import Optional, List, Dict, Any, Tuple
from ..core.config import settings, logger
from ..schemas.location import GeocodeRequest, GeocodeResponse

# Reference offline benchmarks for development/testing
DISTRICT_COORDS = {
    "guntur": {"district": "Guntur", "state": "Andhra Pradesh", "lat": 16.3067, "lng": 80.4365, "pincode": "522002", "block": "Guntur Urban"},
    "tenali": {"district": "Guntur", "state": "Andhra Pradesh", "lat": 16.2435, "lng": 80.6402, "pincode": "522201", "block": "Tenali Rural"},
    "vijayawada": {"district": "NTR", "state": "Andhra Pradesh", "lat": 16.5062, "lng": 80.6480, "pincode": "520001", "block": "Vijayawada Central"},
    "visakhapatnam": {"district": "Visakhapatnam", "state": "Andhra Pradesh", "lat": 17.6868, "lng": 83.2185, "pincode": "530001", "block": "Visakhapatnam Urban"},
    "hyderabad": {"district": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lng": 78.4867, "pincode": "500001", "block": "Hyderabad Central"},
    "warangal": {"district": "Warangal", "state": "Telangana", "lat": 17.9689, "lng": 79.5941, "pincode": "506002", "block": "Warangal Rural"},
    "bengaluru": {"district": "Bengaluru Urban", "state": "Karnataka", "lat": 12.9716, "lng": 77.5946, "pincode": "560001", "block": "Bengaluru Central"},
    "mysuru": {"district": "Mysuru", "state": "Karnataka", "lat": 12.2958, "lng": 76.6394, "pincode": "570001", "block": "Mysuru Rural"},
    "chennai": {"district": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lng": 80.2707, "pincode": "600001", "block": "Chennai North"},
    "madurai": {"district": "Madurai", "state": "Tamil Nadu", "lat": 9.9252, "lng": 78.1198, "pincode": "625001", "block": "Madurai South"},
    "mumbai": {"district": "Mumbai City", "state": "Maharashtra", "lat": 18.9388, "lng": 72.8354, "pincode": "400001", "block": "Colaba"},
    "pune": {"district": "Pune", "state": "Maharashtra", "lat": 18.5204, "lng": 73.8567, "pincode": "411001", "block": "Haveli"},
    "new delhi": {"district": "New Delhi", "state": "Delhi", "lat": 28.6139, "lng": 77.2090, "pincode": "110001", "block": "Connaught Place"},
    "kanpur": {"district": "Kanpur Nagar", "state": "Uttar Pradesh", "lat": 26.4499, "lng": 80.3319, "pincode": "208001", "block": "Kalyanpur"},
    "varanasi": {"district": "Varanasi", "state": "Uttar Pradesh", "lat": 25.3176, "lng": 82.9739, "pincode": "221001", "block": "Kashi"},
    "patna": {"district": "Patna", "state": "Bihar", "lat": 25.5941, "lng": 85.1376, "pincode": "800001", "block": "Patna Sadar"},
    "kolkata": {"district": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lng": 88.3639, "pincode": "700001", "block": "Kolkata Central"}
}

PINCODE_CACHE = {
    "522002": {"district": "Guntur", "state": "Andhra Pradesh", "lat": 16.3067, "lng": 80.4365, "block": "Guntur Urban", "village": "Guntur"},
    "522201": {"district": "Guntur", "state": "Andhra Pradesh", "lat": 16.2435, "lng": 80.6402, "block": "Tenali Rural", "village": "Tenali"},
    "500001": {"district": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lng": 78.4867, "block": "Hyderabad Central", "village": "Abids"},
    "560001": {"district": "Bengaluru Urban", "state": "Karnataka", "lat": 12.9716, "lng": 77.5946, "block": "Bengaluru Central", "village": "Shivajinagar"},
    "600001": {"district": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lng": 80.2707, "block": "Chennai North", "village": "George Town"},
    "400001": {"district": "Mumbai City", "state": "Maharashtra", "lat": 18.9388, "lng": 72.8354, "block": "Mumbai Central", "village": "Fort"},
    "110001": {"district": "New Delhi", "state": "Delhi", "lat": 28.6139, "lng": 77.2090, "block": "Connaught Place", "village": "Connaught Place"},
    "208001": {"district": "Kanpur Nagar", "state": "Uttar Pradesh", "lat": 26.4499, "lng": 80.3319, "block": "Kanpur", "village": "Civil Lines"},
    "800001": {"district": "Patna", "state": "Bihar", "lat": 25.5941, "lng": 85.1376, "block": "Patna Sadar", "village": "Fraser Road"},
    "700001": {"district": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lng": 88.3639, "block": "Kolkata Central", "village": "BBD Bagh"}
}

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great-circle distance in kilometers using the Haversine formula."""
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)

def normalize_str(val: Optional[str]) -> str:
    """Normalizes string for comparison by lowercasing and stripping punctuation."""
    if not val:
        return ""
    return "".join(c for c in val.lower() if c.isalnum() or c.isspace()).strip()

def validate_location_result(
    addr: Dict[str, Any],
    display_name: str,
    expected_state: Optional[str] = None,
    expected_district: Optional[str] = None,
    expected_village: Optional[str] = None,
    expected_pincode: Optional[str] = None,
    item: Optional[Dict[str, Any]] = None
) -> Tuple[bool, str]:
    """
    Hierarchical Validation of geocoder results:
    1. Result country must be India.
    2. Result state must match user requested state (case-insensitive normalized substring or exact match).
       Explicit cross-state rejection (e.g., requested Telangana vs result Andhra Pradesh).
    3. If district specified, verify match with district, state_district, county, or display_name.
    """
    # 1. Country validation: Must be India
    country_code = (addr.get("country_code") or "").lower()
    dn_lower = display_name.lower()
    if country_code and country_code != "in":
        return False, f"Country mismatch: {country_code} != in"
    if not country_code and "india" not in dn_lower:
        return False, "Country 'India' not in display name"

    # 2. State validation: Strict cross-state rejection and substring matching
    if expected_state:
        exp_s = normalize_str(expected_state)
        res_s = normalize_str(addr.get("state") or "")

        # Explicit check for Telugu states division
        if exp_s == "telangana" and "andhra pradesh" in res_s:
            return False, "Explicit rejection: requested Telangana but result is Andhra Pradesh"
        if exp_s == "andhra pradesh" and "telangana" in res_s:
            return False, "Explicit rejection: requested Andhra Pradesh but result is Telangana"

        if res_s:
            if exp_s not in res_s and res_s not in exp_s:
                return False, f"State mismatch: expected '{exp_s}', got '{res_s}'"
        else:
            # Fallback to display_name check if address object lacks explicit state field
            if exp_s not in normalize_str(dn_lower):
                return False, f"State '{exp_s}' not found in display name: '{display_name}'"

    # 3. District validation
    if expected_district:
        exp_d = normalize_str(expected_district)
        res_d = normalize_str(
            f"{addr.get('state_district', '')} {addr.get('county', '')} {addr.get('district', '')}"
        )
        if exp_d not in res_d and res_d not in exp_d and exp_d not in normalize_str(dn_lower):
            return False, f"District mismatch: expected '{exp_d}', not found in '{res_d}' or display name"

    # 4. Specificity validation: if user asked for village or district, reject generic state/country boundaries
    if expected_district or expected_village or expected_pincode:
        addr_type = (item.get("addresstype") or item.get("type") or "").lower()
        if addr_type in ["state", "country"]:
            return False, f"Result is generic {addr_type} boundary, not a verified local place"

    return True, "Valid"

async def geocode_location(
    query: Optional[str] = None,
    village_town: Optional[str] = None,
    block: Optional[str] = None,
    district: Optional[str] = None,
    state: Optional[str] = None,
    pincode: Optional[str] = None
) -> Optional[GeocodeResponse]:
    """
    Geocodes user location using specific, granular queries and strict hierarchical validation.
    Under NO circumstances will this silently fallback to Guntur or fake coordinates.
    Returns GeocodeResponse if verified, or None if unverified.
    """
    v = (village_town or "").strip()
    b = (block or "").strip()
    d = (district or "").strip()
    s = (state or "").strip()
    p = (pincode or "").strip()
    q = (query or "").strip()

    # Extract numeric PIN candidate if passed in query
    if not p and q.isdigit() and len(q) == 6:
        p = q

    # 1. Try Google Geocoding API if GOOGLE_MAPS_API_KEY is configured
    try:
        from .google_maps_service import geocode_with_google
        google_res = await geocode_with_google(query, village_town, block, district, state, p)
        if google_res:
            # Validate Google response state matches
            if not s or normalize_str(s) in normalize_str(google_res.state):
                return google_res
    except Exception as ge:
        logger.warning(f"Google Geocoding error: {ge}")

    # 2. Build specific, granular search queries strictly following required priority:
    # Primary: f"{pincode}, {village_town}, {mandal}, {district}, {state}, India"
    # Fallback 1: f"{village_town}, {mandal}, {district}, {state}, India"
    # Fallback 2: f"{village_town}, {district}, {state}, India"
    # Fallback 3: f"{pincode}, {state}, India"
    # Fallback 4: f"{pincode}, India"
    # Fallback 5: f"{district}, {state}, India"
    candidates: List[str] = []

    if p and v and b and d and s:
        candidates.append(f"{p}, {v}, {b}, {d}, {s}, India")
    if p and v and d and s:
        candidates.append(f"{p}, {v}, {d}, {s}, India")
    if v and b and d and s:
        candidates.append(f"{v}, {b}, {d}, {s}, India")
    if v and d and s:
        candidates.append(f"{v}, {d}, {s}, India")
    if v and b and s:
        candidates.append(f"{v}, {b}, {s}, India")
    if v and s:
        candidates.append(f"{v}, {s}, India")
    if p and s:
        candidates.append(f"{p}, {s}, India")
    if p:
        candidates.append(f"{p}, India")
    if d and s:
        candidates.append(f"{d}, {s}, India")
    if v:
        candidates.append(f"{v}, India")
    if q and q not in candidates:
        candidates.append(q if q.lower().endswith("india") else f"{q}, India")

    # Deduplicate while preserving order
    search_queries: List[str] = []
    for c_term in candidates:
        if c_term and c_term not in search_queries:
            search_queries.append(c_term)

    # 3. Query OpenStreetMap Nominatim with rate-limit compliance
    headers = {"User-Agent": settings.GEOCODING_USER_AGENT}
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            for idx, search_term in enumerate(search_queries):
                params = {
                    "q": search_term,
                    "format": "json",
                    "addressdetails": "1",
                    "limit": "3",
                    "countrycodes": "in"
                }
                try:
                    resp = await client.get(settings.NOMINATIM_GEOCODE_URL, params=params, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        if data and isinstance(data, list):
                            for item in data:
                                addr = item.get("address", {})
                                display_name = item.get("display_name", "")
                                
                                # Strict Hierarchical Validation
                                is_valid, reason = validate_location_result(
                                    addr=addr,
                                    display_name=display_name,
                                    expected_state=s,
                                    expected_district=d,
                                    expected_village=v,
                                    expected_pincode=p,
                                    item=item
                                )
                                
                                if is_valid:
                                    lat = float(item["lat"])
                                    lng = float(item["lon"])

                                    found_village = (
                                        addr.get("village")
                                        or addr.get("town")
                                        or addr.get("city")
                                        or addr.get("suburb")
                                        or v
                                        or (q or "Location")
                                    )
                                    found_block = (
                                        addr.get("county")
                                        or addr.get("subdistrict")
                                        or b
                                        or "Mandal"
                                    )
                                    found_dist = (
                                        addr.get("state_district")
                                        or addr.get("county")
                                        or d
                                        or "District"
                                    )
                                    found_state = (
                                        addr.get("state")
                                        or s
                                        or "State"
                                    )
                                    found_pin = addr.get("postcode") or p or ""
                                    bounding = [float(bbox) for bbox in item.get("boundingbox", [])] if item.get("boundingbox") else None

                                    # Confidence score based on candidate hierarchy rank
                                    confidence = max(0.60, round(1.0 - (idx * 0.08), 2))

                                    logger.info(f"Verified geocoding match for '{search_term}': {lat}, {lng} ({found_state})")
                                    return GeocodeResponse(
                                        latitude=lat,
                                        longitude=lng,
                                        display_name=display_name or f"{found_village}, {found_dist}, {found_state}",
                                        village_town=found_village,
                                        block=found_block,
                                        mandal=found_block,
                                        district=found_dist,
                                        state=found_state,
                                        pincode=found_pin,
                                        formatted_address=display_name or f"{found_village}, {found_dist}, {found_state}",
                                        is_approximate=False,
                                        confidence=confidence,
                                        bounding_box=bounding
                                    )
                                else:
                                    logger.debug(f"Candidate item '{display_name[:40]}' rejected: {reason}")
                except Exception as query_err:
                    logger.debug(f"Candidate query '{search_term}' failed: {query_err}")
                
                # Small pause to respect Nominatim policy
                await asyncio.sleep(0.3)
    except Exception as e:
        logger.warning(f"Live Nominatim lookup batch failed: {e}")

    # 4. Secondary check: Direct PIN code cache, only if state strictly matches
    if p and p in PINCODE_CACHE:
        c = PINCODE_CACHE[p]
        if not s or normalize_str(s) in normalize_str(c["state"]):
            v_name = v or c.get("village", c["district"])
            d_name = d or c["district"]
            s_name = s or c["state"]
            b_name = b or c.get("block", "Rural Mandal")
            return GeocodeResponse(
                latitude=c["lat"],
                longitude=c["lng"],
                display_name=f"{v_name}, {b_name}, {d_name}, {s_name} - PIN {p}",
                village_town=v_name,
                block=b_name,
                mandal=b_name,
                district=d_name,
                state=s_name,
                pincode=p,
                formatted_address=f"{v_name}, {d_name}, {s_name}, India",
                is_approximate=False,
                confidence=0.85
            )

    # 5. NO SILENT FALLBACK: Under no condition return Guntur or demo coordinates!
    logger.warning(f"Could not verify location for inputs: state='{s}', district='{d}', block='{b}', village='{v}', pin='{p}'")
    return None
