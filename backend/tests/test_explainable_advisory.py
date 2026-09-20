# SIH26091 Explainable Gemini Advisory Layer Tests
import pytest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import SessionLocal, Base, engine
from app.models import AdvisoryReportModel, BusinessPlan, FinancialPlan
from app.schemas.advisory_report import (
    ExplainableAdvisoryRequest,
    UserProfileInput,
    BusinessPlanInput,
    LocationInput,
    ProvenanceCategory
)
from app.schemas.competitors import CompetitorItem
from app.services.explainable_advisory_service import generate_explainable_advisory_report
from app.services.rag_service import seed_rag_knowledge_base

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_explainable_test_db():
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_rag_knowledge_base(db)
    yield

# Mock data for fast deterministic test execution
MOCK_COMPETITORS = [
    CompetitorItem(
        id="osm-bakery-01",
        name="Sri Lakshmi Modern Bakery",
        category="bakery",
        source="OPENSTREETMAP",
        confidenceScore=0.92,
        verificationStatus="VERIFIED",
        distanceKm=0.75,
        lat=16.244,
        lng=80.641,
        address="Station Road, Tenali"
    ),
    CompetitorItem(
        id="osm-bakery-02",
        name="Vijaya Bakery & Confectionery",
        category="bakery",
        source="OPENSTREETMAP",
        confidenceScore=0.88,
        verificationStatus="VERIFIED",
        distanceKm=1.45,
        lat=16.248,
        lng=80.645,
        address="Bazaar Street, Tenali"
    )
]

MOCK_FACILITIES = {
    "total_facilities_count": 6,
    "financial_facilities_count": 2,
    "commercial_facilities_count": 2,
    "transit_facilities_count": 2,
    "civic_facilities_count": 0,
    "facilities_list": [],
    "source": "OpenStreetMap Infrastructure Benchmark",
    "data_freshness": "BENCHMARK_TEST"
}

def test_explainable_advisory_all_ten_sections_present():
    """
    Verifies that the generated explainable advisory contains all 10 required sections:
    1. Business summary
    2. Local market overview
    3. Nearby competition
    4. Financial feasibility
    5. Potential government schemes
    6. Key risks
    7. Opportunities
    8. Important assumptions
    9. Recommended validation steps
    10. Data sources
    """
    import asyncio

    req = ExplainableAdvisoryRequest(
        user_profile=UserProfileInput(
            name="Ramesh Kumar",
            social_category="GENERAL",
            is_rural=True
        ),
        business_plan=BusinessPlanInput(
            business_category="bakery",
            proposed_capital=300000.0,
            scale="Micro Enterprise"
        ),
        location=LocationInput(
            pincode="522201",
            village_town="Tenali",
            district="Guntur",
            state="Andhra Pradesh",
            search_radius_km=3.0
        )
    )

    with patch("app.services.explainable_advisory_service.fetch_osm_competitors", AsyncMock(return_value=MOCK_COMPETITORS)):
        with patch("app.services.explainable_advisory_service.fetch_nearby_facilities", AsyncMock(return_value=MOCK_FACILITIES)):
            with SessionLocal() as db:
                report = asyncio.run(generate_explainable_advisory_report(req, db=db))

            # 1. Business summary
            assert report.section_1_business_summary.category == "bakery"
            assert "₹300,000" in report.section_1_business_summary.executive_narrative or "300,000" in report.section_1_business_summary.executive_narrative
            assert len(report.section_1_business_summary.provenance) >= 2

            # 2. Local market overview
            assert report.section_2_local_market_overview.total_population is not None
            assert report.section_2_local_market_overview.total_population > 0
            assert "conflated" in report.section_2_local_market_overview.catchment_disclaimer.lower() or "guaranteed" in report.section_2_local_market_overview.catchment_disclaimer.lower()

            # 3. Nearby competition
            assert report.section_3_nearby_competition.competitor_count_radius == 2
            assert report.section_3_nearby_competition.nearest_competitor_km == 0.75
            assert report.section_3_nearby_competition.competitor_density_per_sqkm >= 0

            # 4. Financial feasibility
            assert report.section_4_financial_feasibility.project_cost == 450000.0
            assert report.section_4_financial_feasibility.beneficiary_equity == 300000.0
            assert report.section_4_financial_feasibility.loan_requirement == 150000.0
            assert report.section_4_financial_feasibility.monthly_emi == 3041.46
            assert report.section_4_financial_feasibility.break_even_monthly_revenue == 23418.64
            assert "DETERMINISTIC" in report.section_4_financial_feasibility.calculation_method

            # 5. Potential government schemes
            assert report.section_5_potential_government_schemes.primary_recommended_scheme == "Term Loan Scheme"
            assert len(report.section_5_potential_government_schemes.matched_schemes) >= 1
            assert len(report.section_5_potential_government_schemes.official_portal_urls) >= 2

            # 6. Key risks
            assert len(report.section_6_key_risks.risks) >= 3
            risk_titles = [r["risk_title"] for r in report.section_6_key_risks.risks]
            assert any("informal" in t.lower() or "competition" in t.lower() for t in risk_titles)

            # 7. Opportunities
            assert len(report.section_7_opportunities.opportunities) >= 3
            opp_titles = [o["opportunity_title"] for o in report.section_7_opportunities.opportunities]
            assert any("transit" in t.lower() or "flavor" in t.lower() or "differentiation" in t.lower() or "institutional" in t.lower() for t in opp_titles)

            # 8. Important assumptions
            assert len(report.section_8_important_assumptions.assumptions) >= 3
            params = [a["parameter"] for a in report.section_8_important_assumptions.assumptions]
            assert any("margin" in p.lower() for p in params)
            assert any("interest" in p.lower() for p in params)

            # 9. Recommended validation steps
            assert len(report.section_9_recommended_validation_steps.validation_steps) >= 4
            step_titles = [s["title"] for s in report.section_9_recommended_validation_steps.validation_steps]
            assert any("panchayat" in t.lower() or "audit" in t.lower() or "quotations" in t.lower() for t in step_titles)

            # 10. Data sources
            assert len(report.section_10_data_sources.sources) >= 4
            source_names = [s.dataset_name for s in report.section_10_data_sources.sources]
            assert any("census" in s.lower() for s in source_names)
            assert any("udyam" in s.lower() for s in source_names)
            assert any("openstreetmap" in s.lower() for s in source_names)

