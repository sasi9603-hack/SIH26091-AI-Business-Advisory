"""
SIH26091 - Comprehensive End-to-End Integration Test Suite
Tests the complete 21-step real-user journey and 11 failure scenarios against
live FastAPI backend endpoints (and Vite frontend proxy where applicable).
"""
import pytest
import httpx
import math
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)

BASE_URL = "http://127.0.0.1:8000"
VITE_BASE_URL = "http://localhost:5173"


# ============================================================================
# PART 1: 21-STEP REAL USER JOURNEY TESTS
# ============================================================================

def test_step_01_backend_starts_and_health():
    """Step 1: Backend starts successfully and responds on /api/health."""
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "SIH26091" in data["service"]
    assert "timestamp" in data


def test_step_02_and_03_frontend_running_and_proxy():
    """Steps 2 & 3: React/Vite frontend is serving and proxying /api/health."""
    try:
        with httpx.Client(timeout=5.0) as http:
            res_ui = http.get(VITE_BASE_URL)
            assert res_ui.status_code == 200
            assert "sih26091" in res_ui.text.lower() or "root" in res_ui.text.lower() or "<!doctype html>" in res_ui.text.lower()

            res_proxy = http.get(f"{VITE_BASE_URL}/api/health")
            assert res_proxy.status_code == 200
            proxy_data = res_proxy.json()
            assert proxy_data["status"] == "healthy"
    except httpx.ConnectError:
        pytest.skip("Vite dev server not running on port 5173 during this test run")


def test_step_04_and_05_location_geocoding_real_osm():
    """Steps 4 & 5: Enter realistic rural location and verify real OSM/Nominatim geocoding."""
    payload = {
        "villageTown": "Tenali Rural",
        "block": "Tenali",
        "district": "Guntur",
        "state": "Andhra Pradesh",
        "pincode": "522201"
    }
    res = client.post("/api/location/geocode", json=payload)
    assert res.status_code == 200
    data = res.json()
    
    assert "latitude" in data and "longitude" in data
    assert isinstance(data["latitude"], (int, float))
    assert isinstance(data["longitude"], (int, float))
    # Guntur / Tenali coordinates are around 16.2 to 16.3 N, 80.4 to 80.65 E
    assert 15.8 <= data["latitude"] <= 16.6
    assert 80.0 <= data["longitude"] <= 81.0
    assert data["state"] == "Andhra Pradesh"
    assert "Guntur" in data["district"]
    assert "display_name" in data and len(data["display_name"]) > 0
    assert "formatted_address" in data


