import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine, init_postgis
from app.core.config import logger
from app.models import (
    BusinessCategory,
    GovernmentScheme,
    SchemeDocument,
    Location,
    Business,
    CensusData,
    UdyamData
)

SEED_FLAG = True
SEED_FRESHNESS = "DEVELOPMENT_SEED_ONLY"

def seed_development_database(db: Session = None) -> None:
    """
    Seeds initial reference data for local development and testing.
    All records inserted here are explicitly flagged as `is_seed_data = True`
    and `data_freshness = 'DEVELOPMENT_SEED_ONLY'`.
    """
    close_db = False
    if db is None:
        init_postgis()
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_db = True

    try:
        # 1. Seed Business Categories
        categories = [
            BusinessCategory(
                id="agro-repair",
                name="Agro-Machinery & Pump Repair",
                nic_code="3312",
                osm_tag_filter='["shop"~"agrarian|motorcycle_repair|hardware"]',
                standard_gross_margin_pct=40.0,
                base_fixed_costs=4500.0,
                description="Rural agricultural machinery, tractor implements, and irrigation pump motor maintenance.",
                is_seed_data=SEED_FLAG
            ),
            BusinessCategory(
                id="grocery",
                name="Kirana & Daily Provisions Store",
                nic_code="4711",
                osm_tag_filter='["shop"~"supermarket|convenience|general|grocery"]',
                standard_gross_margin_pct=18.0,
                base_fixed_costs=5000.0,
                description="Essential food grains, packaged FMCG, daily cooking oils, and general provision trade.",
                is_seed_data=SEED_FLAG
            ),
            BusinessCategory(
                id="tailoring",
                name="Garments & Tailoring Center",
                nic_code="1410",
                osm_tag_filter='["shop"="tailor"]',
                standard_gross_margin_pct=50.0,
                base_fixed_costs=3500.0,
                description="Custom garment cutting, bridal stitching, alterations, and school uniform manufacturing.",
                is_seed_data=SEED_FLAG
            ),
            BusinessCategory(
                id="dairy",
                name="Dairy Farm & Milk Chilling Unit",
                nic_code="0141",
                osm_tag_filter='["shop"~"dairy|farm"]',
                standard_gross_margin_pct=30.0,
                base_fixed_costs=6000.0,
                description="Bovine milk collection, fat & SNF testing, and value-added curd/ghee processing.",
                is_seed_data=SEED_FLAG
            ),
            BusinessCategory(
                id="food-processing",
                name="Grain / Spice Processing Mill",
                nic_code="1061",
                osm_tag_filter='["craft"~"grain_mill|confectionery"]',
                standard_gross_margin_pct=35.0,
                base_fixed_costs=7000.0,
                description="Custom flour milling, turmeric/chili spice pulverization, and agro-commodity grading.",
                is_seed_data=SEED_FLAG
            ),
            BusinessCategory(
                id="bakery",
                name="Rural Bakery & Confectionery",
                nic_code="1071",
                osm_tag_filter='["shop"="bakery"]',
                standard_gross_margin_pct=35.0,
                base_fixed_costs=5500.0,
                description="Fresh bread, sweet rusks, tea buns, and snack biscuits baking workshop.",
                is_seed_data=SEED_FLAG
            ),
            BusinessCategory(
                id="solar-repair",
                name="Solar Pump & Electrical Repair",
                nic_code="3314",
                osm_tag_filter='["shop"~"electrical|electronics"]',
                standard_gross_margin_pct=45.0,
                base_fixed_costs=4000.0,
                description="Solar inverter servicing, photovoltaic panel wiring, and rural household electrification.",
                is_seed_data=SEED_FLAG
            )
        ]

        for cat in categories:
            if not db.query(BusinessCategory).filter_by(id=cat.id).first():
                db.add(cat)
        db.commit()
        logger.info(f"Seeded {len(categories)} business categories.")

        # 2. Seed Official SIH26091 Government Schemes
        schemes = [
            GovernmentScheme(
                id="micro-finance",
                name="Micro Finance Scheme",
                short_code="MICRO-FIN",
                nodal_ministry="Ministry of MSME / Priority Rural Credit Facility",
                min_project_cost=0.0,
                max_project_cost=140000.0,
                max_loan_cap=125000.0,
                annual_interest_rate=6.5,
                tenure_years=3,
                moratorium_months=3,
                repayment_frequency="Quarterly",
                subsidy_support_label="Funding Up to 90% of Project Cost (Max ?1.25 Lakh)",
                target_beneficiaries="Small and micro business units in rural and semi-urban localities",
                key_features_json=[
                    "Project cost ceiling: Up to ?1.40 Lakh",
                    "Maximum eligible loan: ?1.25 Lakh",
                    "Concessional interest rate: 6.5% per annum",
                    "Repayment tenure: 3 Years with 3-Month Moratorium period",
                    "Quarterly debt servicing schedule"
                ],
                eligibility_conditions_json=[
                    "Total estimated project cost must not exceed ?1,40,000",
                    "Beneficiary contribution (Margin Capital) of at least 10%",
                    "Applicable for small/micro business trade and rural repair units",
                    "No prior institutional banking default"
                ],
                portal_url="https://www.jansamarth.in",
                nodal_agency="Public Sector Banks, Regional Rural Banks (RRBs), and MFIs",
                source="SIH26091 Problem Statement Specifications",
                source_url="https://www.jansamarth.in",
                data_freshness=SEED_FRESHNESS,
                is_seed_data=SEED_FLAG
            ),
            GovernmentScheme(
                id="term-loan",
                name="Term Loan Scheme",
                short_code="TERM-LOAN",
                nodal_ministry="Ministry of MSME / Scalable Enterprise Credit",
                min_project_cost=140000.01,
                max_project_cost=5000000.0,
                max_loan_cap=4500000.0,
                annual_interest_rate=8.0,
                tenure_years=7,
                moratorium_months=6,
                repayment_frequency="Quarterly",
                subsidy_support_label="Funding Up to 90% of Project Cost (Max ?45.00 Lakh)",
                target_beneficiaries="Larger micro-enterprise projects in rural & semi-urban clusters",
                key_features_json=[
                    "Project cost eligibility: > ?1.40 Lakh and <= ?50.00 Lakh",
                    "Maximum eligible loan: ?45.00 Lakh",
                    "Interest rate: 8.0% per annum",
                    "Repayment tenure: 7 Years with 6-Month Moratorium period",
                    "Quarterly debt servicing schedule"
                ],
                eligibility_conditions_json=[
                    "Project cost must be between ?1.40 Lakh and ?50.00 Lakh",
                    "Beneficiary contribution (Margin Capital) of at least 10%",
                    "Viable project plan for greenfield or capacity expansion micro-enterprise",
                    "Regular banking KYC verification"
                ],
                portal_url="https://www.jansamarth.in",
                nodal_agency="Commercial Banks, SIDBI, and Public Sector Lending Institutions",
                source="SIH26091 Problem Statement Specifications",
                source_url="https://www.jansamarth.in",
                data_freshness=SEED_FRESHNESS,
                is_seed_data=SEED_FLAG
            )
        ]

        for s in schemes:
            if not db.query(GovernmentScheme).filter_by(id=s.id).first():
                db.add(s)
        db.commit()
        logger.info("Seeded SIH26091 government schemes.")

        # 3. Seed Scheme Required Documents
        documents = [
            SchemeDocument(
                scheme_id="micro-finance",
                document_name="Aadhaar Card",
                description="Biometric identity and demographic verification",
                is_mandatory=True,
                issuing_authority="UIDAI",
                document_type="IDENTITY",
                is_seed_data=SEED_FLAG
            ),
            SchemeDocument(
                scheme_id="micro-finance",
                document_name="Gram Panchayat Business NOC",
                description="Gram Panchayat trade license or premises NOC",
                is_mandatory=True,
                issuing_authority="Gram Panchayat",
                document_type="RESIDENCE",
                is_seed_data=SEED_FLAG
            ),
            SchemeDocument(
                scheme_id="micro-finance",
                document_name="Equipment Quotation",
                description="Proforma invoice or initial machinery cost quotation",
                is_mandatory=True,
                issuing_authority="Equipment Dealer",
                document_type="PROJECT_REPORT",
                is_seed_data=SEED_FLAG
            ),
            SchemeDocument(
                scheme_id="term-loan",
                document_name="Detailed Project Report (DPR)",
                description="Comprehensive feasibility, cash flow, and CapEx schedule",
                is_mandatory=True,
                issuing_authority="Certified Financial Advisor / CA",
                document_type="PROJECT_REPORT",
                is_seed_data=SEED_FLAG
            ),
            SchemeDocument(
                scheme_id="term-loan",
                document_name="Bank Account Statement (6 Months)",
                description="Official operating savings or current bank passbook statements",
                is_mandatory=True,
                issuing_authority="Scheduled Commercial Bank",
                document_type="BANKING",
                is_seed_data=SEED_FLAG
            )
        ]

        for doc in documents:
            if not db.query(SchemeDocument).filter_by(scheme_id=doc.scheme_id, document_name=doc.document_name).first():
                db.add(doc)
        db.commit()
        logger.info(f"Seeded {len(documents)} scheme compliance documents.")

        # 4. Seed Development Test Benchmark Location (Tenali, Guntur)
        dev_loc = db.query(Location).filter_by(pincode="522201").first()
        if not dev_loc:
            dev_loc = Location(
                id=str(uuid.uuid4()),
                state="Andhra Pradesh",
                district="Guntur",
                block="Tenali Rural",
                village_town="Tenali",
                pincode="522201",
                hierarchy_level="TOWN",
                latitude=16.2435,
                longitude=80.6402,
                source="Development Benchmark Seed",
                source_url="https://www.openstreetmap.org",
                data_freshness=SEED_FRESHNESS,
                is_seed_data=SEED_FLAG
            )
            db.add(dev_loc)
            db.commit()
            logger.info("Seeded development benchmark testing location.")

        # 5. Seed Census Demographics Benchmark Data
        existing_census = db.query(CensusData).filter_by(pincode="522201").first()
        if not existing_census:
            dev_census = CensusData(
                id=str(uuid.uuid4()),
                location_id=dev_loc.id if dev_loc else None,
                pincode="522201",
                district="Guntur",
                state="Andhra Pradesh",
                total_population=18450,
                rural_population_pct=82.4,
                total_households=4120,
                working_population_pct=54.2,
                avg_household_size=4.4,
                literacy_rate_pct=67.8,
                total_workers=9998,
                main_workers=8500,
                marginal_workers=1498,
                purchasing_power_tier="Moderate Rural Agrarian",
                source="Census of India PCA Data / Seed",
                source_url="https://data.gov.in",
                data_freshness=SEED_FRESHNESS,
                is_seed_data=SEED_FLAG
            )
            db.add(dev_census)
            db.commit()
            logger.info("Seeded development census demographic benchmark.")
        else:
            if existing_census.literacy_rate_pct is None:
                existing_census.literacy_rate_pct = 67.8
                existing_census.male_literacy_rate_pct = 75.1
                existing_census.female_literacy_rate_pct = 60.5
                existing_census.total_workers = 9998
                existing_census.main_workers = 8500
                existing_census.marginal_workers = 1498
                db.commit()

        # 6. Seed UDYAM MSME Registration Benchmark Data
        existing_udyam = db.query(UdyamData).filter_by(district="Guntur", nic_code="3312").first()
        if not existing_udyam:
            dev_udyam = UdyamData(
                id=str(uuid.uuid4()),
                district="Guntur",
                state="Andhra Pradesh",
                nic_code="3312",
                nic_description="Repair and installation of machinery and equipment (Agro/Pumps)",
                micro_enterprise_count=42,
                small_enterprise_count=8,
                medium_enterprise_count=1,
                total_registered=51,
                manufacturing_count=45,
                services_count=6,
                source="Ministry of MSME / UDYAM Registry Seed",
                source_url="https://udyamregistration.gov.in",
                data_freshness=SEED_FRESHNESS,
                is_seed_data=SEED_FLAG
            )
            db.add(dev_udyam)
            db.commit()
            logger.info("Seeded development UDYAM registration benchmark.")
        else:
            if existing_udyam.manufacturing_count is None:
                existing_udyam.manufacturing_count = 45
                existing_udyam.services_count = 6
                db.commit()

        logger.info("Database seeding completed successfully. All development records tagged is_seed_data=True.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding development database: {e}")
        raise
    finally:
        if close_db:
            db.close()

if __name__ == "__main__":
    seed_development_database()
