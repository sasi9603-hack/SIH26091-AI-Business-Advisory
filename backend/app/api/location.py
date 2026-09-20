import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

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
    Persists real geocoded locations to the PostgreSQL locations table.
    """
    try:
        # Check if matching location already exists in database
        query_filters = []
        if req.pincode:
            loc_record = db.query(Location).filter(Location.pincode == req.pincode).first()
            if loc_record:
                disp_str = f"{loc_record.village_town}, {loc_record.district}, {loc_record.state} - {loc_record.pincode}"
                return GeocodeResponse(
                    latitude=loc_record.latitude,
                    longitude=loc_record.longitude,
                    display_name=disp_str,
                    formatted_address=disp_str,
                    village_town=loc_record.village_town,
                    block=loc_record.block,
                    district=loc_record.district,
                    state=loc_record.state,
                    pincode=loc_record.pincode,
                    is_approximate=False
                )

        # Call real live geocoding service
        res = await geocode_location(
            query=req.query,
            village_town=req.village_town,
            block=req.block,
            district=req.district,
            state=req.state,
            pincode=req.pincode
        )

        # Persist new geocoded location to database
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
    except Exception as e:
        logger.error(f"Error geocoding location request: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to geocode location: {str(e)}")

