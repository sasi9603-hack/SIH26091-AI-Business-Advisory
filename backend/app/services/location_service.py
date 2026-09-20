import math
import httpx
from typing import Optional, List
from ..core.config import settings, logger
from ..schemas.location import GeocodeRequest, GeocodeResponse

# Fallback reference coordinates for major Indian districts & blocks
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

async def geocode_location(
    query: Optional[str] = None,
    village_town: Optional[str] = None,
    block: Optional[str] = None,
    district: Optional[str] = None,
    state: Optional[str] = None,
    pincode: Optional[str] = None
) -> GeocodeResponse:
    # 1. Check if direct 6-digit PIN code cache exists
    pin_candidate = pincode or (query if query and query.strip().isdigit() and len(query.strip()) == 6 else None)
    if pin_candidate and pin_candidate in PINCODE_CACHE:
        c = PINCODE_CACHE[pin_candidate]
        v_name = village_town or c.get("village", c["district"])
        d_name = district or c["district"]
        s_name = state or c["state"]
        b_name = block or c.get("block", "Rural Mandal")
        return GeocodeResponse(
            latitude=c["lat"],
            longitude=c["lng"],
            display_name=f"{v_name}, {b_name}, {d_name}, {s_name} - PIN {pin_candidate}",
            village_town=v_name,
            block=b_name,
            district=d_name,
            state=s_name,
            pincode=pin_candidate,
            formatted_address=f"{v_name}, {d_name}, {s_name}, India",
            is_approximate=False
        )

    # 2. Try Google Geocoding API if GOOGLE_MAPS_API_KEY is configured
    try:
        from .google_maps_service import geocode_with_google
        google_res = await geocode_with_google(query, village_town, block, district, state, pin_candidate)
        if google_res:
            return google_res
    except Exception as ge:
        logger.warning(f"Google Geocoding error: {ge}")

    # 3. Build prioritized cascading search queries
    # If the user typed a specific village/town or free-text query, test:
    # 1) Full combination (village, mandal, district, state)
    # 2) village + state
    # 3) village alone
    # 4) pincode
    # 5) district + state
    candidates = []
    v = (village_town or "").strip()
    b = (block or "").strip()
    d = (district or "").strip()
    s = (state or "").strip()
    p = (pin_candidate or "").strip()
    q = (query or "").strip()

    if q:
        candidates.append(q if q.lower().endswith("india") else f"{q}, India")

    if v and d and s:
        candidates.append(f"{v}, {d}, {s}, India")
    if v and b and s:
        candidates.append(f"{v}, {b}, {s}, India")
    if v and s:
        candidates.append(f"{v}, {s}, India")
    if v:
        candidates.append(f"{v}, India")
    if p and s:
        candidates.append(f"{p}, {s}, India")
    elif p:
        candidates.append(f"{p}, India")
    if d and s:
        candidates.append(f"{d}, {s}, India")
    elif d:
        candidates.append(f"{d}, India")

    # Remove duplicates while preserving order
    search_queries = []
    for c_term in candidates:
        if c_term and c_term not in search_queries:
            search_queries.append(c_term)

    if not search_queries:
        search_queries = ["Guntur, Andhra Pradesh, India"]

    # 4. Query live geocoding service across search candidates
    headers = {"User-Agent": settings.GEOCODING_USER_AGENT}
    try:
        async with httpx.AsyncClient(timeout=4.5) as client:
            for search_term in search_queries:
                params = {
                    "q": search_term,
                    "format": "json",
                    "addressdetails": "1",
                    "limit": "1",
                    "countrycodes": "in"
                }
                try:
                    resp = await client.get(settings.NOMINATIM_GEOCODE_URL, params=params, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        if data and len(data) > 0:
                            item = data[0]
                            lat = float(item["lat"])
                            lng = float(item["lon"])
                            addr = item.get("address", {})

                            found_village = (
                                addr.get("village")
                                or addr.get("town")
                                or addr.get("city")
                                or addr.get("suburb")
                                or village_town
                                or (query or "Target Location")
                            )
                            found_block = (
                                addr.get("county")
                                or addr.get("subdistrict")
                                or block
                                or "Mandal"
                            )
                            found_dist = (
                                addr.get("state_district")
                                or addr.get("county")
                                or district
                                or "District"
                            )
                            found_state = (
                                addr.get("state")
                                or state
                                or "State"
                            )
                            found_pin = addr.get("postcode") or pin_candidate or "000000"
                            bounding = [float(bbox) for bbox in item.get("boundingbox", [])] if item.get("boundingbox") else None

                            return GeocodeResponse(
                                latitude=lat,
                                longitude=lng,
                                display_name=item.get("display_name", f"{found_village}, {found_dist}"),
                                village_town=found_village,
                                block=found_block,
                                district=found_dist,
                                state=found_state,
                                pincode=found_pin,
                                formatted_address=item.get("display_name", f"{found_village}, {found_dist}, {found_state}"),
                                is_approximate=False,
                                bounding_box=bounding
                            )
                except Exception as query_err:
                    logger.debug(f"Candidate query '{search_term}' failed: {query_err}")
    except Exception as e:
        logger.warning(f"Live Nominatim lookup failed: {e}. Checking regional fallback.")

    # 5. Check regional dictionary for district name match
    dist_key = (district or "").lower().strip()
    if not dist_key and query:
        dist_key = query.lower().strip()
    if not dist_key and village_town:
        dist_key = village_town.lower().strip()
    
    for key, c in DISTRICT_COORDS.items():
        if key in dist_key or dist_key in key:
            v_name = village_town or c["district"]
            return GeocodeResponse(
                latitude=c["lat"],
                longitude=c["lng"],
                display_name=f"{v_name}, {c['district']}, {c['state']}, India",
                village_town=v_name,
                block=block or c["block"],
                district=c["district"],
                state=c["state"],
                pincode=pin_candidate or c["pincode"],
                formatted_address=f"{v_name}, {c['district']}, {c['state']}, India",
                is_approximate=True
            )

    # 6. Default reliable Indian rural benchmark (Guntur District Center)
    fallback = DISTRICT_COORDS["guntur"]
    v_name = village_town or query or "Rural Village"
    d_name = district or fallback["district"]
    s_name = state or fallback["state"]
    return GeocodeResponse(
        latitude=fallback["lat"],
        longitude=fallback["lng"],
        display_name=f"{v_name}, {d_name}, {s_name}, India",
        village_town=v_name,
        block=block or fallback["block"],
        district=d_name,
        state=s_name,
        pincode=pin_candidate or fallback["pincode"],
        formatted_address=f"{v_name}, {d_name}, {s_name}, India",
        is_approximate=True
    )