def test_provenance_labels_strictly_categorized():
    """
    Verifies that every provenance item is explicitly tagged with one of:
    - VERIFIED_DATA
    - CALCULATED_VALUES
    - ESTIMATES
    - AI_GENERATED_SUGGESTIONS
    and that all 4 categories are present in the final audit breakdown.
    """
    import asyncio

    req = ExplainableAdvisoryRequest(
        query="I have ₹3 lakh and want to start a bakery in my village."
    )

    with patch("app.services.explainable_advisory_service.fetch_osm_competitors", AsyncMock(return_value=MOCK_COMPETITORS)):
        with patch("app.services.explainable_advisory_service.fetch_nearby_facilities", AsyncMock(return_value=MOCK_FACILITIES)):
            with SessionLocal() as db:
                report = asyncio.run(generate_explainable_advisory_report(req, db=db))

            audit = report.provenance_audit

            # All 4 categories must have positive counts
            assert audit.verified_data_count > 0, "Must have verified data items"
            assert audit.calculated_values_count > 0, "Must have calculated values items"
            assert audit.estimates_count > 0, "Must have estimate items"
            assert audit.ai_generated_suggestions_count > 0, "Must have AI suggestions items"

            # Check specific verification statements
            assert any("census" in item.lower() or "population" in item.lower() for item in audit.verified_data_items)
            assert any("emi" in item.lower() or "project cost" in item.lower() or "break-even" in item.lower() for item in audit.calculated_values_items)
            assert any("assumed" in item.lower() or "saturation" in item.lower() or "turnover" in item.lower() or "disclaimer" in item.lower() for item in audit.estimates_items)
            assert any("jan samarth" in item.lower() or "panchayat" in item.lower() or "differentiate" in item.lower() or "staple" in item.lower() for item in audit.ai_suggestions_items)

