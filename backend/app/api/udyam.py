import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Query, Path, HTTPException, Depends
from sqlalchemy.orm import Session

from ..schemas.udyam import UdyamQueryResponse, UdyamSectorItem, UdyamNormalizedResponse
from ..services.udyam_service import get_udyam_district_stats, fetch_and_normalize_udyam_data
from ..core.database import get_db
from ..models import UdyamData
from ..core.config import logger

router = APIRouter(tags=["UDYAM MSME Registrations"])

@router.get("/udyam/stats", response_model=UdyamQueryResponse)
async def udyam_stats_endpoint(
    district: str = Query(default="Guntur"),
    category: Optional[str] = Query(default=None),
    db: Session = Depends(get_db)
):
    """
    Legacy stats endpoint maintained for backward compatibility.
    """
    try:
        q = db.query(UdyamData).filter(UdyamData.district.ilike(f"%{district}%"))
        db_records = q.all()
        if db_records:
            total_all = sum(r.total_registered for r in db_records)
            first_rec = db_records[0]
            sectors = [
                UdyamSectorItem(
                    nic_code=r.nic_code,
                    nic_description=r.nic_description,
                    micro_enterprise_count=r.micro_enterprise_count,
                    small_enterprise_count=r.small_enterprise_count,
                    medium_enterprise_count=r.medium_enterprise_count,
                    total_registered=r.total_registered
                )
                for r in db_records
            ]

            return UdyamQueryResponse(
                district=district,
                state=first_rec.state,
                category_filter=category,
                total_enterprises=total_all,
                sector_breakdown=sectors,
                data_source=f"{first_rec.source} ({first_rec.data_freshness})"
            )
    except Exception as e:
        logger.warning(f"Could not query DB for UDYAM data: {e}")

    # Fallback to service
    live_res = get_udyam_district_stats(district, category)
    try:
        for sec in live_res.sector_breakdown:
            new_u = UdyamData(
                id=str(uuid.uuid4()),
                district=live_res.district,
                state=live_res.state,
                nic_code=sec.nic_code,
                nic_description=sec.nic_description,
                micro_enterprise_count=sec.micro_enterprise_count,
                small_enterprise_count=sec.small_enterprise_count,
                medium_enterprise_count=sec.medium_enterprise_count,
                total_registered=sec.total_registered,
                source=live_res.data_source,
                source_url="https://udyamregistration.gov.in",
                retrieved_at=datetime.utcnow(),
                data_freshness="LIVE_API",
                is_seed_data=False
            )
            db.add(new_u)
        db.commit()
    except Exception as err:
        db.rollback()
        logger.warning(f"Note: Could not persist UDYAM data: {err}")

    return live_res

@router.get("/udyam/{location_identifier}", response_model=UdyamNormalizedResponse)
async def get_udyam_by_location(
    location_identifier: str = Path(..., description="District name (e.g. Guntur), PIN code (e.g. 522002), or town name"),
    category: Optional[str] = Query(default=None, description="Optional business category filter, e.g. agro-repair, grocery, tailoring, bakery"),
    db: Session = Depends(get_db)
):
    """
    Retrieves normalized MSME enterprise registrations, micro-enterprise dominance ratio,
    and NIC category distributions for the target location. Includes provenance metadata and
    an explicit disclaimer noting that informal rural micro-vendors are excluded.
    """
    try:
        data = await fetch_and_normalize_udyam_data(location_identifier, category=category, db=db)
        if not data:
            raise HTTPException(
                status_code=404,
                detail=f"UDYAM MSME data could not be resolved for location '{location_identifier}'."
            )
        return data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching UDYAM data for '{location_identifier}': {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to retrieve UDYAM MSME data: {str(e)}")



