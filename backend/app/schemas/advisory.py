from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from .finance import FinancialBreakdownResponse
from .competitors import CompetitorItem

class AdvisoryEvaluationRequest(BaseModel):
    pincode: Optional[str] = ""
    village_town: Optional[str] = ""
    district: Optional[str] = ""
    state: Optional[str] = ""
    business_category: str = Field(..., alias="business_category")
    proposed_budget: float = Field(..., alias="proposed_budget", description="Available Margin Capital")
    gender: Optional[str] = "MALE"
    social_category: Optional[str] = "GENERAL"
    is_rural: Optional[bool] = True
    radius_km: Optional[float] = 3.0

    class Config:
        populate_by_name = True

class AdvisoryReportResponse(BaseModel):
    opportunityScore: int
    verdict: Literal['START', 'CONSIDER', 'AVOID']
    verdictLabel: str
    verdictReason: str
    saturationIndex: float
    saturationLevel: Literal['LOW', 'MODERATE', 'HIGH', 'CRITICAL']
    discoveredCompetitorsCount: int
    financialFeasibilityScore: int
    aiNarrative: str
    recommendationsList: List[str]
    riskWarnings: List[str]

class AdvisoryEvaluationResponse(BaseModel):
    report: Optional[AdvisoryReportResponse] = None
    financials: Optional[FinancialBreakdownResponse] = None
    competitors: List[CompetitorItem] = []

class AIChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    pincode: Optional[str] = None
    village_town: Optional[str] = None
    category: Optional[str] = "agro-repair"
    available_capital: Optional[float] = 0.0
    chat_history: Optional[List[dict]] = []

class AIChatResponse(BaseModel):
    response: str
    grounded_context: Optional[dict] = None
    suggested_prompts: List[str] = []
