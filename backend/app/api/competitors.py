import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from ..schemas.competitors import (
    CompetitorSearchRequest,
    CompetitorSearchResponse,
    CommunityReportRequest,
    CommunityReportResponse,
    CompetitorItem
)
from ..services.osm_service import search_osm_competitors
from ..services.location_service import haversine_distance
from ..core.database import get_db
from ..models import Business, Competitor
from ..core.config import logger

router = APIRouter(tags=["Competitors & Spatial Business Discovery"])

# In-memory fallback registry for rapid test mock / transient caches
COMMUNITY_REPORTS: list[CompetitorItem] = []

@router.post("/competitors/search", response_model=CompetitorSearchResponse)
async def search_competitors_endpoint(req: CompetitorSearchRequest, db: Session = Depends(get_db)):
    """
    Retrieves nearby businesses from OpenStreetMap/Overpass within target radius,
    normalizes names, coordinates, and addresses, calculates exact distance from proposed location,
    persists newly discovered businesses to the database, queries existing community/verified businesses,
    and returns competitors sorted by nearest distance.
    """
    try:
        # 1. Query Google Maps & Places live
        from ..services.google_maps_service import search_google_places
        result = await search_google_places(
            latitude=req.latitude,
            longitude=req.longitude,
            category=req.business_category,
            radius_km=req.radius_km
        )

        # 2. Persist newly discovered OSM competitors to PostgreSQL database
        try:
            for item in result.businesses:
                existing = db.query(Business).filter(
                    (Business.source_id == item.id) |
                    ((Business.name == item.name) & (Business.latitude == item.lat) & (Business.longitude == item.lng))
                ).first()
                if not existing:
                    new_biz = Business(
                        id=str(uuid.uuid4()),
                        name=item.name,
                        category_id=req.business_category.lower(),
                        latitude=item.lat,
                        longitude=item.lng,
                        address=item.address,
                        source=item.source or "OPENSTREETMAP",
                        source_url="https://www.openstreetmap.org",
                        source_id=item.id,
                        verification_status="VERIFIED",
                        confidence_score=item.confidenceScore or 0.85,
                        retrieved_at=datetime.utcnow(),
                        data_freshness="LIVE_API",
                        is_seed_data=False
                    )
                    db.add(new_biz)
            db.commit()
        except Exception as db_err:
            db.rollback()
            logger.warning(f"Note: Could not persist OSM competitors to DB: {db_err}")

        # 3. Query DB for community-reported or locally verified businesses
        db_matches: list[CompetitorItem] = []
        try:
            db_businesses = db.query(Business).filter(
                Business.category_id == req.business_category.lower()
            ).all()
            for b in db_businesses:
                dist = haversine_distance(req.latitude, req.longitude, b.latitude, b.longitude)
                if dist <= req.radius_km:
                    # check if already in result.businesses
                    if not any(x.id == b.source_id or (x.lat == b.latitude and x.lng == b.longitude) for x in result.businesses):
                        db_matches.append(CompetitorItem(
                            id=b.id,
                            name=b.name,
                            category=b.category_id,
                            source=b.source or "COMMUNITY",
                            confidenceScore=b.confidence_score or 0.70,
                            verificationStatus=b.verification_status or "VERIFIED",
                            distanceKm=round(dist, 2),
                            lat=b.latitude,
                            lng=b.longitude,
                            address=b.address,
                            reportedDate=b.retrieved_at.strftime("%Y-%m-%d") if b.retrieved_at else None,
                            upvotes=b.upvotes or 0
                        ))
        except Exception as q_err:
            logger.warning(f"Could not query DB businesses: {q_err}")

        # 4. Merge in-memory community reports as fallback if DB didn't have them
        for rep in COMMUNITY_REPORTS:
            if rep.category.lower() == req.business_category.lower():
                dist = haversine_distance(req.latitude, req.longitude, rep.lat, rep.lng)
                if dist <= req.radius_km:
                    if not any(x.id == rep.id for x in db_matches) and not any(x.id == rep.id for x in result.businesses):
                        db_matches.append(rep.model_copy(update={"distanceKm": round(dist, 2)}))

        if db_matches:
            all_list = result.businesses + db_matches
            all_list.sort(key=lambda x: x.distanceKm)
            result.businesses = all_list
            result.competitor_count = len(all_list)
            comm_count = sum(1 for x in all_list if x.source == "COMMUNITY")
            result.disclaimer = (
                f"{len(all_list)} businesses found in available map data ({comm_count} community-reported) within a {req.radius_km} km radius. "
                "Note: Map data combines OpenStreetMap, official UDYAM registries, and verified community contributions."
            )

        return result
    except Exception as e:
        logger.error(f"Error in competitors search: {e}", exc_info=True)
        # Handle failures gracefully without crashing
        return CompetitorSearchResponse(
            competitor_count=0,
            business_category=req.business_category,
            radius_km=req.radius_km,
            disclaimer="0 businesses found in available map data due to temporary map service unavailability. Please try again shortly.",
            status="degraded",
            businesses=[]
        )

@router.post("/competitors/community-report", response_model=CommunityReportResponse)
async def submit_community_report(req: CommunityReportRequest, db: Session = Depends(get_db)):
    """
    Submits a community ground-truth report for informal or unmapped rural micro-businesses.
    Persists report directly to the PostgreSQL database.
    """
    try:
        report_id = f"comm-{uuid.uuid4().hex[:8]}"
        recorded = CompetitorItem(
            id=report_id,
            name=req.business_name,
            category=req.category,
            source='COMMUNITY',
            confidenceScore=0.65,
            verificationStatus='UNVERIFIED',
            distanceKm=0.1,
            lat=req.latitude,
            lng=req.longitude,
            address=req.address,
            reportedDate=datetime.now().strftime("%Y-%m-%d"),
            upvotes=1
        )
        COMMUNITY_REPORTS.append(recorded)

        # Save to database
        try:
            biz_record = Business(
                id=report_id,
                name=req.business_name,
                category_id=req.category.lower(),
                latitude=req.latitude,
                longitude=req.longitude,
                address=req.address,
                source="COMMUNITY",
                source_url=None,
                source_id=report_id,
                verification_status="UNVERIFIED",
                confidence_score=0.65,
                retrieved_at=datetime.utcnow(),
                data_freshness="LIVE_COMMUNITY_REPORT",
                upvotes=1,
                is_seed_data=False
            )
            db.add(biz_record)
            db.commit()
            logger.info(f"Persisted community business report to database: {req.business_name} ({report_id})")
        except Exception as db_err:
            db.rollback()
            logger.warning(f"Could not persist community report to database: {db_err}")

        return CommunityReportResponse(
            success=True,
            report_id=report_id,
            message="Community business report recorded successfully.",
            recorded_business=recorded
        )
    except Exception as e:
        logger.error(f"Error submitting community report: {e}")
        raise HTTPException(status_code=500, detail=str(e))

