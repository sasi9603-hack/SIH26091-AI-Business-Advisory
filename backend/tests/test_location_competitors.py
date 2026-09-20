import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_geocode_structured_location():
    """Test geocoding with state, district, mandal, village."""
    payload = {
        "state": "Andhra Pradesh",
        "district": "Guntur",
        "mandal": "Tenali",
        "villageTown": "Tenali"
    }
    resp = client.post("/api/location/geocode", json=payload)
    assert resp.status_code == 200, f"Geocode failed: {resp.text}"
    data = resp.json()
    assert "latitude" in data
    assert "longitude" in data
    assert data["latitude"] != 0.0
    assert data["district"] == "Guntur"
    assert "display_name" in data
    print("\n[PASS] test_geocode_structured_location -> Coords:", data["latitude"], data["longitude"])

def test_geocode_pincode():
    """Test geocoding with a 6-digit postal PIN code."""
    payload = {"pincode": "522002"}
    resp = client.post("/api/location/geocode", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert round(data["latitude"], 2) == 16.31
    assert round(data["longitude"], 2) == 80.44
    assert data["pincode"] == "522002"
    print("[PASS] test_geocode_pincode -> PIN 522002 resolved to:", data["district"])

def test_competitor_search_bakery():
    """Test competitor search for bakery category."""
    payload = {
        "latitude": 16.3067,
        "longitude": 80.4365,
        "business_category": "bakery",
        "radius_km": 3.0
    }
    resp = client.post("/api/competitors/search", json=payload)
    assert resp.status_code == 200, f"Search failed: {resp.text}"
    data = resp.json()
    assert "competitor_count" in data
    assert "businesses" in data
    assert "businesses found in available map data" in data["disclaimer"]
    
    # Verify sorting by distance in ascending order
    distances = [b["distance_km"] for b in data["businesses"]]
    assert distances == sorted(distances), "Businesses must be sorted by distance in ascending order"
    print(f"[PASS] test_competitor_search_bakery -> Found {data['competitor_count']} bakeries. Nearest: {distances[0] if distances else 'N/A'} km")

def test_competitor_search_grocery():
    """Test competitor search for grocery category (supermarket/convenience)."""
    payload = {
        "latitude": 16.3067,
        "longitude": 80.4365,
        "business_category": "grocery",
        "radius_km": 2.5
    }
    resp = client.post("/api/competitors/search", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "disclaimer" in data
    assert data["business_category"] == "grocery"
    for b in data["businesses"]:
        assert b["name"] != "", "Business name must not be empty"
        assert b["latitude"] != 0.0
        assert b["longitude"] != 0.0
    print(f"[PASS] test_competitor_search_grocery -> Found {data['competitor_count']} grocery businesses")

def test_competitor_search_pharmacy_and_clothing():
    """Test competitor search for pharmacy and clothing categories."""
    for category in ["pharmacy", "clothing", "restaurant", "cafe"]:
        payload = {
            "latitude": 16.3067,
            "longitude": 80.4365,
            "business_category": category,
            "radius_km": 3.0
        }
        resp = client.post("/api/competitors/search", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["business_category"] == category
        assert "businesses found in available map data" in data["disclaimer"]
        print(f"[PASS] Category '{category}' -> {data['competitor_count']} businesses retrieved")

def test_community_report_integration():
    """Test that community reported businesses are reflected in competitor search."""
    # 1. Submit community report
    report_payload = {
        "business_name": "Sri Sai Local Tailoring Shop",
        "category": "tailoring",
        "latitude": 16.3070,
        "longitude": 80.4368,
        "address": "Opposite Gram Panchayat Office, Village Center"
    }
    r_rep = client.post("/api/competitors/community-report", json=report_payload)
    assert r_rep.status_code == 200
    assert r_rep.json()["success"] is True

    # 2. Search for tailoring competitors in the same area
    search_payload = {
        "latitude": 16.3067,
        "longitude": 80.4365,
        "business_category": "tailoring",
        "radius_km": 2.0
    }
    r_search = client.post("/api/competitors/search", json=search_payload)
    assert r_search.status_code == 200
    results = r_search.json()
    names = [b["name"] for b in results["businesses"]]
    assert "Sri Sai Local Tailoring Shop" in names
    print("[PASS] test_community_report_integration -> Community report found in search results!")

if __name__ == "__main__":
    test_geocode_structured_location()
    test_geocode_pincode()
    test_competitor_search_bakery()
    test_competitor_search_grocery()
    test_competitor_search_pharmacy_and_clothing()
    test_community_report_integration()
    print("\n>>> ALL HYPER-LOCAL GEOLOCATION & COMPETITOR TESTS PASSED! <<<")
