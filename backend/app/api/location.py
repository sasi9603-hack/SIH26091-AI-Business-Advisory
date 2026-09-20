import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..schemas.location import GeocodeRequest, GeocodeResponse
from ..services.location_service import geocode_location
from ..core.database import get_db
from ..models import Location
from ..core.config import logger

router = APIRouter(tags=["Location & Geocoding"])

@router.post("/location/geocode", response_model=GeocodeResponse)
async def geocode_endpoint(req: GeocodeRequest, db: Session = Depends(get_db)):
    """
    Geocodes user location from State, District, Mandal/Block, Village/Town, or PIN code into Latitude/Longitude.
    Validates location against strict hierarchical constraints and persists real verified locations.
    Returns HTTP 404 with specific error message if location cannot be verified.
    """
    try:
        # 1. Check if matching location already exists in database with matching state
        if req.pincode and req.state:
            loc_record = (
                db.query(Location)
                .filter(
                    Location.pincode == req.pincode.strip(),
                    func.lower(Location.state).contains(req.state.strip().lower())
                )
                .first()
            )
            if loc_record:
                # If district specified, also verify match
                dist_ok = True
                if req.district and loc_record.district:
                    dist_ok = (
                        req.district.strip().lower() in loc_record.district.lower()
                        or loc_record.district.lower() in req.district.strip().lower()
                    )
                if dist_ok:
                    disp_str = f"{loc_record.village_town}, {loc_record.district}, {loc_record.state} - {loc_record.pincode}"
                    return GeocodeResponse(
                        latitude=loc_record.latitude,
                        longitude=loc_record.longitude,
                        display_name=disp_str,
                        formatted_address=disp_str,
                        village_town=loc_record.village_town,
                        block=loc_record.block,
                        mandal=loc_record.block,
                        district=loc_record.district,
                        state=loc_record.state,
                        pincode=loc_record.pincode,
                        is_approximate=False,
                        confidence=1.0
                    )

        # 2. Call live geocoding service with hierarchical validation
        res = await geocode_location(
            query=req.query,
            village_town=req.village_town,
            block=req.block,
            district=req.district,
            state=req.state,
            pincode=req.pincode
        )

        # 3. NO SILENT FALLBACK: If unverified, return explicit 404
        if not res:
            logger.warning(
                f"Location verification failed for: state='{req.state}', "
                f"district='{req.district}', mandal='{req.block}', village='{req.village_town}', pin='{req.pincode}'"
            )
            raise HTTPException(
                status_code=404,
                detail="Could not verify this location. Please check the village, mandal, district, state and PIN code."
            )

        # 4. Persist newly verified geocoded location to database
        try:
            new_location = Location(
                id=str(uuid.uuid4()),
                state=res.state or req.state or "Unknown State",
                district=res.district or req.district or "Unknown District",
                block=res.block or req.block,
                village_town=res.village_town or req.village_town or "Unknown Village",
                pincode=res.pincode or req.pincode or "000000",
                hierarchy_level="VILLAGE",
                latitude=res.latitude,
                longitude=res.longitude,
                source="OpenStreetMap Nominatim Geocoding",
                source_url="https://nominatim.openstreetmap.org",
                retrieved_at=datetime.utcnow(),
                data_freshness="LIVE_GEOCODE",
                is_seed_data=False
            )
            db.add(new_location)
            db.commit()
            logger.info(f"Persisted geocoded location to database: {new_location.village_town}, {new_location.district}")
        except Exception as db_err:
            db.rollback()
            logger.warning(f"Note: Could not persist geocoded location to DB: {db_err}")

        return res
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error geocoding location request: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error geocoding location: {str(e)}"
        )
