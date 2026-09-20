from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class CustomerSegmentItem(BaseModel):
    label: str
    pct: int
    description: str

class PeakHourItem(BaseModel):
    window: str
    trafficLevel: Literal['High', 'Peak', 'Normal']
    note: str

class SeasonalTrendItem(BaseModel):
    season: str
    months: str
    impactPct: int
    trend: Literal['peak', 'normal', 'lean']
    description: str

class LogisticsItem(BaseModel):
    primarySupplier: str
    procurementFrequency: str
    avgTripCost: str
    turnoverDays: int

# ==============================================================================
# SIH26091 REAL MARKET ANALYSIS SCHEMAS
# ==============================================================================

class MarketAnalyzeRequest(BaseModel):
    business_category: str = Field(..., description="Business category, e.g. agro-repair, grocery, tailoring, dairy, bakery, solar-repair")
    latitude: Optional[float] = Field(None, description="Center latitude coordinate")
    longitude: Optional[float] = Field(None, description="Center longitude coordinate")
    radius_km: Optional[float] = Field(3.0, description="Target search radius in kilometers (default 3.0 km)")
    pincode: Optional[str] = Field(None, description="6-digit postal PIN code")
    district: Optional[str] = Field(None, description="District name")
    state: Optional[str] = Field(None, description="State name")
    village_town: Optional[str] = Field(None, description="Village, town, or mandal/block name")

class CompetitorDistanceRings(BaseModel):
    within_1km: int = Field(..., description="Competitors mapped within 1.0 km immediate walking radius")
    within_3km: int = Field(..., description="Competitors mapped within 3.0 km local town/village core")
    within_5km: int = Field(..., description="Competitors mapped within 5.0 km extended rural trade basin")
    total_in_radius: int = Field(..., description="Total competitors found in target search radius")
    nearest_competitor_distance_km: Optional[float] = Field(None, description="Distance in km to nearest mapped competitor")
    nearest_competitor_name: Optional[str] = Field(None, description="Name of nearest mapped competitor")
    competitor_density_per_sq_km: float = Field(..., description="Mathematical competitor density: count / (pi * radius^2)")
    density_formula: str = Field(..., description="Transparent mathematical formula explanation")
    source: str = Field(..., description="Data source reference")
    data_freshness: str = Field(..., description="Freshness tier")
    disclaimer: str = Field(..., description="Non-exhaustive crowdsourced spatial disclaimer")

class CensusDemographicIndicators(BaseModel):
    total_population: Optional[int] = Field(None, description="Total administrative census population")
    total_households: Optional[int] = Field(None, description="Total households where available")
    rural_population_pct: Optional[float] = Field(None, description="Percentage of rural population")
    working_population_pct: Optional[float] = Field(None, description="Percentage of working population")
    literacy_rate_pct: Optional[float] = Field(None, description="Literacy rate percentage where available")
    purchasing_power_tier: Optional[str] = Field(None, description="Socioeconomic demographic purchasing tier")
    source: str = Field(..., description="Census data source")
    source_url: str = Field(..., description="Source URL")
    retrieved_at: Optional[str] = Field(None, description="Retrieval timestamp")
    data_freshness: str = Field(..., description="Data freshness")
    caveat: str = Field(..., description="Explicit disclaimer that population does not directly equal business demand")

class UdyamEnterpriseIndicators(BaseModel):
    total_registered_msmes: int = Field(..., description="Total formally registered MSMEs in district")
    micro_enterprises_count: int = Field(..., description="Count of registered Micro enterprises")
    small_enterprises_count: int = Field(..., description="Count of registered Small enterprises")
    medium_enterprises_count: int = Field(..., description="Count of registered Medium enterprises")
    micro_dominance_pct: float = Field(..., description="Percentage of micro units in MSME registry")
    manufacturing_units: Optional[int] = Field(None, description="Manufacturing enterprises count")
    services_units: Optional[int] = Field(None, description="Services enterprises count")
    category_registered_count: Optional[int] = Field(None, description="Registered units in target category NIC code")
    category_nic_code: Optional[str] = Field(None, description="Relevant 4-digit NIC classification code")
    source: str = Field(..., description="Data source")
    source_url: str = Field(..., description="Data source URL")
    retrieved_at: Optional[str] = Field(None, description="Retrieval timestamp")
    data_freshness: str = Field(..., description="Data freshness")
    disclaimer: str = Field(..., description="Disclaimer that informal micro-vendors are excluded")

class FacilityItem(BaseModel):
    id: str
    name: str
    facility_type: str
    distance_km: float
    lat: float
    lng: float
    address: Optional[str] = None

class NearbyFacilitiesIndicators(BaseModel):
    total_facilities_count: int = Field(..., description="Total nearby civic, commercial, transit & financial facilities")
    financial_facilities_count: int = Field(..., description="Banks, ATMs, micro-finance branches")
    commercial_facilities_count: int = Field(..., description="Mandis, grain markets, commercial hubs")
    transit_facilities_count: int = Field(..., description="Bus stations, auto stands, railway junctions")
    civic_facilities_count: int = Field(..., description="Post offices, Gram Panchayat offices, public schools")
    facilities_list: List[FacilityItem] = Field(default_factory=list, description="Top mapped facilities")
    source: str = Field(..., description="Facility data source")
    data_freshness: str = Field(..., description="Freshness")

class LocationSummary(BaseModel):
    resolved_name: str
    pincode: Optional[str] = None
    district: str
    state: str
    latitude: float
    longitude: float
    radius_km: float

class OperationalInsight(BaseModel):
    title: str
    timing: str
    level: str
    description: str

class MarketAnalyzeResponse(BaseModel):
    location_summary: LocationSummary
    business_category: str
    competitor_rings: CompetitorDistanceRings
    census_demographics: CensusDemographicIndicators
    udyam_enterprises: UdyamEnterpriseIndicators
    nearby_facilities: NearbyFacilitiesIndicators
    feasibility_score: int
    feasibility_verdict: Literal['HIGH VIABILITY', 'MODERATE VIABILITY', 'NEEDS CAUTION']
    saturation_level: Literal['LOW', 'MODERATE', 'HIGH', 'CRITICAL']
    opportunity_label: str
    nearest_hub: dict
    operating_windows: List[OperationalInsight]
    seasonal_factors: List[OperationalInsight]
    sourcing_logistics: LogisticsItem
    actionable_recommendations: List[str]
    provenance_disclaimer: str

# Legacy schemas preserved for backward compatibility

class MarketFeasibilityRequest(BaseModel):
    category: str
    pincode: Optional[str] = None
    village_town: Optional[str] = None
    district: Optional[str] = None

class MarketFeasibilityResponse(BaseModel):
    feasibilityScore: int
    feasibilityVerdict: Literal['HIGH VIABILITY', 'MODERATE VIABILITY', 'NEEDS CAUTION']
    catchmentPopulation: int
    dailyFootfallRange: dict
    saturationIndexPct: int
    saturationRating: Literal['Low', 'Moderate', 'High']
    opportunityGapLabel: str
    nearestHub: dict
    customerSegments: List[CustomerSegmentItem]
    peakBusinessHours: List[PeakHourItem]
    seasonalTrends: List[SeasonalTrendItem]
    logistics: LogisticsItem
    actionableInsights: List[str]
