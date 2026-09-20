from pydantic import BaseModel, Field
from typing import Optional, List

class GeocodeRequest(BaseModel):
    query: Optional[str] = Field(default=None, description="Free-text search query (PIN code, town, village, or district)")
    village_town: Optional[str] = Field(default=None, alias="villageTown")
    block: Optional[str] = Field(default=None, alias="mandal")
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None

    class Config:
        populate_by_name = True

class GeocodeResponse(BaseModel):
    latitude: float
    longitude: float
    display_name: str
    village_town: str
    block: Optional[str] = None
    district: str
    state: str
    pincode: str
    formatted_address: str
    is_approximate: bool = False
    bounding_box: Optional[List[float]] = None
