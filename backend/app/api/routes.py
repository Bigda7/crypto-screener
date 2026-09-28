from fastapi import APIRouter, Query
from datetime import datetime, timezone
from typing import Optional
from app.models.schemas import ProjectsResponse, CriteriaResponse, HealthResponse
from app.core.config import settings
from app.services.coingecko import coingecko_service
from app.services.filter import ProjectFilterService

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Basic healthcheck endpoint to verify API operation."""
    return HealthResponse(status="ok", version=settings.VERSION)


@router.get("/criteria", response_model=CriteriaResponse)
async def get_criteria():
    """Returns the 6 criteria requirements defined in the test specification."""
    return CriteriaResponse(
        min_mcap=settings.MIN_MCAP,
        require_preview_listing=settings.REQUIRE_PREVIEW_LISTING,
        supply_rule="max_supply == total_supply",
        max_fdv=settings.MAX_FDV,
        min_24h_volume=settings.MIN_24H_VOLUME,
        min_tvl=settings.MIN_TVL,
    )


@router.get("/projects", response_model=ProjectsResponse)
async def get_projects(
    force_refresh: bool = Query(False, description="Bypass cache and query live API"),
    use_mock: bool = Query(False, description="Use verified mock dataset"),
    apply_filters: bool = Query(True, description="Apply the 6 screening criteria"),
    max_fdv: Optional[float] = Query(None, description="Optional override/filter for maximum FDV"),
    search: Optional[str] = Query(None, description="Optional search by project name or symbol"),
):
    """
    Retrieves crypto projects, applies caching, and filters by criteria:
    - Market Cap > 0
    - preview_listing == True
    - max_supply == total_supply
    - FDV < $100M (or custom max_fdv)
    - 24h Trading Volume > $50k
    - TVL > $50k
    """
    raw_projects, is_cached, source = await coingecko_service.get_raw_projects(
        force_refresh=force_refresh,
        use_mock=use_mock,
    )

    effective_max_fdv = max_fdv if max_fdv is not None else settings.MAX_FDV

    if apply_filters:
        filtered = ProjectFilterService.filter_projects(
            projects=raw_projects,
            min_mcap=settings.MIN_MCAP,
            require_preview_listing=settings.REQUIRE_PREVIEW_LISTING,
            max_fdv=effective_max_fdv,
            min_24h_volume=settings.MIN_24H_VOLUME,
            min_tvl=settings.MIN_TVL,
        )
    else:
        filtered = raw_projects

    # Apply search filter if provided
    if search:
        s_lower = search.strip().lower()
        filtered = [
            p for p in filtered
            if s_lower in p.name.lower() or s_lower in p.symbol.lower()
        ]

    return ProjectsResponse(
        total=len(filtered),
        data=filtered,
        cached=is_cached,
        source=source,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