def test_financial_feasibility_strictly_matches_deterministic_formulas():
    """
    Ensures that financial values in the explainable report match the deterministic formulas
    and are NOT hallucinated or altered by Gemini.
    """
    import asyncio

    req = ExplainableAdvisoryRequest(
        business_plan=BusinessPlanInput(
            business_category="bakery",
            proposed_capital=300000.0
        )
    )

    with patch("app.services.explainable_advisory_service.fetch_osm_competitors", AsyncMock(return_value=MOCK_COMPETITORS)):
        with patch("app.services.explainable_advisory_service.fetch_nearby_facilities", AsyncMock(return_value=MOCK_FACILITIES)):
            with SessionLocal() as db:
                report = asyncio.run(generate_explainable_advisory_report(req, db=db))

            fin = report.section_4_financial_feasibility
            # Project cost: 300,000 * 1.5 = 450,000
            assert fin.project_cost == 450000.0
            # Loan: 450,000 - 300,000 = 150,000
            assert fin.loan_requirement == 150000.0
            # EMI: P * r * (1+r)^n / ((1+r)^n - 1) for 150,000 @ 8% for 60 months
            assert fin.monthly_emi == 3041.46
            # Total repayment: 3041.46 * 60 = 182,487.60
            assert fin.total_repayment == 182487.6
            # Interest: 182,487.60 - 150,000 = 32,487.60
            assert fin.total_interest == 32487.6
            # Break-even monthly revenue: (12500 + 3041.46) / (1 - (18500/55000))
            assert fin.break_even_monthly_revenue == 23418.64

def test_data_sources_contain_official_urls():
    """
    Verifies that Section 10 (Data Sources) references authoritative government & OpenStreetMap URLs.
    """
    import asyncio

    req = ExplainableAdvisoryRequest(
        query="I have ₹3 lakh and want to start a bakery in my village."
    )

    with patch("app.services.explainable_advisory_service.fetch_osm_competitors", AsyncMock(return_value=MOCK_COMPETITORS)):
        with patch("app.services.explainable_advisory_service.fetch_nearby_facilities", AsyncMock(return_value=MOCK_FACILITIES)):
            with SessionLocal() as db:
                report = asyncio.run(generate_explainable_advisory_report(req, db=db))

            sources = report.section_10_data_sources.sources
            assert len(sources) >= 4
            for s in sources:
                assert s.official_url.startswith("http")
                assert s.data_type in ["VERIFIED_DATA", "CALCULATED_VALUES"]

def test_explainable_advisory_api_endpoints():
    """
    Verifies HTTP POST /api/advisory/explainable and /api/v1/advisory/explainable.
    """
    payload = {
        "query": "I have ₹3 lakh and want to start a bakery in my village."
    }

    with patch("app.services.explainable_advisory_service.fetch_osm_competitors", AsyncMock(return_value=MOCK_COMPETITORS)):
        with patch("app.services.explainable_advisory_service.fetch_nearby_facilities", AsyncMock(return_value=MOCK_FACILITIES)):
            # 1. Test POST /api/advisory/explainable
            resp1 = client.post("/api/advisory/explainable", json=payload)
            assert resp1.status_code == 200, f"Error: {resp1.text}"
            data1 = resp1.json()
            assert "report_id" in data1
            assert "section_1_business_summary" in data1
            assert "section_10_data_sources" in data1
            assert data1["provenance_audit"]["verified_data_count"] > 0
            assert data1["section_4_financial_feasibility"]["monthly_emi"] == 3041.46

            # 2. Test POST /api/v1/advisory/explainable
            resp2 = client.post("/api/v1/advisory/explainable", json=payload)
            assert resp2.status_code == 200, f"Error: {resp2.text}"
            data2 = resp2.json()
            assert "report_id" in data2
            assert data2["section_4_financial_feasibility"]["monthly_emi"] == 3041.46

            # 3. Test POST /api/ai-agent/explainable-advisory
            resp3 = client.post("/api/ai-agent/explainable-advisory", json=payload)
            assert resp3.status_code == 200, f"Error: {resp3.text}"
            data3 = resp3.json()
            assert "report_id" in data3
            assert data3["section_4_financial_feasibility"]["monthly_emi"] == 3041.46

def test_explainable_advisory_database_persistence():
    """
    Verifies that generated advisory reports are persisted into the PostgreSQL database.
    """
    payload = {
        "query": "I have ₹3 lakh and want to start a bakery in my village."
    }

    with patch("app.services.explainable_advisory_service.fetch_osm_competitors", AsyncMock(return_value=MOCK_COMPETITORS)):
        with patch("app.services.explainable_advisory_service.fetch_nearby_facilities", AsyncMock(return_value=MOCK_FACILITIES)):
            resp = client.post("/api/advisory/explainable", json=payload)
            assert resp.status_code == 200
            data = resp.json()
            report_id = data["report_id"]

            with SessionLocal() as db:
                saved = db.query(AdvisoryReportModel).filter_by(id=report_id).first()
                assert saved is not None
                assert saved.opportunity_score > 0
                assert saved.matched_scheme_id == "term-loan-scheme"
                assert saved.business_plan_id is not None
                assert saved.financial_plan_id is not None

