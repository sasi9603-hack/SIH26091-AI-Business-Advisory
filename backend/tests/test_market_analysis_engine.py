import pytest
import math
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal, engine, Base
from database.seed_data import seed_development_database

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    seed_development_database()
    yield

def test_market_analyze_endpoint_structure():
    """Verify POST /api/market/analyze returns all required indicator dimensions."""
    payload = {
        "business_category": "agro-repair",
        "latitude": 16.2435,
        "longitude": 80.6402,
        "radius_km": 3.0,
        "pincode": "522201",
        "district": "Guntur",
        "state": "Andhra Pradesh",
        "village_town": "Tenali"
    }
    resp = client.post("/api/market/analyze", json=payload)
    assert resp.status_code == 200, f"Failed: {resp.text}"
    data = resp.json()

    assert "location_summary" in data
    assert "competitor_rings" in data
    assert "census_demographics" in data
    assert "udyam_enterprises" in data
    assert "nearby_facilities" in data
    assert "feasibility_score" in data
    assert "feasibility_verdict" in data
    assert "operating_windows" in data
    assert "seasonal_factors" in data
    assert "sourcing_logistics" in data
    assert data["provenance_disclaimer"] != ""
    print("\n[PASS] test_market_analyze_endpoint_structure -> Complete response structure verified.")

def test_competitor_distance_rings_and_density_calculation():
    """Verify distance ring counts (1km <= 3km <= 5km) and mathematical competitor density formula."""
    payload = {
        "business_category": "agro-repair",
        "latitude": 16.2435,
        "longitude": 80.6402,
        "radius_km": 3.0,
        "pincode": "522201"
    }
    resp = client.post("/api/market/analyze", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    rings = data["competitor_rings"]

    assert rings["within_1km"] <= rings["within_3km"]
    assert rings["within_3km"] <= rings["within_5km"]
    assert rings["total_in_radius"] >= 0

    area = math.pi * (3.0 ** 2)
    expected_density = round(rings["total_in_radius"] / area, 2)
    assert rings["competitor_density_per_sq_km"] == expected_density
    assert "pi *" in rings["density_formula"]
    assert rings["source"] != ""
    assert rings["data_freshness"] != ""
    print(f"[PASS] test_competitor_distance_rings_and_density_calculation -> Rings: 1km={rings['within_1km']}, 3km={rings['within_3km']}, 5km={rings['within_5km']}, Density={rings['competitor_density_per_sq_km']}/km^2")

def test_census_demographics_integration_and_caveat():
    """Verify census demographics are returned with explicit caveat that population does not equal demand."""
    payload = {
        "business_category": "grocery",
        "pincode": "522201",
        "district": "Guntur"
    }
    resp = client.post("/api/market/analyze", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    census = data["census_demographics"]

    assert census["total_population"] is not None and census["total_population"] > 0
    assert census["total_households"] is not None and census["total_households"] > 0
    assert census["rural_population_pct"] is not None
    assert census["working_population_pct"] is not None
    assert "population does not directly equal" in census["caveat"].lower() or "does not directly equal" in census["caveat"].lower()
    assert census["source"] != ""
    print(f"[PASS] test_census_demographics_integration_and_caveat -> Pop: {census['total_population']}, Households: {census['total_households']}, Non-demand caveat verified.")

def test_udyam_enterprise_indicators_integration():
    """Verify UDYAM indicators capture MSME counts, micro dominance %, and informal disclaimer."""
    payload = {
        "business_category": "agro-repair",
        "pincode": "522201",
        "district": "Guntur"
    }
    resp = client.post("/api/market/analyze", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    udyam = data["udyam_enterprises"]

    assert udyam["total_registered_msmes"] > 0
    assert udyam["micro_enterprises_count"] > 0
    assert 0.0 <= udyam["micro_dominance_pct"] <= 100.0
    assert udyam["category_registered_count"] is not None or udyam["total_registered_msmes"] > 0
    assert "informal micro-vendors" in udyam["disclaimer"].lower() or "informal" in udyam["disclaimer"].lower()
    assert udyam["source"] != ""
    print(f"[PASS] test_udyam_enterprise_indicators_integration -> MSMEs: {udyam['total_registered_msmes']}, Micro Dominance: {udyam['micro_dominance_pct']}%")

def test_nearby_facilities_indicators():
    """Verify civic, financial, commercial, and transit facility indicators."""
    payload = {
        "business_category": "agro-repair",
        "latitude": 16.2435,
        "longitude": 80.6402,
        "radius_km": 3.0
    }
    resp = client.post("/api/market/analyze", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    fac = data["nearby_facilities"]

    assert fac["total_facilities_count"] >= 0
    assert fac["financial_facilities_count"] >= 0
    assert fac["commercial_facilities_count"] >= 0
    assert fac["transit_facilities_count"] >= 0
    assert fac["civic_facilities_count"] >= 0
    assert fac["source"] != ""
    assert fac["data_freshness"] != ""
    print(f"[PASS] test_nearby_facilities_indicators -> Total facilities: {fac['total_facilities_count']} (Fin: {fac['financial_facilities_count']}, Com: {fac['commercial_facilities_count']}, Trn: {fac['transit_facilities_count']})")

def test_zero_demand_fabrication_guarantee():
    """Verify that fake daily footfall counts or fabricated sales demands are NOT returned."""
    payload = {
        "business_category": "bakery",
        "pincode": "522201"
    }
    resp = client.post("/api/market/analyze", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert "dailyFootfallRange" not in data
    for w in data["operating_windows"]:
        assert "title" in w
        assert "timing" in w
        assert "level" in w
    print("[PASS] test_zero_demand_fabrication_guarantee -> No fabricated transaction demand claims.")

def test_market_analyze_v1_parity():
    """Verify /api/v1/market/analyze route parity."""
    payload = {
        "business_category": "tailoring",
        "pincode": "522201"
    }
    resp = client.post("/api/v1/market/analyze", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["business_category"] == "tailoring"
    assert data["competitor_rings"]["within_5km"] >= 0
    print("[PASS] test_market_analyze_v1_parity -> /api/v1/market/analyze parity verified.")

def test_legacy_market_feasibility_backward_compatibility():
    """Verify legacy POST /api/v1/market/feasibility remains operational."""
    payload = {"category": "agro-repair"}
    resp = client.post("/api/v1/market/feasibility", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["feasibilityScore"] > 0
    assert data["feasibilityVerdict"] in ["HIGH VIABILITY", "MODERATE VIABILITY", "NEEDS CAUTION"]
    print("[PASS] test_legacy_market_feasibility_backward_compatibility -> Legacy endpoint preserved.")

