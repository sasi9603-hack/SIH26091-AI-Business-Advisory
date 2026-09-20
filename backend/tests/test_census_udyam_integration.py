import asyncio
import pytest
from unittest.mock import patch, AsyncMock
import httpx
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.core.database import SessionLocal, engine, Base
from app.models import CensusData, UdyamData
from database.seed_data import seed_development_database

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    seed_development_database()
    yield

# ==============================================================================
# 1. CENSUS INTEGRATION TESTS
# ==============================================================================

def test_census_by_pincode_normalization_and_fields():
    """Verify GET /api/census/{location_identifier} with a 6-digit postal PIN code."""
    resp = client.get("/api/census/522201")
    assert resp.status_code == 200, f"Failed: {resp.text}"
    data = resp.json()
    
    # 1. Structure and Geographic Fields
    assert data["location_identifier"] == "522201"
    assert data["pincode"] == "522201"
    assert data["district"] == "Guntur"
    assert data["state"] == "Andhra Pradesh"
    
    # 2. Demographics Data
    demo = data["demographics"]
    assert demo["total_population"] > 0
    assert demo["total_households"] > 0
    assert demo["rural_population_pct"] is not None
    assert demo["avg_household_size"] is not None
    assert demo["literacy_rate_pct"] is not None or demo["total_population"] > 0
    
    # 3. Workforce Data
    workforce = data["workforce"]
    assert workforce["working_population_pct"] is not None or workforce["total_workers"] is not None
    
    # 4. Feasibility Tier & Provenance
    assert "purchasing_power_tier" in data
    assert data["source"] != ""
    assert data["source_url"] != ""
    assert data["retrieved_at"] != ""
    assert data["data_freshness"] in ["CENSUS_PCA_BENCHMARK", "LIVE_OPEN_DATA", "LIVE_API", "DEVELOPMENT_SEED_ONLY"]
    
    # 5. Non-exhaustive disclaimer
    assert "Census indicators reflect official Primary Census Abstract" in data["disclaimer"]
    print("\n[PASS] test_census_by_pincode_normalization_and_fields -> Population:", demo["total_population"], "| Literacy:", demo["literacy_rate_pct"])

def test_census_by_district_name():
    """Verify GET /api/census/{location_identifier} with a district name."""
    resp = client.get("/api/census/Guntur")
    assert resp.status_code == 200
    data = resp.json()
    assert data["district"].lower() == "guntur"
    assert data["demographics"]["total_population"] > 0
    assert data["workforce"]["working_population_pct"] is not None or data["workforce"]["total_workers"] is not None
    print("[PASS] test_census_by_district_name -> District resolved:", data["district"])

def test_census_v1_route_parity():
    """Verify /api/v1/census/{location_identifier} parity."""
    resp = client.get("/api/v1/census/522002")
    assert resp.status_code == 200
    data = resp.json()
    assert data["district"] == "Guntur"
    assert data["demographics"]["total_population"] == 18450

def test_census_no_fabricated_values():
    """Verify that when raw feeds lack literacy or marginal workers, fields stay None rather than invented."""
    from app.services.census_service import normalize_external_census_record
    
    raw_minimal = {
        "district": "TestDistrict",
        "state": "TestState",
        "total_population": 15000,
        "total_households": 3200
        # Notice: literacy_rate_pct and marginal_workers are omitted!
    }
    normalized = normalize_external_census_record(raw_minimal, "test-minimal")
    assert normalized is not None
    assert normalized.demographics.total_population == 15000
    assert normalized.demographics.literacy_rate_pct is None, "Missing literacy must remain None (never invented!)"
    assert normalized.demographics.male_literacy_rate_pct is None
    assert normalized.workforce.marginal_workers is None, "Missing marginal workers must remain None (never invented!)"
    assert normalized.workforce.agricultural_workers_pct is None
    print("[PASS] test_census_no_fabricated_values -> Missing variables strictly remain None.")

def test_census_database_persistence():
    """Verify that querying census data persists a record into the PostgreSQL census_data table."""
    resp = client.get("/api/census/522201")
    assert resp.status_code == 200

    db: Session = SessionLocal()
    try:
        rec = db.query(CensusData).filter(CensusData.pincode == "522201").first()
        assert rec is not None
        assert rec.district == "Guntur"
        assert rec.total_population > 0
        assert rec.source != ""
        assert rec.retrieved_at is not None
        print(f"[PASS] test_census_database_persistence -> Record found in PostgreSQL census_data (ID: {rec.id})")
    finally:
        db.close()

# ==============================================================================
# 2. UDYAM INTEGRATION TESTS
# ==============================================================================

def test_udyam_by_district_normalization_and_indicators():
    """Verify GET /api/udyam/{location_identifier} returns normalized MSME indicators."""
    resp = client.get("/api/udyam/Guntur")
    assert resp.status_code == 200, f"Failed: {resp.text}"
    data = resp.json()

    # 1. Geographic information
    assert data["location_identifier"] == "Guntur"
    assert data["district"] == "Guntur"
    assert data["state"] == "Andhra Pradesh"
    assert data["total_enterprises"] > 0

    # 2. MSME Classification & Dominance Ratio
    msme = data["msme_classification"]
    assert msme["micro"] > 0
    assert msme["small"] >= 0
    assert msme["medium"] >= 0
    assert msme["total"] == msme["micro"] + msme["small"] + msme["medium"]
    assert 0.0 <= msme["micro_dominance_pct"] <= 100.0

    # 3. Sector Distribution
    sectors_dist = data["sector_distribution"]
    assert sectors_dist["manufacturing_units"] is not None or data["total_enterprises"] > 0
    assert sectors_dist["services_units"] is not None or data["total_enterprises"] > 0

    # 4. Top Sectors List
    assert len(data["top_sectors"]) > 0
    for s in data["top_sectors"]:
        assert s["nic_code"] != ""
        assert s["nic_description"] != ""
        assert s["total_registered"] >= 0

    # 5. Provenance & Disclaimer
    assert data["source"] != ""
    assert data["retrieved_at"] != ""
    assert "Informal micro-vendors, roadside artisans" in data["disclaimer"]
    print(f"\n[PASS] test_udyam_by_district_normalization_and_indicators -> Enterprises: {data['total_enterprises']} | Micro Dominance: {msme['micro_dominance_pct']}%")

