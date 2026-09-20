from pydantic import BaseModel, Field
from typing import List, Optional

class UdyamSectorItem(BaseModel):
    nic_code: str
    nic_description: str
    micro_enterprise_count: int
    small_enterprise_count: int
    medium_enterprise_count: int
    total_registered: int

class UdyamQueryRequest(BaseModel):
    district: str
    state: Optional[str] = None
    category: Optional[str] = None

class UdyamQueryResponse(BaseModel):
    district: str
    state: str
    category_filter: Optional[str] = None
    total_enterprises: int
    sector_breakdown: List[UdyamSectorItem]
    data_source: str = "Ministry of MSME / UDYAM Registration Registry"

class MSMEClassification(BaseModel):
    micro: int
    small: int
    medium: int
    total: int
    micro_dominance_pct: float

class SectorDistribution(BaseModel):
    manufacturing_units: Optional[int] = None
    services_units: Optional[int] = None

class UdyamNormalizedResponse(BaseModel):
    location_identifier: str
    district: str
    state: str
    category_filter: Optional[str] = None
    total_enterprises: int
    msme_classification: MSMEClassification
    sector_distribution: SectorDistribution
    top_sectors: List[UdyamSectorItem]
    source: str
    source_url: str
    retrieved_at: str
    data_freshness: str
    disclaimer: str = (
        "Official UDYAM registration figures reflect formally registered MSME units only. "
        "Informal micro-vendors, roadside artisans, seasonal rural traders, and unorganized micro-shops are not captured in official UDYAM registries."
    )

