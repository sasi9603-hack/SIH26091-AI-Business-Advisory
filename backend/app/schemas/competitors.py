from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any

class CompetitorItem(BaseModel):
    id: str
    name: str
    category: str
    source: Literal['GOOGLE_MAPS', 'OPENSTREETMAP', 'UDYAM', 'COMMUNITY'] = 'GOOGLE_MAPS'
    confidenceScore: float = 0.90
    verificationStatus: Literal['VERIFIED', 'UNVERIFIED'] = 'VERIFIED'
    distanceKm: float = Field(..., alias="distance_km")
    lat: float = Field(..., alias="latitude")
    lng: float = Field(..., alias="longitude")
    address: str
    google_maps_url: Optional[str] = Field(None, alias="googleMapsUrl")
    place_id: Optional[str] = None
    rating: Optional[float] = None
    user_ratings_total: Optional[int] = None
    osm_type: Optional[str] = "google_place"
    reportedDate: Optional[str] = "Google Maps Verified Place"
    upvotes: Optional[int] = 0
    tags: Optional[Dict[str, Any]] = None

    class Config:
        populate_by_name = True

class CompetitorSearchRequest(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Proposed latitude")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Proposed longitude")
    business_category: str = Field(..., description="Business category, e.g. bakery, grocery, restaurant, cafe, pharmacy, clothing, agro-repair")
    radius_km: float = Field(default=3.0, ge=0.1, le=50.0, description="Radius in kilometers")

class CompetitorSearchResponse(BaseModel):
    competitor_count: int
    business_category: str
    radius_km: float
    disclaimer: str
    status: Literal['success', 'degraded'] = 'success'
    businesses: List[CompetitorItem]

class CommunityReportRequest(BaseModel):
    business_name: str = Field(..., min_length=2, max_length=150)
    category: str = Field(...)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    address: str = Field(..., min_length=3)
    pincode: Optional[str] = None
    reporter_notes: Optional[str] = None

class CommunityReportResponse(BaseModel):
    success: bool
    report_id: str
    message: str
    recorded_business: CompetitorItem
