from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum

class ProvenanceCategory(str, Enum):
    VERIFIED_DATA = "VERIFIED_DATA"
    CALCULATED_VALUES = "CALCULATED_VALUES"
    ESTIMATES = "ESTIMATES"
    AI_GENERATED_SUGGESTIONS = "AI_GENERATED_SUGGESTIONS"

class ProvenanceItem(BaseModel):
    statement: str = Field(..., description="Fact, calculation, estimate, or strategic suggestion")
    category: ProvenanceCategory = Field(..., description="VERIFIED_DATA, CALCULATED_VALUES, ESTIMATES, or AI_GENERATED_SUGGESTIONS")
    source: str = Field(..., description="Authoritative dataset, mathematical formula, or AI model")
    source_url: Optional[str] = Field(None, description="Official portal or verification reference URL")

class UserProfileInput(BaseModel):
    name: Optional[str] = Field(None, description="Entrepreneur name")
    social_category: str = Field("GENERAL", description="GENERAL, OBC, SC, ST, WOMEN")
    is_rural: bool = Field(True, description="Whether enterprise is in a rural area")
    educational_background: Optional[str] = Field("Secondary School", description="Educational qualification")
    prior_experience: Optional[str] = Field("Novice / First-time entrepreneur", description="Relevant industry experience")

class BusinessPlanInput(BaseModel):
    business_category: str = Field("bakery", description="Target enterprise sector (bakery, grocery, agro-repair, tailoring, dairy, etc.)")
    proposed_capital: float = Field(300000.0, ge=0, description="Available entrepreneur equity/margin in ₹")
    scale: Optional[str] = Field("Micro Enterprise", description="Micro, Small, or Nano")
    target_timeline_months: Optional[int] = Field(3, description="Setup duration in months")

class LocationInput(BaseModel):
    pincode: Optional[str] = Field("522201", description="6-digit postal code")
    village_town: Optional[str] = Field("Tenali", description="Village or town name")
    district: Optional[str] = Field("Guntur", description="District name")
    state: Optional[str] = Field("Andhra Pradesh", description="State name")
    latitude: Optional[float] = Field(None, description="Latitude coordinates")
    longitude: Optional[float] = Field(None, description="Longitude coordinates")
    search_radius_km: float = Field(3.0, gt=0, le=25.0, description="Search radius in km")

class ExplainableAdvisoryRequest(BaseModel):
    query: Optional[str] = Field(None, description="Natural language prompt (e.g. 'I have ₹3 lakh and want to start a bakery in my village.')")
    user_profile: Optional[UserProfileInput] = Field(default_factory=UserProfileInput)
    business_plan: Optional[BusinessPlanInput] = Field(default_factory=BusinessPlanInput)
    location: Optional[LocationInput] = Field(default_factory=LocationInput)

# 10 Explainable Advisory Sections
class BusinessSummarySection(BaseModel):
    venture_name: str
    category: str
    target_location: str
    scale: str
    executive_narrative: str
    provenance: List[ProvenanceItem] = Field(default_factory=list)

class LocalMarketOverviewSection(BaseModel):
    demographic_catchment: str
    total_population: Optional[int]
    total_households: Optional[int]
    workforce_participation_pct: Optional[float]
    literacy_rate_pct: Optional[float]
    purchasing_power_tier: str
    catchment_disclaimer: str
    provenance: List[ProvenanceItem] = Field(default_factory=list)

class NearbyCompetitionSection(BaseModel):
    competitor_count_radius: int
    nearest_competitor_km: Optional[float]
    competitors_1km: int
    competitors_3km: int
    competitors_5km: int
    competitor_density_per_sqkm: float
    market_saturation_level: str
    nearby_facilities_summary: str
    competitor_list_sample: List[Dict[str, Any]] = Field(default_factory=list)
    provenance: List[ProvenanceItem] = Field(default_factory=list)

class FinancialFeasibilitySection(BaseModel):
    project_cost: float
    beneficiary_equity: float
    loan_requirement: float
    monthly_emi: float
    annual_interest_rate_pct: float
    repayment_tenure_months: int
    total_repayment: float
    total_interest: float
    monthly_operating_expenses: float
    estimated_monthly_profit: float
    break_even_monthly_revenue: float
    dscr: Optional[float]
    payback_years: Optional[float]
    calculation_method: str = "DETERMINISTIC_STANDARD_FORMULAS (NO LLM MATH)"
    provenance: List[ProvenanceItem] = Field(default_factory=list)

class PotentialGovernmentSchemesSection(BaseModel):
    primary_recommended_scheme: str
    matched_schemes: List[Dict[str, Any]] = Field(default_factory=list)
    subsidy_details: str
    official_portal_urls: List[str] = Field(default_factory=list)
    rag_guideline_citations: List[Dict[str, Any]] = Field(default_factory=list)
    provenance: List[ProvenanceItem] = Field(default_factory=list)

class KeyRisksSection(BaseModel):
    risks: List[Dict[str, Any]] = Field(default_factory=list, description="List of identified risks with risk level, factor, and mitigation")
    provenance: List[ProvenanceItem] = Field(default_factory=list)

class OpportunitiesSection(BaseModel):
    opportunities: List[Dict[str, Any]] = Field(default_factory=list, description="List of identified market gaps and differentiation vectors")
    provenance: List[ProvenanceItem] = Field(default_factory=list)

class ImportantAssumptionsSection(BaseModel):
    assumptions: List[Dict[str, Any]] = Field(default_factory=list, description="Mathematical, operational, and demographic assumptions")
    provenance: List[ProvenanceItem] = Field(default_factory=list)

class RecommendedValidationStepsSection(BaseModel):
    validation_steps: List[Dict[str, Any]] = Field(default_factory=list, description="Actionable checklist for physical & institutional verification")
    provenance: List[ProvenanceItem] = Field(default_factory=list)

class DataSourceItem(BaseModel):
    dataset_name: str
    authority: str
    official_url: str
    data_type: str
    retrieved_at: str
    notes: str

class DataSourcesSection(BaseModel):
    sources: List[DataSourceItem] = Field(default_factory=list)

class ProvenanceAuditBreakdown(BaseModel):
    verified_data_count: int
    calculated_values_count: int
    estimates_count: int
    ai_generated_suggestions_count: int
    verified_data_items: List[str] = Field(default_factory=list)
    calculated_values_items: List[str] = Field(default_factory=list)
    estimates_items: List[str] = Field(default_factory=list)
    ai_suggestions_items: List[str] = Field(default_factory=list)

class ExplainableAdvisoryResponse(BaseModel):
    report_id: str
    created_at: str
    business_plan_id: Optional[str] = None
    financial_plan_id: Optional[str] = None
    synthesis_mode: str = "GEMINI_WITH_DETERMINISTIC_GROUNDING"

    # 10 Required Explainable Sections
    section_1_business_summary: BusinessSummarySection
    section_2_local_market_overview: LocalMarketOverviewSection
    section_3_nearby_competition: NearbyCompetitionSection
    section_4_financial_feasibility: FinancialFeasibilitySection
    section_5_potential_government_schemes: PotentialGovernmentSchemesSection
    section_6_key_risks: KeyRisksSection
    section_7_opportunities: OpportunitiesSection
    section_8_important_assumptions: ImportantAssumptionsSection
    section_9_recommended_validation_steps: RecommendedValidationStepsSection
    section_10_data_sources: DataSourcesSection

    # Provenance Segregation Summary
    provenance_audit: ProvenanceAuditBreakdown

