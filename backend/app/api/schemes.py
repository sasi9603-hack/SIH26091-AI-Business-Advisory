from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..schemas.schemes import SchemeItemResponse, SchemeMatchRequest, SchemeMatchResponse
from ..services.scheme_service import get_all_schemes, evaluate_scheme_match
from ..core.database import get_db
from ..models import GovernmentScheme

router = APIRouter(prefix="/schemes", tags=["Government Schemes"])

@router.get("/all", response_model=List[SchemeItemResponse])
async def list_all_schemes(db: Session = Depends(get_db)):
    """
    Returns all recognized MSME schemes, querying the PostgreSQL government_schemes and scheme_documents tables first.
    """
    try:
        db_schemes = db.query(GovernmentScheme).all()
        if db_schemes:
            result = []
            for s in db_schemes:
                doc_list = [d.document_name for d in s.documents] if s.documents else []
                result.append(
                    SchemeItemResponse(
                        id=s.id,
                        name=s.name,
                        shortCode=s.short_code,
                        ministry=s.nodal_ministry,
                        maxProjectCost=s.max_project_cost,
                        subsidyPctRange=s.subsidy_support_label,
                        beneficiaryEquityPct="10% Available Margin Capital",
                        targetBeneficiaries=s.target_beneficiaries,
                        keyFeatures=s.key_features_json or [],
                        eligibilityConditions=s.eligibility_conditions_json or [],
                        documentChecklist=doc_list if doc_list else [
                            "Aadhaar Card", "PAN Card", "Business Premises NOC / Proof", "Bank Passbook"
                        ],
                        portalUrl=s.portal_url or "https://www.jansamarth.in",
                        nodalAgency=s.nodal_agency or "Public Sector Banks"
                    )
                )
            return result
    except Exception:
        pass
    return get_all_schemes()

@router.post("/match", response_model=SchemeMatchResponse)
async def match_schemes_endpoint(req: SchemeMatchRequest):
    return evaluate_scheme_match(req.project_cost, req.available_capital)