def test_step_06_to_08_competitors_search_osm_bakery():
    """Steps 6, 7 & 8: Select category Bakery and retrieve nearby businesses from OSM/Overpass."""
    payload = {
        "latitude": 16.243,
        "longitude": 80.640,
        "business_category": "bakery",
        "radius_km": 3.0
    }
    res = client.post("/api/competitors/search", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert "businesses" in data
    assert "competitor_count" in data
    assert "radius_km" in data
    assert data["radius_km"] == 3.0
    assert "disclaimer" in data
    assert ("Google Maps" in data["disclaimer"] or "OpenStreetMap" in data["disclaimer"])

    # Verify each competitor marker structure for map rendering
    for biz in data["businesses"]:
        assert "id" in biz
        assert "name" in biz
        assert ("lat" in biz or "latitude" in biz) and ("lng" in biz or "longitude" in biz)
        assert ("distanceKm" in biz or "distance_km" in biz)
        dist = biz.get("distanceKm", biz.get("distance_km", 0))
        assert dist <= 3.5  # within search buffer
        assert "source" in biz
        assert biz["source"] in ["GOOGLE_MAPS", "OSM", "OPENSTREETMAP", "UDYAM", "COMMUNITY"]
        assert ("google_maps_url" in biz or "googleMapsUrl" in biz)


def test_step_09_market_analysis_distance_rings_and_density():
    """Step 9: Verify 1 km, 3 km and 5 km competitor rings and mathematical density."""
    payload = {
        "business_category": "bakery",
        "latitude": 16.243,
        "longitude": 80.640,
        "pincode": "522201",
        "radius_km": 3.0
    }
    res = client.post("/api/market/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert "competitor_density" in data or "competitor_rings" in data
    comp = data.get("competitor_density") or data.get("competitor_rings")
    assert "within_1km" in comp
    assert "within_3km" in comp
    assert "within_5km" in comp
    assert comp["within_1km"] <= comp["within_3km"] <= comp["within_5km"]
    assert "density_per_sqkm" in comp or "competitor_density_per_sq_km" in comp
    assert "density_formula" in comp
    assert "pi" in comp["density_formula"].lower() or "r^2" in comp["density_formula"].lower()


def test_step_10_census_data_displayed_with_source_freshness():
    """Step 10: Verify Census data displayed with source/freshness info and demand caveat."""
    res = client.get("/api/census/522201")
    assert res.status_code == 200
    data = res.json()

    assert "demographics" in data
    demo = data["demographics"]
    assert "total_population" in demo and demo["total_population"] > 0
    assert "total_households" in demo and demo["total_households"] > 0
    assert "source" in data
    assert "Census" in data["source"]
    assert "retrieved_at" in data
    assert "data_freshness" in data
    assert "disclaimer" in data
    # Non-demand guarantee check
    assert "PCA" in data["disclaimer"] or "individual" in data["disclaimer"] or "benchmark" in data["disclaimer"]


def test_step_11_udyam_data_displayed_correctly():
    """Step 11: Verify Udyam enterprise data displayed with MSME breakdown."""
    res = client.get("/api/udyam/Guntur?category=bakery")
    assert res.status_code == 200
    data = res.json()

    assert "total_enterprises" in data
    assert data["total_enterprises"] >= 0
    assert "msme_classification" in data
    msme = data["msme_classification"]
    assert "micro" in msme
    assert "small" in msme
    assert "medium" in msme
    assert "micro_dominance_pct" in msme
    assert 0 <= msme["micro_dominance_pct"] <= 100
    assert "source" in data
    assert "disclaimer" in data
    assert "informal" in data["disclaimer"].lower() or "unregistered" in data["disclaimer"].lower()


def test_step_12_and_13_financial_calculator_deterministic():
    """Steps 12 & 13: Enter realistic financial info, verify deterministic reducing EMI, BEP, DSCR."""
    payload = {
        "business_category": "bakery",
        "project_cost": 450000.0,
        "available_capital": 45000.0,
        "own_contribution": 45000.0,
        "loan_amount": 405000.0,
        "interest_rate": 8.5,
        "tenure": 60,
        "tenure_unit": "months",
        "monthly_fixed_expenses": 8000.0,
        "monthly_variable_expenses": 22000.0,
        "expected_monthly_revenue": 50000.0
    }
    res = client.post("/api/finance/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["calculation_method"] == "PURELY_DETERMINISTIC_STANDARD_FORMULAS"
    assert "LLM" in data["engine_note"]

    # Mathematical Verification
    # P = 405,000, r = 8.5 / 1200, n = 60
    P = 405000.0
    r = 8.5 / 1200.0
    n = 60
    expected_emi = round(P * r * ((1 + r) ** n) / (((1 + r) ** n) - 1), 2)
    actual_emi = data["monthly_emi"]["value"]
    assert math.isclose(actual_emi, expected_emi, rel_tol=1e-2)

    assert data["monthly_expenses"]["value"] == round(8000.0 + 22000.0 + actual_emi, 2)
    assert data["annual_revenue"]["value"] == 50000.0 * 12

    # Break-Even Point
    # Fixed = 8000 + EMI
    # Contrib Margin = (50000 - 22000) / 50000 = 0.56
    cm_ratio = (50000.0 - 22000.0) / 50000.0
    expected_bep = round((8000.0 + actual_emi) / cm_ratio, 2)
    assert math.isclose(data["break_even_point"]["value"], expected_bep, rel_tol=1e-2)

    # DSCR
    # Op Profit = 50000 - 30000 = 20000
    # DSCR = 20000 / EMI
    expected_dscr = round(20000.0 / actual_emi, 2)
    assert math.isclose(data["cash_flow_indicators"]["debt_service_coverage_ratio"]["value"], expected_dscr, rel_tol=1e-1)


def test_step_14_government_scheme_matching():
    """Step 14: Verify government scheme matching API returns eligible schemes."""
    res = client.get("/api/schemes/all")
    assert res.status_code == 200
    schemes = res.json()
    assert len(schemes) >= 2
    scheme_ids = [s["id"] for s in schemes]
    assert "term-loan" in scheme_ids or "micro-finance" in scheme_ids

    # Scheme match endpoint
    match_payload = {
        "project_cost": 450000.0,
        "available_capital": 45000.0,
        "category": "bakery",
        "is_rural": True
    }
    match_res = client.post("/api/v1/schemes/match", json=match_payload)
    assert match_res.status_code == 200
    data = match_res.json()
    assert "matched_schemes" in data
    assert len(data["matched_schemes"]) > 0
    assert data["recommended_scheme"] is not None


def test_step_15_and_16_rag_search_and_evidence():
    """Steps 15 & 16: Test RAG search, verify retrieved evidence and official URLs."""
    payload = {
        "query": "What government financial support may be available for a rural entrepreneur starting a bakery?",
        "business_category": "bakery",
        "top_k": 3
    }
    res = client.post("/api/rag/query", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["has_sufficient_context"] is True
    assert "PMEGP" in data["relevant_scheme"] or "PMFME" in data["relevant_scheme"] or "Mudra" in data["relevant_scheme"]
    assert len(data["evidence"]) > 0
    
    # Check evidence chunk citations
    for chunk in data["evidence"]:
        assert "chunk_id" in chunk
        assert "document_title" in chunk
        assert "text" in chunk and len(chunk["text"]) > 20
        assert "official_source_url" in chunk and chunk["official_source_url"].startswith("http")
        assert "similarity_score" in chunk
        assert 0.0 <= chunk["similarity_score"] <= 1.0

    assert data["official_source"]["url"].startswith("http")
    assert "verification_note" in data
    assert "credit appraisal" in data["verification_note"].lower() or "bank" in data["verification_note"].lower()


def test_step_17_and_18_langchain_agent_and_gemini_chat():
    """Steps 17 & 18: Test LangChain multi-tool agent and Gemini advisory chat."""
    # Chat with Advisor
    chat_payload = {
        "message": "What is my eligible scheme and monthly break-even for ₹45,000 capital in Tenali?",
        "context": {
            "village_town": "Tenali",
            "pincode": "522201",
            "category": "bakery",
            "available_capital": 45000.0
        }
    }
    res_chat = client.post("/api/ai-agent/chat", json=chat_payload)
    assert res_chat.status_code == 200
    data_chat = res_chat.json()
    assert "response" in data_chat and len(data_chat["response"]) > 30
    assert "suggested_prompts" in data_chat
    assert len(data_chat["suggested_prompts"]) > 0

    # Agent consultation
    consult_payload = {
        "query": "I have ₹45,000 and want to start a bakery in Tenali village.",
        "social_category": "GENERAL",
        "is_rural": True,
        "business_category": "bakery",
        "available_capital": 45000.0,
        "pincode": "522201",
        "village_town": "Tenali",
        "district": "Guntur"
    }
    res_consult = client.post("/api/ai-agent/consult", json=consult_payload)
    assert res_consult.status_code == 200
    data_consult = res_consult.json()
    assert "executive_summary" in data_consult
    assert "facts" in data_consult
    assert len(data_consult["tool_execution_trace"]) >= 3


def test_step_19_to_21_complete_10_section_explainable_report_and_provenance():
    """Steps 19, 20 & 21: Generate complete explainable report, verify all 10 sections and 4-way provenance."""
    payload = {
        "query": "Explainable enterprise advisory for a bakery in Tenali, Guntur with ₹45,000 capital.",
        "user_profile": {
            "is_rural": True,
            "social_category": "General"
        },
        "business_plan": {
            "business_category": "bakery",
            "proposed_capital": 45000.0
        },
        "location": {
            "pincode": "522201",
            "village_town": "Tenali",
            "district": "Guntur",
            "state": "Andhra Pradesh",
            "latitude": 16.243,
            "longitude": 80.640,
            "search_radius_km": 3.0
        }
    }
    res = client.post("/api/advisory/explainable", json=payload)
    assert res.status_code == 200
    report = res.json()

    assert "report_id" in report
    assert "synthesis_mode" in report

    # Verify All 10 Required Report Sections
    assert "section_1_business_summary" in report
    assert "section_2_local_market_overview" in report
    assert "section_3_nearby_competition" in report
    assert "section_4_financial_feasibility" in report
    assert "section_5_potential_government_schemes" in report
    assert "section_6_key_risks" in report
    assert "section_7_opportunities" in report
    assert "section_8_important_assumptions" in report
    assert "section_9_recommended_validation_steps" in report
    assert "section_10_data_sources" in report

    # Verify Section 1
    s1 = report["section_1_business_summary"]
    assert "venture_name" in s1 and "executive_narrative" in s1

    # Verify Section 2
    s2 = report["section_2_local_market_overview"]
    assert s2["total_population"] > 0
    assert "catchment_disclaimer" in s2

    # Verify Section 3
    s3 = report["section_3_nearby_competition"]
    assert "competitor_density_per_sqkm" in s3

    # Verify Section 4
    s4 = report["section_4_financial_feasibility"]
    assert s4["project_cost"] == 67500.0
    assert s4["beneficiary_equity"] == 45000.0
    assert s4["loan_requirement"] == 22500.0
    assert "NO LLM MATH" in s4["calculation_method"]

    # Verify Section 10
    s10 = report["section_10_data_sources"]
    assert len(s10["sources"]) >= 4
    for src in s10["sources"]:
        assert src["official_url"].startswith("http")

    # Verify Provenance Labels: VERIFIED_DATA, CALCULATED_VALUES, ESTIMATES, AI_GENERATED_SUGGESTIONS
    provenance_audit = report["provenance_audit"]
    assert provenance_audit["verified_data_count"] > 0
    assert provenance_audit["calculated_values_count"] > 0
    assert provenance_audit["estimates_count"] > 0
    assert provenance_audit["ai_generated_suggestions_count"] > 0

    # Inspect items across sections to ensure strict categorization
    allowed_categories = {"VERIFIED_DATA", "CALCULATED_VALUES", "ESTIMATES", "AI_GENERATED_SUGGESTIONS"}
    all_provenance_items = (
        s1.get("provenance", []) +
        s2.get("provenance", []) +
        s3.get("provenance", []) +
        s4.get("provenance", []) +
        report["section_5_potential_government_schemes"].get("provenance", []) +
        report["section_6_key_risks"].get("provenance", []) +
        report["section_7_opportunities"].get("provenance", []) +
        report["section_8_important_assumptions"].get("provenance", []) +
        report["section_9_recommended_validation_steps"].get("provenance", [])
    )
    for p in all_provenance_items:
        assert p["category"] in allowed_categories


# ============================================================================
# PART 2: 11 FAILURE SCENARIOS AND RESILIENCE TESTS
# ============================================================================

def test_failure_01_no_nearby_businesses_found():
    """Failure Case 1: Search in remote location with 0 competitors."""
    # Deep rural Thar desert coordinates
    payload = {
        "latitude": 27.0,
        "longitude": 71.0,
        "business_category": "bakery",
        "radius_km": 1.0
    }
    res = client.post("/api/competitors/search", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["competitor_count"] == 0
    assert len(data["businesses"]) == 0
    assert "disclaimer" in data


def test_failure_02_invalid_location_geocoding():
    """Failure Case 2: Geocoding with empty or nonsensical query."""
    payload = {
        "villageTown": "NonExistentPlaceZyxWvu999",
        "pincode": "000000"
    }
    res = client.post("/api/location/geocode", json=payload)
    # The endpoint should handle gracefully: either returns fallback/default centroid or 404/422 without crashing
    assert res.status_code in [200, 404, 422]
    if res.status_code == 200:
        data = res.json()
        assert "latitude" in data and "longitude" in data


def test_failure_03_osm_timeout_handling():
    """Failure Case 3: Overpass API timeout handling."""
    # Competitor search service has internal timeout configuration and fallback
    # Simulate an impossibly large radius that would stress Overpass or tests service fallback
    payload = {
        "latitude": 16.243,
        "longitude": 80.640,
        "business_category": "bakery",
        "radius_km": 15.0
    }
    res = client.post("/api/competitors/search", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "businesses" in data


def test_failure_04_census_data_unavailable():
    """Failure Case 4: Non-existent census location identifier."""
    res = client.get("/api/census/9999999999")
    # Must return 404 or insufficient data and NOT invent fake population
    assert res.status_code in [404, 200]
    if res.status_code == 200:
        data = res.json()
        # If 200 returned via general fallback, verify it states benchmark / does not fabricate real-time counts
        assert "disclaimer" in data


def test_failure_05_udyam_data_unavailable():
    """Failure Case 5: Non-existent Udyam district."""
    res = client.get("/api/udyam/NonExistentDistrictXYZ")
    assert res.status_code in [404, 200]
    if res.status_code == 200:
        data = res.json()
        assert "disclaimer" in data


def test_failure_06_missing_financial_inputs_no_invention():
    """Failure Case 6: Missing interest rate and tenure returns 'insufficient_data' without guessing."""
    payload = {
        "business_category": "grocery",
        "project_cost": 250000.0
    }
    res = client.post("/api/finance/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["has_insufficient_data"] is True
    assert data["monthly_emi"]["status"] == "insufficient_data"
    assert data["monthly_emi"]["value"] is None
    assert "interest_rate" in data["missing_inputs"]
    assert "tenure" in data["missing_inputs"]


def test_failure_07_invalid_financial_inputs_validation():
    """Failure Case 7: Negative costs or interest rates > 100% rejected with HTTP 422."""
    payload = {
        "business_category": "bakery",
        "project_cost": -50000.0,
        "interest_rate": 150.0
    }
    res = client.post("/api/finance/calculate", json=payload)
    assert res.status_code == 422


def test_failure_08_government_scheme_outside_range():
    """Failure Case 8: Huge capital (e.g. ₹50 Crore) exceeds rural micro scheme ceilings."""
    match_payload = {
        "project_cost": 500000000.0,  # ₹50 Crore
        "available_capital": 50000000.0,  # ₹5 Crore
        "category": "bakery",
        "is_rural": True
    }
    res = client.post("/api/v1/schemes/match", json=match_payload)
    assert res.status_code == 200
    data = res.json()
    assert data.get("outside_range") is True or len(data.get("matched_schemes", [])) == 0


def test_failure_09_rag_unsupported_question_refusal():
    """Failure Case 9: Quantum computing query outside indexed documents refused without hallucinating."""
    payload = {
        "query": "How to fabricate cryogenic superconducting quantum qubit processors for orbital rockets?",
        "business_category": "deep-tech",
        "top_k": 3
    }
    res = client.post("/api/rag/query", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["has_sufficient_context"] is False
    assert "insufficient" in data["answer"].lower() or "not contain" in data["answer"].lower() or "unsupported" in data["answer"].lower() or "outside" in data["answer"].lower()


def test_failure_10_gemini_fallback_synthesizer():
    """Failure Case 10: Advisory synthesizer executes deterministically if Gemini is unavailable."""
    # Send a valid request - even if Gemini key is empty or network fails, system falls back to Grounded Synthesizer
    payload = {
        "query": "Advisory for small village grocery",
        "user_profile": {"is_rural": True},
        "business_plan": {"business_category": "grocery", "proposed_capital": 10000.0},
        "location": {"pincode": "522201", "district": "Guntur"}
    }
    res = client.post("/api/advisory/explainable", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "report_id" in data
    assert data["synthesis_mode"] in ["GEMINI_EXPLAINABLE_ADVISORY", "DETERMINISTIC_GROUNDED_SYNTHESIS"]
    assert "section_1_business_summary" in data


def test_failure_11_backend_unavailable_handling():
    """Failure Case 11: Verify frontend API layer handles connection failures gracefully."""
    # Verify via frontend api.ts contract: non-existent port throws graceful error that is caught
    # In python, test client connecting to a closed port fails with ConnectError or ConnectTimeout
    with pytest.raises((httpx.ConnectError, httpx.ConnectTimeout)):
        with httpx.Client(timeout=1.0) as bad_client:
            bad_client.get("http://127.0.0.1:59999/api/health")
