from pydantic import BaseModel, Field
from typing import Optional, List


class ProjectData(BaseModel):
    id: str
    symbol: str
    name: str
    image: Optional[str] = None
    current_price: Optional[float] = None
    market_cap: Optional[float] = Field(default=None, description="Market Capitalization (mcap)")
    market_cap_rank: Optional[int] = None
    total_volume: Optional[float] = Field(default=None, description="24h Trading Volume")
    fully_diluted_valuation: Optional[float] = Field(default=None, description="FDV")
    total_supply: Optional[float] = None
    max_supply: Optional[float] = None
    circulating_supply: Optional[float] = None
    preview_listing: bool = Field(default=False, description="Preview listing flag")
    tvl: Optional[float] = Field(default=None, description="Total Value Locked")


class ProjectsResponse(BaseModel):
    total: int
    data: List[ProjectData]
    cached: bool = False
    source: str = "coingecko_live"
    timestamp: str


class CriteriaResponse(BaseModel):
    min_mcap: float
    require_preview_listing: bool
    supply_rule: str
    max_fdv: float
    min_24h_volume: float
    min_tvl: float



class HealthResponse(BaseModel):
    status: str
    version: str
