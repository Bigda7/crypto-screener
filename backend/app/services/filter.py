from typing import List, Tuple
from app.models.schemas import ProjectData
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class ProjectFilterService:
    """
    Evaluates crypto projects against Spredo's 6 strict criteria:
    1. Market Capitalization (mcap) > 0
    2. preview_listing == true
    3. Max Supply == Total Supply (both non-null)
    4. Fully Diluted Valuation (FDV) < $100M
    5. 24h Trading Volume > $50,000
    6. Total Value Locked (TVL) > $50,000
    """

    @staticmethod
    def matches_criteria(
        project: ProjectData,
        min_mcap: float = settings.MIN_MCAP,
        require_preview_listing: bool = settings.REQUIRE_PREVIEW_LISTING,
        max_fdv: float = settings.MAX_FDV,
        min_24h_volume: float = settings.MIN_24H_VOLUME,
        min_tvl: float = settings.MIN_TVL,
    ) -> Tuple[bool, List[str]]:
        """
        Check if a project satisfies all criteria.
        Returns a tuple: (passes: bool, failed_reasons: List[str]).
        """
        failed_reasons = []

        # 1. Market Cap > 0
        if project.market_cap is None or project.market_cap <= min_mcap:
            failed_reasons.append(f"mcap <= {min_mcap} (actual: {project.market_cap})")

        # 2. preview_listing == true
        if require_preview_listing and not project.preview_listing:
            failed_reasons.append(f"preview_listing is not True (actual: {project.preview_listing})")

        # 3. Max Supply equals Total Supply
        if project.max_supply is None or project.total_supply is None:
            failed_reasons.append(
                f"Supply values missing (max_supply: {project.max_supply}, total_supply: {project.total_supply})"
            )
        elif project.max_supply != project.total_supply:
            failed_reasons.append(
                f"max_supply != total_supply ({project.max_supply} != {project.total_supply})"
            )

        # 4. FDV < $100M
        if project.fully_diluted_valuation is None or project.fully_diluted_valuation >= max_fdv:
            failed_reasons.append(
                f"FDV >= {max_fdv} or missing (actual: {project.fully_diluted_valuation})"
            )

        # 5. 24h Volume > $50k
        if project.total_volume is None or project.total_volume <= min_24h_volume:
            failed_reasons.append(
                f"24h volume <= {min_24h_volume} or missing (actual: {project.total_volume})"
            )

        # 6. TVL > $50k
        if project.tvl is None or project.tvl <= min_tvl:
            failed_reasons.append(
                f"TVL <= {min_tvl} or missing (actual: {project.tvl})"
            )

        return len(failed_reasons) == 0, failed_reasons

    @classmethod
    def filter_projects(
        cls,
        projects: List[ProjectData],
        min_mcap: float = settings.MIN_MCAP,
        require_preview_listing: bool = settings.REQUIRE_PREVIEW_LISTING,
        max_fdv: float = settings.MAX_FDV,
        min_24h_volume: float = settings.MIN_24H_VOLUME,
        min_tvl: float = settings.MIN_TVL,
    ) -> List[ProjectData]:
        """Filters a list of projects returning only those that satisfy all 6 rules."""
        matched: List[ProjectData] = []
        for p in projects:
            passes, _ = cls.matches_criteria(
                project=p,
                min_mcap=min_mcap,
                require_preview_listing=require_preview_listing,
                max_fdv=max_fdv,
                min_24h_volume=min_24h_volume,
                min_tvl=min_tvl,
            )
            if passes:
                matched.append(p)
        return matched
