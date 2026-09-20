"""Initial SIH26091 Schema with 13 tables and PostGIS spatial support

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-09-19 23:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from geoalchemy2 import Geometry

# revision identifiers, used by Alembic.
revision = '0001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # 0. Ensure PostGIS spatial extension exists
    try:
        op.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
    except Exception:
        pass

    # 1. users
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('full_name', sa.String(100), nullable=False),
        sa.Column('phone_number', sa.String(15), unique=True, nullable=False),
        sa.Column('email', sa.String(100), nullable=True),
        sa.Column('social_category', sa.String(20), default="GENERAL"),
        sa.Column('gender', sa.String(10), default="MALE"),
        sa.Column('is_rural', sa.Boolean(), default=True),
        sa.Column('age', sa.Integer(), default=25),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now())
    )

    # 2. locations
    op.create_table(
        'locations',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('state', sa.String(100), nullable=False),
        sa.Column('district', sa.String(100), nullable=False),
        sa.Column('block', sa.String(100), nullable=True),
        sa.Column('village_town', sa.String(100), nullable=False),
        sa.Column('pincode', sa.String(10), nullable=False),
        sa.Column('lgd_code', sa.String(20), nullable=True),
        sa.Column('hierarchy_level', sa.String(30), default="VILLAGE"),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('geom', Geometry(geometry_type='POINT', srid=4326), nullable=True),
        sa.Column('source', sa.String(100), default="OpenStreetMap / Census of India"),
        sa.Column('source_url', sa.String(255), default="https://www.openstreetmap.org"),
        sa.Column('retrieved_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('data_freshness', sa.String(50), default="LIVE_GEOCODE"),
        sa.Column('is_seed_data', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now())
    )
    op.create_index('ix_locations_pincode', 'locations', ['pincode'])
    op.create_index('ix_locations_district', 'locations', ['district'])

    # 3. business_categories
    op.create_table(
        'business_categories',
        sa.Column('id', sa.String(50), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('nic_code', sa.String(10), nullable=True),
        sa.Column('osm_tag_filter', sa.String(255), nullable=False),
        sa.Column('standard_gross_margin_pct', sa.Float(), default=35.0),
        sa.Column('base_fixed_costs', sa.Float(), default=4500.0),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_seed_data', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now())
    )

    # 4. businesses
    op.create_table(
        'businesses',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(150), nullable=False),
        sa.Column('category_id', sa.String(50), sa.ForeignKey('business_categories.id'), nullable=False),
        sa.Column('location_id', sa.String(36), sa.ForeignKey('locations.id'), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('geom', Geometry(geometry_type='POINT', srid=4326), nullable=True),
        sa.Column('address', sa.Text(), nullable=False),
        sa.Column('source', sa.String(50), default="OPENSTREETMAP"),
        sa.Column('source_url', sa.String(255), nullable=True),
        sa.Column('source_id', sa.String(100), nullable=True),
        sa.Column('verification_status', sa.String(30), default="VERIFIED"),
        sa.Column('confidence_score', sa.Float(), default=0.85),
        sa.Column('retrieved_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('data_freshness', sa.String(50), default="LIVE_API"),
        sa.Column('upvotes', sa.Integer(), default=0),
        sa.Column('is_seed_data', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now())
    )
    op.create_index('ix_businesses_name', 'businesses', ['name'])

    # 5. competitors
    op.create_table(
        'competitors',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('target_location_id', sa.String(36), sa.ForeignKey('locations.id'), nullable=False),
        sa.Column('business_id', sa.String(36), sa.ForeignKey('businesses.id'), nullable=False),
        sa.Column('category', sa.String(50), nullable=False),
        sa.Column('distance_km', sa.Float(), nullable=False),
        sa.Column('retrieved_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('is_seed_data', sa.Boolean(), default=False)
    )

    # 6. census_data
    op.create_table(
        'census_data',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('location_id', sa.String(36), sa.ForeignKey('locations.id'), nullable=True),
        sa.Column('pincode', sa.String(10), nullable=False),
        sa.Column('district', sa.String(100), nullable=False),
        sa.Column('state', sa.String(100), nullable=False),
        sa.Column('total_population', sa.Integer(), default=18450),
        sa.Column('rural_population_pct', sa.Float(), default=82.4),
        sa.Column('total_households', sa.Integer(), default=4120),
        sa.Column('working_population_pct', sa.Float(), default=54.2),
        sa.Column('avg_household_size', sa.Float(), default=4.4),
        sa.Column('purchasing_power_tier', sa.String(50), default="Moderate Rural Agrarian"),
        sa.Column('literacy_rate_pct', sa.Float(), nullable=True),
        sa.Column('male_literacy_rate_pct', sa.Float(), nullable=True),
        sa.Column('female_literacy_rate_pct', sa.Float(), nullable=True),
        sa.Column('total_workers', sa.Integer(), nullable=True),
        sa.Column('main_workers', sa.Integer(), nullable=True),
        sa.Column('marginal_workers', sa.Integer(), nullable=True),
        sa.Column('agricultural_workers_pct', sa.Float(), nullable=True),
        sa.Column('raw_payload_json', sa.JSON(), nullable=True),
        sa.Column('source', sa.String(100), default="Census of India / data.gov.in"),
        sa.Column('source_url', sa.String(255), default="https://data.gov.in"),
        sa.Column('retrieved_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('data_freshness', sa.String(50), default="CENSUS_PCA_BENCHMARK"),
        sa.Column('is_seed_data', sa.Boolean(), default=False)
    )

    # 7. udyam_data
    op.create_table(
        'udyam_data',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('district', sa.String(100), nullable=False),
        sa.Column('state', sa.String(100), nullable=False),
        sa.Column('nic_code', sa.String(10), nullable=False),
        sa.Column('nic_description', sa.Text(), nullable=False),
        sa.Column('micro_enterprise_count', sa.Integer(), default=42),
        sa.Column('small_enterprise_count', sa.Integer(), default=8),
        sa.Column('medium_enterprise_count', sa.Integer(), default=1),
        sa.Column('total_registered', sa.Integer(), default=51),
        sa.Column('micro_dominance_pct', sa.Float(), nullable=True),
        sa.Column('manufacturing_count', sa.Integer(), nullable=True),
        sa.Column('services_count', sa.Integer(), nullable=True),
        sa.Column('raw_payload_json', sa.JSON(), nullable=True),
        sa.Column('source', sa.String(100), default="Ministry of MSME / UDYAM Registration Registry"),
        sa.Column('source_url', sa.String(255), default="https://udyamregistration.gov.in"),
        sa.Column('retrieved_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('data_freshness', sa.String(50), default="UDYAM_OFFICIAL_REGISTRY"),
        sa.Column('is_seed_data', sa.Boolean(), default=False)
    )

    # 8. market_indicators
    op.create_table(
        'market_indicators',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('location_id', sa.String(36), sa.ForeignKey('locations.id'), nullable=True),
        sa.Column('category_id', sa.String(50), sa.ForeignKey('business_categories.id'), nullable=False),
        sa.Column('catchment_population', sa.Integer(), default=16500),
        sa.Column('estimated_daily_footfall_min', sa.Integer(), default=35),
        sa.Column('estimated_daily_footfall_max', sa.Integer(), default=55),
        sa.Column('saturation_index', sa.Float(), default=0.24),
        sa.Column('saturation_level', sa.String(30), default="LOW"),
        sa.Column('opportunity_gap_label', sa.String(255), nullable=True),
        sa.Column('nearest_hub_name', sa.String(150), nullable=True),
        sa.Column('nearest_hub_distance_km', sa.Float(), default=5.0),
        sa.Column('source', sa.String(100), default="SIH26091 Spatial Demand Engine"),
        sa.Column('source_url', sa.String(255), default="https://overpass-api.de"),
        sa.Column('retrieved_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('data_freshness', sa.String(50), default="COMPUTED_ANALYTICS"),
        sa.Column('is_seed_data', sa.Boolean(), default=False)
    )

    # 9. business_plans
    op.create_table(
        'business_plans',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('location_id', sa.String(36), sa.ForeignKey('locations.id'), nullable=True),
        sa.Column('category_id', sa.String(50), sa.ForeignKey('business_categories.id'), nullable=False),
        sa.Column('proposed_budget', sa.Float(), nullable=False),
        sa.Column('available_margin_capital', sa.Float(), nullable=False),
        sa.Column('target_radius_km', sa.Float(), default=3.0),
        sa.Column('status', sa.String(30), default="EVALUATED"),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now())
    )

    # 10. financial_plans
    op.create_table(
        'financial_plans',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('business_plan_id', sa.String(36), sa.ForeignKey('business_plans.id'), nullable=False, unique=True),
        sa.Column('total_project_cost', sa.Float(), nullable=False),
        sa.Column('beneficiary_contribution_pct', sa.Float(), default=10.0),
        sa.Column('beneficiary_contribution_amt', sa.Float(), nullable=False),
        sa.Column('eligible_loan_amt', sa.Float(), nullable=False),
        sa.Column('scheme_max_cap', sa.Float(), nullable=False),
        sa.Column('annual_interest_rate', sa.Float(), nullable=False),
        sa.Column('repayment_tenure_years', sa.Integer(), nullable=False),
        sa.Column('moratorium_months', sa.Integer(), nullable=False),
        sa.Column('repayment_frequency', sa.String(30), default="Quarterly"),
        sa.Column('quarterly_installment', sa.Float(), nullable=False),
        sa.Column('monthly_emi_equivalent', sa.Float(), nullable=False),
        sa.Column('machinery_cost', sa.Float(), nullable=False),
        sa.Column('setup_licensing_cost', sa.Float(), nullable=False),
        sa.Column('working_capital_buffer', sa.Float(), nullable=False),
        sa.Column('fixed_monthly_costs', sa.Float(), nullable=False),
        sa.Column('gross_margin_pct', sa.Float(), nullable=False),
        sa.Column('break_even_monthly_revenue', sa.Float(), nullable=False),
        sa.Column('risk_rating', sa.String(20), default="LOW"),
        sa.Column('repayment_schedule_json', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now())
    )

    # 11. government_schemes
    op.create_table(
        'government_schemes',
        sa.Column('id', sa.String(50), primary_key=True),
        sa.Column('name', sa.String(150), nullable=False),
        sa.Column('short_code', sa.String(50), nullable=False),
        sa.Column('nodal_ministry', sa.String(200), nullable=False),
        sa.Column('min_project_cost', sa.Float(), default=0.0),
        sa.Column('max_project_cost', sa.Float(), nullable=False),
        sa.Column('max_loan_cap', sa.Float(), nullable=False),
        sa.Column('annual_interest_rate', sa.Float(), nullable=False),
        sa.Column('tenure_years', sa.Integer(), nullable=False),
        sa.Column('moratorium_months', sa.Integer(), nullable=False),
        sa.Column('repayment_frequency', sa.String(30), default="Quarterly"),
        sa.Column('subsidy_support_label', sa.String(255), nullable=False),
        sa.Column('target_beneficiaries', sa.Text(), nullable=False),
        sa.Column('key_features_json', sa.JSON(), nullable=True),
        sa.Column('eligibility_conditions_json', sa.JSON(), nullable=True),
        sa.Column('portal_url', sa.String(255), default="https://www.jansamarth.in"),
        sa.Column('nodal_agency', sa.String(200), nullable=False),
        sa.Column('source', sa.String(150), default="Ministry of MSME / SIH26091 Framework"),
        sa.Column('source_url', sa.String(255), default="https://www.jansamarth.in"),
        sa.Column('retrieved_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('data_freshness', sa.String(50), default="OFFICIAL_POLICY_2026"),
        sa.Column('is_seed_data', sa.Boolean(), default=False)
    )

    # 12. scheme_documents
    op.create_table(
        'scheme_documents',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('scheme_id', sa.String(50), sa.ForeignKey('government_schemes.id'), nullable=False),
        sa.Column('document_name', sa.String(150), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_mandatory', sa.Boolean(), default=True),
        sa.Column('issuing_authority', sa.String(150), nullable=True),
        sa.Column('document_type', sa.String(50), default="IDENTITY"),
        sa.Column('is_seed_data', sa.Boolean(), default=False)
    )

    # 13. advisory_reports
    op.create_table(
        'advisory_reports',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('business_plan_id', sa.String(36), sa.ForeignKey('business_plans.id'), nullable=True),
        sa.Column('financial_plan_id', sa.String(36), sa.ForeignKey('financial_plans.id'), nullable=True),
        sa.Column('matched_scheme_id', sa.String(50), sa.ForeignKey('government_schemes.id'), nullable=True),
        sa.Column('opportunity_score', sa.Integer(), nullable=False),
        sa.Column('verdict', sa.String(20), nullable=False),
        sa.Column('verdict_label', sa.String(100), nullable=False),
        sa.Column('verdict_reason', sa.Text(), nullable=False),
        sa.Column('saturation_index', sa.Float(), nullable=False),
        sa.Column('saturation_level', sa.String(30), nullable=False),
        sa.Column('discovered_competitors_count', sa.Integer(), default=0),
        sa.Column('ai_narrative', sa.Text(), nullable=False),
        sa.Column('recommendations_json', sa.JSON(), nullable=True),
        sa.Column('risk_warnings_json', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now())
    )

def downgrade():
    op.drop_table('advisory_reports')
    op.drop_table('scheme_documents')
    op.drop_table('government_schemes')
    op.drop_table('financial_plans')
    op.drop_table('business_plans')
    op.drop_table('market_indicators')
    op.drop_table('udyam_data')
    op.drop_table('census_data')
    op.drop_table('competitors')
    op.drop_table('businesses')
    op.drop_table('business_categories')
    op.drop_table('locations')
    op.drop_table('users')