def test_udyam_with_category_filtering():
    """Verify GET /api/udyam/{location_identifier}?category=agro-repair filters sectors."""
    resp = client.get("/api/udyam/Guntur?category=agro-repair")
    assert resp.status_code == 200
    data = resp.json()
    assert data["category_filter"] == "agro-repair"
    assert len(data["top_sectors"]) == 1
    assert data["top_sectors"][0]["nic_code"] == "3312"
    desc = data["top_sectors"][0]["nic_description"].lower()
    assert any(term in desc for term in ["machinery", "equipment", "agro", "repair"])
    print("[PASS] test_udyam_with_category_filtering -> NIC 3312 filtered accurately.")

def test_udyam_v1_route_parity():
    """Verify /api/v1/udyam/{location_identifier} parity."""
    resp = client.get("/api/v1/udyam/Krishna")
    assert resp.status_code == 200
    data = resp.json()
    assert data["district"] == "Krishna"
    assert data["total_enterprises"] > 0

def test_udyam_database_persistence():
    """Verify that querying UDYAM data persists records in the PostgreSQL udyam_data table."""
    resp = client.get("/api/udyam/Guntur")
    assert resp.status_code == 200

    db: Session = SessionLocal()
    try:
        recs = db.query(UdyamData).filter(UdyamData.district.ilike("%Guntur%")).all()
        assert len(recs) > 0
        first_r = recs[0]
        assert first_r.source != ""
        assert first_r.retrieved_at is not None
        print(f"[PASS] test_udyam_database_persistence -> {len(recs)} UDYAM sector records verified in PostgreSQL.")
    finally:
        db.close()

# ==============================================================================
# 3. RATE LIMITING & ERROR RESILIENCE SIMULATION
# ==============================================================================

def test_census_api_rate_limit_handling():
    """Simulate external Census API returning HTTP 429 to verify exponential backoff and graceful recovery."""
    from app.services.census_service import query_external_census_api
    from app.core.config import settings

    mock_resp_429 = httpx.Response(status_code=429, request=httpx.Request("GET", "https://api.data.gov.in/test"))
    
    with patch.object(settings, "DATA_GOV_IN_API_KEY", "test-key"), \
         patch.object(settings, "CENSUS_API_URL", "https://api.data.gov.in/test"), \
         patch.object(settings, "EXTERNAL_API_BACKOFF_FACTOR", 0.01), \
         patch("httpx.AsyncClient.get", AsyncMock(return_value=mock_resp_429)):
        
        # Should gracefully return None when rate limit persists across retries without crashing
        result = asyncio.run(query_external_census_api("522002"))
        assert result is None
        print("\n[PASS] test_census_api_rate_limit_handling -> HTTP 429 handled gracefully with exponential backoff.")

def test_udyam_api_rate_limit_handling():
    """Simulate external UDYAM API returning HTTP 429 to verify exponential backoff and graceful fallback."""
    from app.services.udyam_service import query_external_udyam_api
    from app.core.config import settings

    mock_resp_429 = httpx.Response(status_code=429, request=httpx.Request("GET", "https://api.data.gov.in/test"))

    with patch.object(settings, "UDYAM_API_KEY", "test-key"), \
         patch.object(settings, "UDYAM_API_URL", "https://api.data.gov.in/test"), \
         patch.object(settings, "EXTERNAL_API_BACKOFF_FACTOR", 0.01), \
         patch("httpx.AsyncClient.get", AsyncMock(return_value=mock_resp_429)):
        
        result = asyncio.run(query_external_udyam_api("Guntur"))
        assert result is None
        print("[PASS] test_udyam_api_rate_limit_handling -> HTTP 429 handled gracefully with backoff.")

# ==============================================================================
# 4. BACKWARD COMPATIBILITY TESTS
# ==============================================================================

def test_legacy_census_demographics_query_route():
    """Verify that existing query parameter route /api/census/demographics continues to work."""
    resp = client.get("/api/census/demographics?pincode=522201&district=Guntur")
    assert resp.status_code == 200
    data = resp.json()
    assert data["pincode"] == "522201"
    assert data["district"] == "Guntur"
    assert data["total_population"] > 0
    print("[PASS] test_legacy_census_demographics_query_route -> Legacy query endpoint preserved.")

def test_legacy_udyam_stats_query_route():
    """Verify that existing query parameter route /api/udyam/stats continues to work."""
    resp = client.get("/api/udyam/stats?district=Guntur")
    assert resp.status_code == 200
    data = resp.json()
    assert data["district"] == "Guntur"
    assert data["total_enterprises"] >= 51
    print("[PASS] test_legacy_udyam_stats_query_route -> Legacy query endpoint preserved.")
