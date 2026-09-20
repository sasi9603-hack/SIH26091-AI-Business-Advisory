import uuid
from datetime import datetime
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.core.database import SessionLocal, engine, Base
from app.models import (
    User,
    Location,
    BusinessCategory,
    Business,
    Competitor,
    CensusData,
    UdyamData,
    MarketIndicator,
    BusinessPlan,
    FinancialPlan,
    GovernmentScheme,
    SchemeDocument,
    AdvisoryReportModel
)
from database.seed_data import seed_development_database

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    seed_development_database()
    yield

def test_13_tables_exist_and_queryable():
    """Verify that all 13 required SIH26091 tables exist in the database."""
    db: Session = SessionLocal()
    try:
        # 1. users
        assert db.query(User).count() >= 0
        # 2. locations
        assert db.query(Location).count() >= 1
        # 3. business_categories
        assert db.query(BusinessCategory).count() >= 7
        # 4. businesses
        assert db.query(Business).count() >= 0
        # 5. competitors
        assert db.query(Competitor).count() >= 0
        # 6. census_data
        assert db.query(CensusData).count() >= 1
        # 7. udyam_data
        assert db.query(UdyamData).count() >= 1
        # 8. market_indicators
        assert db.query(MarketIndicator).count() >= 0
        # 9. business_plans
        assert db.query(BusinessPlan).count() >= 0
        # 10. financial_plans
        assert db.query(FinancialPlan).count() >= 0
        # 11. government_schemes
        assert db.query(GovernmentScheme).count() >= 2
        # 12. scheme_documents
        assert db.query(SchemeDocument).count() >= 5
        # 13. advisory_reports
        assert db.query(AdvisoryReportModel).count() >= 0
        print("\n[PASS] All 13 SIH26091 database tables verified and queryable.")
    finally:
        db.close()

def test_seed_data_tagging_and_freshness():
    """Verify that development seed data is explicitly flagged and tagged."""
    db: Session = SessionLocal()
    try:
        # Check BusinessCategory seed records
        seeded_cats = db.query(BusinessCategory).filter_by(is_seed_data=True).all()
        assert len(seeded_cats) >= 7
        for cat in seeded_cats:
            assert cat.is_seed_data is True
            assert cat.id in ["agro-repair", "grocery", "tailoring", "dairy", "food-processing", "bakery", "solar-repair"]

        # Check GovernmentScheme seed records
        seeded_schemes = db.query(GovernmentScheme).filter_by(is_seed_data=True).all()
        assert len(seeded_schemes) >= 2
        for s in seeded_schemes:
            assert s.is_seed_data is True
            assert s.data_freshness == "DEVELOPMENT_SEED_ONLY"
            assert s.id in ["micro-finance", "term-loan"]

        # Check SchemeDocument seed records
        seeded_docs = db.query(SchemeDocument).filter_by(is_seed_data=True).all()
        assert len(seeded_docs) >= 5
        for doc in seeded_docs:
            assert doc.is_seed_data is True

        # Check Location seed records
        loc_seed = db.query(Location).filter_by(pincode="522201").first()
        assert loc_seed is not None
        assert loc_seed.is_seed_data is True
        assert loc_seed.data_freshness == "DEVELOPMENT_SEED_ONLY"

        print("[PASS] Development seed records strictly tagged with is_seed_data=True and data_freshness='DEVELOPMENT_SEED_ONLY'.")
    finally:
        db.close()

def test_schemes_api_reads_from_database():
    """Verify that GET /api/v1/schemes/all serves schemes from the database."""
    resp = client.get("/api/v1/schemes/all")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 2
    scheme_ids = [s["id"] for s in data]
    assert "micro-finance" in scheme_ids
    assert "term-loan" in scheme_ids
    print("[PASS] Schemes API correctly queries database government_schemes.")

def test_census_api_reads_from_database():
    """Verify that GET /api/v1/census/demographics serves census data from the database."""
    resp = client.get("/api/v1/census/demographics?pincode=522201&district=Guntur")
    assert resp.status_code == 200
    data = resp.json()
    assert data["pincode"] == "522201"
    assert data["district"] == "Guntur"
    assert data["total_population"] == 18450
    print("[PASS] Census demographics API returns database records.")

def test_udyam_api_reads_from_database():
    """Verify that GET /api/v1/udyam/stats serves registered MSME statistics from the database."""
    resp = client.get("/api/v1/udyam/stats?district=Guntur")
    assert resp.status_code == 200
    data = resp.json()
    assert data["district"] == "Guntur"
    assert data["total_enterprises"] >= 51
    print("[PASS] UDYAM statistics API returns database records.")

def test_community_report_persists_to_database():
    """Verify that submitting a community report creates a real record in the businesses table with is_seed_data=False."""
    unique_name = f"Test Rural Store {uuid.uuid4().hex[:6]}"
    payload = {
        "business_name": unique_name,
        "category": "grocery",
        "latitude": 16.3050,
        "longitude": 80.4400,
        "address": "Main Bazar Road, Near Panchayat Office"
    }
    resp = client.post("/api/competitors/community-report", json=payload)
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True

    db: Session = SessionLocal()
    try:
        biz_rec = db.query(Business).filter_by(name=unique_name).first()
        assert biz_rec is not None
        assert biz_rec.source == "COMMUNITY"
        assert biz_rec.is_seed_data is False
        assert biz_rec.data_freshness == "LIVE_COMMUNITY_REPORT"
        assert biz_rec.verification_status == "UNVERIFIED"
        print(f"[PASS] Community report persisted to database 'businesses' table with is_seed_data=False (ID: {biz_rec.id})")
    finally:
        db.close()

def test_advisory_evaluation_persists_plans_to_database():
    """Verify that running an AI advisory viability evaluation persists business_plans, financial_plans, and advisory_reports."""
    payload = {
        "business_category": "agro-repair",
        "proposed_budget": 12000,
        "village_town": "Tenali",
        "district": "Guntur",
        "state": "Andhra Pradesh",
        "pincode": "522201",
        "radius_km": 3.0
    }
    resp = client.post("/api/v1/ai-agent/evaluate-viability", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["report"] is not None
    assert data["financials"] is not None

    db: Session = SessionLocal()
    try:
        # Check that business_plans, financial_plans, and advisory_reports have recorded data
        latest_plan = db.query(BusinessPlan).order_by(BusinessPlan.created_at.desc()).first()
        assert latest_plan is not None
        assert latest_plan.category_id == "agro-repair"
        assert latest_plan.available_margin_capital == 12000

        fin_plan = db.query(FinancialPlan).filter_by(business_plan_id=latest_plan.id).first()
        assert fin_plan is not None
        assert fin_plan.total_project_cost > 0
        assert fin_plan.eligible_loan_amt > 0

        adv_rep = db.query(AdvisoryReportModel).filter_by(business_plan_id=latest_plan.id).first()
        assert adv_rep is not None
        assert adv_rep.verdict in ["START", "CONSIDER", "AVOID"]
        print(f"[PASS] Complete Advisory Evaluation persisted across business_plans, financial_plans, and advisory_reports.")
    finally:
        db.close()
