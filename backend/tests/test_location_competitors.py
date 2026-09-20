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

def test_geocoding_required_test_cases():
    """Verify all 5 required test cases from user specification."""
    # TEST 1: Yadadri Bhuvanagiri, Telangana (PIN 508116)
    r1 = client.post("/api/location/geocode", json={
        "state": "Telangana",
        "district": "Yadadri Bhuvanagiri",
        "mandal": "Yadadri Bhuvanagiri",
        "villageTown": "Yadadri Bhuvanagiri",
        "pincode": "508116"
    })
    assert r1.status_code == 200, f"Test 1 failed: {r1.text}"
    d1 = r1.json()
    assert 17.40 <= d1["latitude"] <= 17.60, f"Test 1 lat out of range: {d1['latitude']}"
    assert 78.80 <= d1["longitude"] <= 79.00, f"Test 1 lng out of range: {d1['longitude']}"
    assert "telangana" in d1["state"].lower()
    assert "andhra pradesh" not in d1["state"].lower()
    print(f"\n[PASS] TEST 1: Yadadri Bhuvanagiri -> Lat: {d1['latitude']}, Lng: {d1['longitude']}, State: {d1['state']}")

    # TEST 2: Hyderabad, Telangana (PIN 500001)
    r2 = client.post("/api/location/geocode", json={
        "state": "Telangana",
        "district": "Hyderabad",
        "mandal": "Hyderabad",
        "villageTown": "Abids",
        "pincode": "500001"
    })
    assert r2.status_code == 200, f"Test 2 failed: {r2.text}"
    d2 = r2.json()
    assert 17.30 <= d2["latitude"] <= 17.50, f"Test 2 lat out of range: {d2['latitude']}"
    assert 78.40 <= d2["longitude"] <= 78.60, f"Test 2 lng out of range: {d2['longitude']}"
    assert "telangana" in d2["state"].lower()
    print(f"[PASS] TEST 2: Hyderabad -> Lat: {d2['latitude']}, Lng: {d2['longitude']}, State: {d2['state']}")

    # TEST 3: Vijayawada, Andhra Pradesh (PIN 520001)
    r3 = client.post("/api/location/geocode", json={
        "state": "Andhra Pradesh",
        "district": "NTR",
        "mandal": "Vijayawada",
        "villageTown": "Vijayawada",
        "pincode": "520001"
    })
    assert r3.status_code == 200, f"Test 3 failed: {r3.text}"
    d3 = r3.json()
    assert 16.45 <= d3["latitude"] <= 16.60, f"Test 3 lat out of range: {d3['latitude']}"
    assert 80.55 <= d3["longitude"] <= 80.70, f"Test 3 lng out of range: {d3['longitude']}"
    assert "andhra pradesh" in d3["state"].lower()
    print(f"[PASS] TEST 3: Vijayawada -> Lat: {d3['latitude']}, Lng: {d3['longitude']}, State: {d3['state']}")

    # TEST 4: Guntur, Andhra Pradesh (PIN 522001)
    r4 = client.post("/api/location/geocode", json={
        "state": "Andhra Pradesh",
        "district": "Guntur",
        "mandal": "Guntur",
        "villageTown": "Guntur",
        "pincode": "522001"
    })
    assert r4.status_code == 200, f"Test 4 failed: {r4.text}"
    d4 = r4.json()
    assert 16.20 <= d4["latitude"] <= 16.40, f"Test 4 lat out of range: {d4['latitude']}"
    assert 80.35 <= d4["longitude"] <= 80.55, f"Test 4 lng out of range: {d4['longitude']}"
    assert "andhra pradesh" in d4["state"].lower()
    print(f"[PASS] TEST 4: Guntur -> Lat: {d4['latitude']}, Lng: {d4['longitude']}, State: {d4['state']}")

    # TEST 5: Rural Telangana village (Gajwel, Siddipet, PIN 502278)
    r5 = client.post("/api/location/geocode", json={
        "state": "Telangana",
        "district": "Siddipet",
        "mandal": "Gajwel",
        "villageTown": "Gajwel",
        "pincode": "502278"
    })
    assert r5.status_code == 200, f"Test 5 failed: {r5.text}"
    d5 = r5.json()
    assert 17.75 <= d5["latitude"] <= 17.95, f"Test 5 lat out of range: {d5['latitude']}"
    assert 78.55 <= d5["longitude"] <= 78.80, f"Test 5 lng out of range: {d5['longitude']}"
    assert "telangana" in d5["state"].lower()
    print(f"[PASS] TEST 5: Gajwel, Siddipet -> Lat: {d5['latitude']}, Lng: {d5['longitude']}, State: {d5['state']}")

def test_invalid_location_returns_404_no_fallback():
    """Verify that unverified / mismatched locations return explicit 404 without silent fallback to Guntur."""
    resp = client.post("/api/location/geocode", json={
        "state": "Telangana",
        "district": "FakeNonExistentDistrictXYZ999",
        "villageTown": "NonExistentVillageXYZ999",
        "pincode": "999999"
    })
    assert resp.status_code == 404, f"Expected 404 for invalid location, got: {resp.status_code}"
    err_detail = resp.json()["detail"]
    assert "Could not verify this location" in err_detail
    print(f"\n[PASS] test_invalid_location_returns_404_no_fallback -> Correctly rejected with 404: '{err_detail}'")

if __name__ == "__main__":
    test_geocode_structured_location()
    test_geocode_pincode()
    test_geocoding_required_test_cases()
    test_invalid_location_returns_404_no_fallback()
    test_competitor_search_bakery()
    test_competitor_search_grocery()
    test_competitor_search_pharmacy_and_clothing()
    test_community_report_integration()
    print("\n>>> ALL HYPER-LOCAL GEOLOCATION & COMPETITOR TESTS PASSED! <<<")
