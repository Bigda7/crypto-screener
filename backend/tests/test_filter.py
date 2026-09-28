from app.models.schemas import ProjectData
from app.services.filter import ProjectFilterService


def create_valid_project(**overrides) -> ProjectData:
    base = {
        "id": "valid-token",
        "symbol": "VAL",
        "name": "Valid Token",
        "current_price": 1.0,
        "market_cap": 10_000_000.0,
        "total_volume": 100_000.0,
        "fully_diluted_valuation": 10_000_000.0,
        "total_supply": 10_000_000.0,
        "max_supply": 10_000_000.0,
        "preview_listing": True,
        "tvl": 100_000.0,
    }
    base.update(overrides)
    return ProjectData(**base)


class TestProjectFilterService:
    def test_valid_project_passes_all_criteria(self):
        p = create_valid_project()
        passes, reasons = ProjectFilterService.matches_criteria(p)
        assert passes is True
        assert len(reasons) == 0

    def test_market_cap_must_be_greater_than_zero(self):
        # mcap = 0
        p_zero = create_valid_project(market_cap=0.0)
        passes, reasons = ProjectFilterService.matches_criteria(p_zero)
        assert passes is False
        assert any("mcap <=" in r for r in reasons)

        # mcap is None
        p_none = create_valid_project(market_cap=None)
        passes, reasons = ProjectFilterService.matches_criteria(p_none)
        assert passes is False
        assert any("mcap <=" in r for r in reasons)

    def test_preview_listing_must_be_true(self):
        p = create_valid_project(preview_listing=False)
        passes, reasons = ProjectFilterService.matches_criteria(p)
        assert passes is False
        assert any("preview_listing is not True" in r for r in reasons)

    def test_supply_equality(self):
        # max_supply != total_supply
        p_unequal = create_valid_project(max_supply=100.0, total_supply=50.0)
        passes, reasons = ProjectFilterService.matches_criteria(p_unequal)
        assert passes is False
        assert any("max_supply != total_supply" in r for r in reasons)

        # None supply
        p_none = create_valid_project(max_supply=None)
        passes, reasons = ProjectFilterService.matches_criteria(p_none)
        assert passes is False
        assert any("Supply values missing" in r for r in reasons)

    def test_fdv_under_100m(self):
        # Exactly 100M should fail (< $100M)
        p_100m = create_valid_project(fully_diluted_valuation=100_000_000.0)
        passes, reasons = ProjectFilterService.matches_criteria(p_100m)
        assert passes is False
        assert any("FDV >=" in r for r in reasons)

        # 99.99M should pass
        p_under = create_valid_project(fully_diluted_valuation=99_999_999.0)
        passes, _ = ProjectFilterService.matches_criteria(p_under)
        assert passes is True

    def test_volume_greater_than_50k(self):
        # Exactly 50k should fail (> $50k)
        p_50k = create_valid_project(total_volume=50_000.0)
        passes, reasons = ProjectFilterService.matches_criteria(p_50k)
        assert passes is False
        assert any("24h volume <=" in r for r in reasons)

        # 50,001 should pass
        p_above = create_valid_project(total_volume=50_001.0)
        passes, _ = ProjectFilterService.matches_criteria(p_above)
        assert passes is True

    def test_tvl_greater_than_50k(self):
        # Exactly 50k should fail (> $50k)
        p_50k = create_valid_project(tvl=50_000.0)
        passes, reasons = ProjectFilterService.matches_criteria(p_50k)
        assert passes is False
        assert any("TVL <=" in r for r in reasons)

        # 50,001 should pass
        p_above = create_valid_project(tvl=50_001.0)
        passes, _ = ProjectFilterService.matches_criteria(p_above)
        assert passes is True

    def test_filter_projects_list(self):
        p_valid = create_valid_project(id="valid-1")
        p_invalid = create_valid_project(id="invalid-1", preview_listing=False)
        result = ProjectFilterService.filter_projects([p_valid, p_invalid])
        assert len(result) == 1
        assert result[0].id == "valid-1"
