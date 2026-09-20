import uuid
from datetime import datetime
from fastapi import APIRouter, Query, Path, HTTPException, Depends
from sqlalchemy.orm import Session

from ..schemas.census import CensusDemographicsResponse, CensusNormalizedResponse
from ..services.census_service import get_census_demographics, fetch_and_normalize_census_data
from ..core.database import get_db
from ..models import CensusData
from ..core.config import logger

router = APIRouter(tags=["Census & Demographics"])

@router.get("/census/demographics", response_model=CensusDemographicsResponse)
async def census_endpoint(
    pincode: str = Query(default="522002"),
    district: str = Query(default="Guntur"),
    state: str = Query(default="Andhra Pradesh"),
    db: Session = Depends(get_db)
):
    """
    Legacy demographics endpoint maintained for full backward compatibility.
    """
    try:
        db_record = None
        if pincode:
            db_record = db.query(CensusData).filter(CensusData.pincode == pincode).first()
        if not db_record and district:
            db_record = db.query(CensusData).filter(CensusData.district.ilike(f"%{district}%")).first()

        if db_record:
            return CensusDemographicsResponse(
                pincode=db_record.pincode,
                district=db_record.district,
                state=db_record.state,
                total_population=db_record.total_population,
                rural_population_pct=db_record.rural_population_pct,
                total_households=db_record.total_households,
                working_population_pct=db_record.working_population_pct,
                avg_household_size=db_record.avg_household_size,
                purchasing_power_tier=db_record.purchasing_power_tier,
                source_reference=f"{db_record.source} ({db_record.data_freshness})"
            )
    except Exception as e:
        logger.warning(f"Could not query DB for census: {e}")

    # Fallback to service and persist
    live_res = get_census_demographics(pincode, district, state)
    try:
        new_c = CensusData(
            id=str(uuid.uuid4()),
            pincode=live_res.pincode,
            district=live_res.district,
            state=live_res.state,
            total_population=live_res.total_population,
            rural_population_pct=live_res.rural_population_pct,
            total_households=live_res.total_households,
            working_population_pct=live_res.working_population_pct,
            avg_household_size=live_res.avg_household_size,
            purchasing_power_tier=live_res.purchasing_power_tier,
            source=live_res.source_reference,
            source_url="https://data.gov.in",
            retrieved_at=datetime.utcnow(),
            data_freshness="LIVE_API",
            is_seed_data=False
        )
        db.add(new_c)
        db.commit()
    except Exception as err:
        db.rollback()
        logger.warning(f"Note: Could not persist census data: {err}")

    return live_res

@router.get("/census/{location_identifier}", response_model=CensusNormalizedResponse)
async def get_census_by_location(
    location_identifier: str = Path(..., description="PIN code (e.g. 522002), district name (e.g. Guntur), or village/town identifier"),
    db: Session = Depends(get_db)
):
    """
    Retrieves normalized demographic and business-feasibility variables for the target location.
    Captures population, households, total and marginal workforce, literacy rates (where available),
    and purchasing power tiers. Strictly avoids fabricating missing variables.
    """
    try:
        data = await fetch_and_normalize_census_data(location_identifier, db=db)
        if not data:
            raise HTTPException(
                status_code=404,
                detail=f"Census demographic data could not be resolved for location '{location_identifier}'."
            )
        return data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching Census data for '{location_identifier}': {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to retrieve Census data: {str(e)}")



