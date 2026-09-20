from pydantic import BaseModel, Field
from typing import Optional

class CensusDemographicsRequest(BaseModel):
    pincode: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None

class CensusDemographicsResponse(BaseModel):
    pincode: str
    district: str
    state: str
    total_population: int
    rural_population_pct: float
    total_households: int
    working_population_pct: float
    avg_household_size: float
    purchasing_power_tier: str
    source_reference: str

class DemographicsData(BaseModel):
    total_population: int
    rural_population_pct: Optional[float] = None
    total_households: Optional[int] = None
    avg_household_size: Optional[float] = None
    literacy_rate_pct: Optional[float] = None
    male_literacy_rate_pct: Optional[float] = None
    female_literacy_rate_pct: Optional[float] = None

class WorkforceData(BaseModel):
    working_population_pct: Optional[float] = None
    total_workers: Optional[int] = None
    main_workers: Optional[int] = None
    marginal_workers: Optional[int] = None
    agricultural_workers_pct: Optional[float] = None

class CensusNormalizedResponse(BaseModel):
    location_identifier: str
    pincode: Optional[str] = None
    district: str
    state: str
    demographics: DemographicsData
    workforce: WorkforceData
    purchasing_power_tier: str
    source: str
    source_url: str
    retrieved_at: str
    data_freshness: str
    disclaimer: str = (
        "Census indicators reflect official Primary Census Abstract (PCA) surveys by the Office of the Registrar General & Census Commissioner. "
        "Variables represent aggregated demographic and socioeconomic benchmarks; they do not count specific individual micro-business establishments."
    )

