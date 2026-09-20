from pydantic import BaseModel
from typing import List, Optional

class SchemeItemResponse(BaseModel):
    id: str
    name: str
    shortCode: str
    ministry: str
    maxProjectCost: float
    subsidyPctRange: str
    beneficiaryEquityPct: str
    targetBeneficiaries: str
    keyFeatures: List[str]
    eligibilityConditions: List[str]
    documentChecklist: List[str]
    portalUrl: str
    nodalAgency: str

class SchemeMatchRequest(BaseModel):
    project_cost: float
    available_capital: float
    category: Optional[str] = None
    is_rural: Optional[bool] = True

class SchemeMatchResponse(BaseModel):
    matched_schemes: List[SchemeItemResponse]
    recommended_scheme: Optional[SchemeItemResponse]
    outside_range: bool = False
    status_message: str
