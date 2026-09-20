from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..schemas.market import (
    MarketFeasibilityRequest, 
    MarketFeasibilityResponse,
    MarketAnalyzeRequest,
    MarketAnalyzeResponse
)
from ..engines.market_engine import generate_market_feasibility, analyze_hyperlocal_market
from ..core.database import get_db
from ..core.config import logger

router = APIRouter(prefix="/market", tags=["Market Feasibility Analytics"])

@router.post("/analyze", response_model=MarketAnalyzeResponse)
async def market_analyze_endpoint(req: MarketAnalyzeRequest, db: Session = Depends(get_db)):
    """
    SIH26091 Real Market Analysis Endpoint:
    Combines live OpenStreetMap competitor discovery, Census 2011 demographic baselines,
    UDYAM formal MSME registry indicators, and nearby civic/financial facilities.
    Computes transparent distance rings (1km, 3km, 5km) and mathematical competitor density.
    Strictly avoids fabricating synthetic demand or transaction figures.
    """
    try:
        res = await analyze_hyperlocal_market(req, db=db)
        return res
    except Exception as e:
        logger.error(f"Error executing market analysis for {req.business_category}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Market analysis calculation failed: {str(e)}")

@router.post("/feasibility", response_model=MarketFeasibilityResponse)
async def market_feasibility_endpoint(req: MarketFeasibilityRequest):
    """
    Legacy feasibility endpoint maintained for backward compatibility.
    """
    return generate_market_feasibility(req.category)
