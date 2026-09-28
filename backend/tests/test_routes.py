from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_criteria_endpoint():
    response = client.get("/api/criteria")
    assert response.status_code == 200
    data = response.json()
    assert data["min_mcap"] == 0.0
    assert data["require_preview_listing"] is True
    assert data["max_fdv"] == 100_000_000.0
    assert data["min_24h_volume"] == 50_000.0
    assert data["min_tvl"] == 50_000.0


def test_projects_endpoint_mock_filtered():
    response = client.get("/api/projects?use_mock=true&apply_filters=true")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    # Every returned project must satisfy the 6 criteria
    for p in data["data"]:
        assert p["market_cap"] > 0
        assert p["preview_listing"] is True
        assert p["max_supply"] == p["total_supply"]
        assert p["fully_diluted_valuation"] < 100_000_000
        assert p["total_volume"] > 50_000
        assert p["tvl"] > 50_000


def test_projects_endpoint_mock_unfiltered():
    response = client.get("/api/projects?use_mock=true&apply_filters=false")
    assert response.status_code == 200
    data = response.json()
    # Unfiltered mock dataset contains both passing and non-passing items (e.g. btc, eth)
    assert data["total"] > 6


def test_projects_endpoint_search():
    response = client.get("/api/projects?use_mock=true&apply_filters=true&search=blast")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert "Blast" in data["data"][0]["name"]


def test_projects_endpoint_custom_fdv():
    # Only projects with FDV < 15,000,000
    response = client.get("/api/projects?use_mock=true&apply_filters=true&max_fdv=15000000")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    for p in data["data"]:
        assert p["fully_diluted_valuation"] < 15_000_000
