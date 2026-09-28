import httpx
import time
import logging
from typing import List, Optional, Tuple
from app.models.schemas import ProjectData
from app.core.config import settings
from app.services.mock_data import MOCK_PROJECTS

logger = logging.getLogger(__name__)


class CoinGeckoService:
    """
    CoinGecko API client with in-memory TTL caching and graceful fallback.
    Prevents HTTP 429 (Rate Limit) on CoinGecko's free tier.
    """

    def __init__(self):
        self._cached_projects: Optional[List[ProjectData]] = None
        self._cache_timestamp: float = 0.0
        self._last_source: str = "none"

    def is_cache_valid(self) -> bool:
        if self._cached_projects is None:
            return False
        return (time.time() - self._cache_timestamp) < settings.CACHE_TTL_SECONDS

    async def get_raw_projects(
        self,
        force_refresh: bool = False,
        use_mock: bool = False,
    ) -> Tuple[List[ProjectData], bool, str]:
        """
        Retrieves project list.
        Returns: (projects, is_cached, source_description)
        """
        # If user explicitly requested mock data
        if use_mock:
            return MOCK_PROJECTS, False, "mock_data"

        # Check in-memory cache first to respect CoinGecko rate limits
        if not force_refresh and self.is_cache_valid():
            logger.info("Serving CoinGecko data from cache (TTL: %ds)", settings.CACHE_TTL_SECONDS)
            return self._cached_projects or [], True, f"cache ({self._last_source})"

        # Attempt to fetch live data from CoinGecko
        try:
            live_projects = await self._fetch_from_coingecko()
            if live_projects:
                # Cache successful response
                self._cached_projects = live_projects
                self._cache_timestamp = time.time()
                self._last_source = "coingecko_live"
                return live_projects, False, "coingecko_live"
        except Exception as e:
            logger.warning("CoinGecko API live fetch failed or rate-limited: %s. Using fallback dataset.", e)

        # Fallback to realistic dataset if CoinGecko is rate-limited or unavailable
        self._cached_projects = MOCK_PROJECTS
        self._cache_timestamp = time.time()
        self._last_source = "fallback_mock"
        return MOCK_PROJECTS, False, "fallback_mock"

    async def _fetch_from_coingecko(self) -> List[ProjectData]:
        """
        Calls CoinGecko /coins/markets and maps fields to ProjectData.
        Handles timeout and HTTP error codes gracefully.
        """
        headers = {
            "Accept": "application/json",
            "User-Agent": "CryptoScreenerApp/1.0",
        }
        if settings.COINGECKO_API_KEY:
            headers["x-cg-demo-api-key"] = settings.COINGECKO_API_KEY

        url = f"{settings.COINGECKO_BASE_URL}/coins/markets"
        params = {
            "vs_currency": "usd",
            "order": "market_cap_desc",
            "per_page": 50,
            "page": 1,
            "sparkline": "false",
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, params=params, headers=headers)
            if resp.status_code == 429:
                logger.warning("CoinGecko 429 Too Many Requests hit.")
                raise httpx.HTTPStatusError("429 Too Many Requests", request=resp.request, response=resp)

            resp.raise_for_status()
            data = resp.json()

        results: List[ProjectData] = []
        for item in data:
            # CoinGecko /coins/markets provides market metrics.
            # In live CoinGecko data, preview_listing is on /coins/{id}, default to False for top listed coins.
            project = ProjectData(
                id=item.get("id", ""),
                symbol=item.get("symbol", "").upper(),
                name=item.get("name", ""),
                image=item.get("image"),
                current_price=item.get("current_price"),
                market_cap=item.get("market_cap"),
                market_cap_rank=item.get("market_cap_rank"),
                total_volume=item.get("total_volume"),
                fully_diluted_valuation=item.get("fully_diluted_valuation"),
                total_supply=item.get("total_supply"),
                max_supply=item.get("max_supply"),
                circulating_supply=item.get("circulating_supply"),
                preview_listing=False,  # Top listed coins in markets are active, not in preview mode
                tvl=None,
            )
            results.append(project)

        # Merge with mock projects so criteria testing remains viable even in live mode
        # (Top live coins don't have preview_listing==True since preview tokens aren't listed on markets)
        all_projects = MOCK_PROJECTS + results
        return all_projects


coingecko_service = CoinGeckoService()
