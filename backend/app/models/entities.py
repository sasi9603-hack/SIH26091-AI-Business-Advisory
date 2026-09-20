import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    JSON
)
from sqlalchemy.types import TypeDecorator
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from ..core.database import Base

class SafePointGeometry(TypeDecorator):
    """
    PostGIS Geometry(POINT, 4326) on PostgreSQL.
    Safely falls back to String(100) on SQLite development fallback to prevent SpatiaLite function errors.
    """
    impl = String
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(Geometry(geometry_type="POINT", srid=4326))
        return dialect.type_descriptor(String(100))

    def process_bind_param(self, value, dialect):
        if dialect.name != "postgresql" and value is not None:
            return str(value)
        return value

try:
    from pgvector.sqlalchemy import Vector
    HAS_PGVECTOR = True
except ImportError:
    HAS_PGVECTOR = False

class SafeVector(TypeDecorator):
    """
    pgvector Vector(768) on PostgreSQL.
    Safely falls back to JSON on SQLite/development database to preserve vector embedding arrays.
    """
    impl = JSON
    cache_ok = True

    def __init__(self, dim: int = 768, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.dim = dim

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql" and HAS_PGVECTOR:
            return dialect.type_descriptor(Vector(self.dim))
        return dialect.type_descriptor(JSON)

    def process_bind_param(self, value, dialect):
        return value

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        if hasattr(value, "tolist"):
            return value.tolist()
        return value

def generate_uuid() -> str:
    return str(uuid.uuid4())

# 1. users
class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    full_name = Column(String(100), nullable=False)
    phone_number = Column(String(15), unique=True, nullable=False, index=True)
    email = Column(String(100), nullable=True)
    social_category = Column(String(20), default="GENERAL") # GENERAL, OBC, SC, ST, MINORITY
    gender = Column(String(10), default="MALE") # MALE, FEMALE, OTHER
    is_rural = Column(Boolean, default=True)
    age = Column(Integer, default=25)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    business_plans = relationship("BusinessPlan", back_populates="user")

# 2. locations
class Location(Base):
    __tablename__ = "locations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    block = Column(String(100), nullable=True, index=True) # Mandal / Block
    village_town = Column(String(100), nullable=False, index=True)
    pincode = Column(String(10), nullable=False, index=True)
    lgd_code = Column(String(20), nullable=True) # Local Government Directory Code
    hierarchy_level = Column(String(30), default="VILLAGE") # VILLAGE, TOWN, BLOCK, DISTRICT, STATE
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    geom = Column(SafePointGeometry, nullable=True)
    source = Column(String(100), default="OpenStreetMap / Census of India")
    source_url = Column(String(255), default="https://www.openstreetmap.org")
    retrieved_at = Column(DateTime, default=datetime.utcnow)
    data_freshness = Column(String(50), default="LIVE_GEOCODE")
    is_seed_data = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    businesses = relationship("Business", back_populates="location")

# 3. business_categories
class BusinessCategory(Base):
    __tablename__ = "business_categories"

    id = Column(String(50), primary_key=True) # e.g. agro-repair, grocery, tailoring, bakery
    name = Column(String(100), nullable=False)
    nic_code = Column(String(10), nullable=True)
    osm_tag_filter = Column(String(255), nullable=False)
    standard_gross_margin_pct = Column(Float, default=35.0)
    base_fixed_costs = Column(Float, default=4500.0)
    description = Column(Text, nullable=True)
    is_seed_data = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    businesses = relationship("Business", back_populates="category_rel")

# 4. businesses
class Business(Base):
    __tablename__ = "businesses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(150), nullable=False, index=True)
    category_id = Column(String(50), ForeignKey("business_categories.id"), nullable=False, index=True)
    location_id = Column(String(36), ForeignKey("locations.id"), nullable=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    geom = Column(SafePointGeometry, nullable=True)
    address = Column(Text, nullable=False)
    source = Column(String(50), default="OPENSTREETMAP") # UDYAM, OPENSTREETMAP, COMMUNITY, FIELD_SURVEY
    source_url = Column(String(255), nullable=True)
    source_id = Column(String(100), nullable=True)
    verification_status = Column(String(30), default="VERIFIED") # VERIFIED, UNVERIFIED
    confidence_score = Column(Float, default=0.85)
    retrieved_at = Column(DateTime, default=datetime.utcnow)
    data_freshness = Column(String(50), default="LIVE_API")
    upvotes = Column(Integer, default=0)
    is_seed_data = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    category_rel = relationship("BusinessCategory", back_populates="businesses")
    location = relationship("Location", back_populates="businesses")

# 5. competitors
class Competitor(Base):
    __tablename__ = "competitors"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    target_location_id = Column(String(36), ForeignKey("locations.id"), nullable=False, index=True)
    business_id = Column(String(36), ForeignKey("businesses.id"), nullable=False, index=True)
    category = Column(String(50), nullable=False)
    distance_km = Column(Float, nullable=False)
    retrieved_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    is_seed_data = Column(Boolean, default=False)

    business = relationship("Business")

# 6. census_data
class CensusData(Base):
    __tablename__ = "census_data"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    location_id = Column(String(36), ForeignKey("locations.id"), nullable=True, index=True)
    pincode = Column(String(10), nullable=False, index=True)
    district = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    total_population = Column(Integer, default=18450)
    rural_population_pct = Column(Float, default=82.4)
    total_households = Column(Integer, default=4120)
    working_population_pct = Column(Float, default=54.2)
    avg_household_size = Column(Float, default=4.4)
    purchasing_power_tier = Column(String(50), default="Moderate Rural Agrarian")
    
    # Granular business feasibility demographic indicators (strictly nullable - no invented values)
    literacy_rate_pct = Column(Float, nullable=True)
    male_literacy_rate_pct = Column(Float, nullable=True)
    female_literacy_rate_pct = Column(Float, nullable=True)
    total_workers = Column(Integer, nullable=True)
    main_workers = Column(Integer, nullable=True)
    marginal_workers = Column(Integer, nullable=True)
    agricultural_workers_pct = Column(Float, nullable=True)
    raw_payload_json = Column(JSON, nullable=True)

    source = Column(String(100), default="Census of India / data.gov.in")
    source_url = Column(String(255), default="https://data.gov.in")
    retrieved_at = Column(DateTime, default=datetime.utcnow)
    data_freshness = Column(String(50), default="CENSUS_PCA_BENCHMARK")
    is_seed_data = Column(Boolean, default=False)

# 7. udyam_data
class UdyamData(Base):
    __tablename__ = "udyam_data"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    district = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False)
    nic_code = Column(String(10), nullable=False)
    nic_description = Column(Text, nullable=False)
    micro_enterprise_count = Column(Integer, default=42)
    small_enterprise_count = Column(Integer, default=8)
    medium_enterprise_count = Column(Integer, default=1)
    total_registered = Column(Integer, default=51)
    
    # Granular MSME indicators
    micro_dominance_pct = Column(Float, nullable=True)
    manufacturing_count = Column(Integer, nullable=True)
    services_count = Column(Integer, nullable=True)
    raw_payload_json = Column(JSON, nullable=True)

    source = Column(String(100), default="Ministry of MSME / UDYAM Registration Registry")
    source_url = Column(String(255), default="https://udyamregistration.gov.in")
    retrieved_at = Column(DateTime, default=datetime.utcnow)
    data_freshness = Column(String(50), default="UDYAM_OFFICIAL_REGISTRY")
    is_seed_data = Column(Boolean, default=False)

# 8. market_indicators
class MarketIndicator(Base):
    __tablename__ = "market_indicators"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    location_id = Column(String(36), ForeignKey("locations.id"), nullable=True, index=True)
    category_id = Column(String(50), ForeignKey("business_categories.id"), nullable=False, index=True)
    catchment_population = Column(Integer, default=16500)
    estimated_daily_footfall_min = Column(Integer, default=35)
    estimated_daily_footfall_max = Column(Integer, default=55)
    saturation_index = Column(Float, default=0.24)
    saturation_level = Column(String(30), default="LOW")
    opportunity_gap_label = Column(String(255), nullable=True)
    nearest_hub_name = Column(String(150), nullable=True)
    nearest_hub_distance_km = Column(Float, default=5.0)
    source = Column(String(100), default="SIH26091 Spatial Demand Engine")
    source_url = Column(String(255), default="https://overpass-api.de")
    retrieved_at = Column(DateTime, default=datetime.utcnow)
    data_freshness = Column(String(50), default="COMPUTED_ANALYTICS")
    is_seed_data = Column(Boolean, default=False)

# 9. business_plans
class BusinessPlan(Base):
    __tablename__ = "business_plans"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    location_id = Column(String(36), ForeignKey("locations.id"), nullable=True, index=True)
    category_id = Column(String(50), ForeignKey("business_categories.id"), nullable=False, index=True)
    proposed_budget = Column(Float, nullable=False)
    available_margin_capital = Column(Float, nullable=False)
    target_radius_km = Column(Float, default=3.0)
    status = Column(String(30), default="EVALUATED") # DRAFT, EVALUATED, SUBMITTED, APPROVED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="business_plans")
    financial_plan = relationship("FinancialPlan", back_populates="business_plan", uselist=False)

# 10. financial_plans
class FinancialPlan(Base):
    __tablename__ = "financial_plans"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    business_plan_id = Column(String(36), ForeignKey("business_plans.id"), nullable=False, unique=True)
    total_project_cost = Column(Float, nullable=False)
    beneficiary_contribution_pct = Column(Float, default=10.0)
    beneficiary_contribution_amt = Column(Float, nullable=False)
    eligible_loan_amt = Column(Float, nullable=False)
    scheme_max_cap = Column(Float, nullable=False)
    annual_interest_rate = Column(Float, nullable=False)
    repayment_tenure_years = Column(Integer, nullable=False)
    moratorium_months = Column(Integer, nullable=False)
    repayment_frequency = Column(String(30), default="Quarterly")
    quarterly_installment = Column(Float, nullable=False)
    monthly_emi_equivalent = Column(Float, nullable=False)
    machinery_cost = Column(Float, nullable=False)
    setup_licensing_cost = Column(Float, nullable=False)
    working_capital_buffer = Column(Float, nullable=False)
    fixed_monthly_costs = Column(Float, nullable=False)
    gross_margin_pct = Column(Float, nullable=False)
    break_even_monthly_revenue = Column(Float, nullable=False)
    risk_rating = Column(String(20), default="LOW")
    repayment_schedule_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    business_plan = relationship("BusinessPlan", back_populates="financial_plan")

# 11. government_schemes
class GovernmentScheme(Base):
    __tablename__ = "government_schemes"

    id = Column(String(50), primary_key=True) # micro-finance, term-loan
    name = Column(String(150), nullable=False)
    short_code = Column(String(50), nullable=False)
    nodal_ministry = Column(String(200), nullable=False)
    min_project_cost = Column(Float, default=0.0)
    max_project_cost = Column(Float, nullable=False)
    max_loan_cap = Column(Float, nullable=False)
    annual_interest_rate = Column(Float, nullable=False)
    tenure_years = Column(Integer, nullable=False)
    moratorium_months = Column(Integer, nullable=False)
    repayment_frequency = Column(String(30), default="Quarterly")
    subsidy_support_label = Column(String(255), nullable=False)
    target_beneficiaries = Column(Text, nullable=False)
    key_features_json = Column(JSON, nullable=True)
    eligibility_conditions_json = Column(JSON, nullable=True)
    portal_url = Column(String(255), default="https://www.jansamarth.in")
    nodal_agency = Column(String(200), nullable=False)
    source = Column(String(150), default="Ministry of MSME / SIH26091 Framework")
    source_url = Column(String(255), default="https://www.jansamarth.in")
    retrieved_at = Column(DateTime, default=datetime.utcnow)
    data_freshness = Column(String(50), default="OFFICIAL_POLICY_2026")
    is_seed_data = Column(Boolean, default=False)

    documents = relationship("SchemeDocument", back_populates="scheme")

# 12. scheme_documents
class SchemeDocument(Base):
    __tablename__ = "scheme_documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scheme_id = Column(String(50), ForeignKey("government_schemes.id"), nullable=False, index=True)
    document_name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    is_mandatory = Column(Boolean, default=True)
    issuing_authority = Column(String(150), nullable=True)
    document_type = Column(String(50), default="IDENTITY") # IDENTITY, RESIDENCE, LAND, BANKING, PROJECT_REPORT
    is_seed_data = Column(Boolean, default=False)

    scheme = relationship("GovernmentScheme", back_populates="documents")

# 13. advisory_reports
class AdvisoryReportModel(Base):
    __tablename__ = "advisory_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    business_plan_id = Column(String(36), ForeignKey("business_plans.id"), nullable=True, index=True)
    financial_plan_id = Column(String(36), ForeignKey("financial_plans.id"), nullable=True, index=True)
    matched_scheme_id = Column(String(50), ForeignKey("government_schemes.id"), nullable=True, index=True)
    opportunity_score = Column(Integer, nullable=False)
    verdict = Column(String(20), nullable=False) # START, CONSIDER, AVOID
    verdict_label = Column(String(100), nullable=False)
    verdict_reason = Column(Text, nullable=False)
    saturation_index = Column(Float, nullable=False)
    saturation_level = Column(String(30), nullable=False)
    discovered_competitors_count = Column(Integer, default=0)
    ai_narrative = Column(Text, nullable=False)
    recommendations_json = Column(JSON, nullable=True)
    risk_warnings_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# 14. scheme_document_chunks (RAG Knowledge Base & pgvector embeddings)
class SchemeDocumentChunk(Base):
    __tablename__ = "scheme_document_chunks"

    id = Column(String(50), primary_key=True, default=generate_uuid)
    scheme_id = Column(String(50), nullable=True, index=True)
    document_title = Column(String(255), nullable=False)
    scheme_name = Column(String(150), nullable=False, index=True)
    official_source_url = Column(String(255), nullable=False)
    nodal_ministry = Column(String(200), nullable=False)
    publication_date = Column(String(30), nullable=True)
    section_heading = Column(String(200), nullable=True)
    chunk_index = Column(Integer, default=0)
    chunk_text = Column(Text, nullable=False)
    embedding = Column(SafeVector(768), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

