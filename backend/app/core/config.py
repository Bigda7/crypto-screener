from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "Crypto Screener API"
    VERSION: str = "0.1.0"
    API_PREFIX: str = "/api"
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]
    
    # CoinGecko Settings
    COINGECKO_BASE_URL: str = "https://api.coingecko.com/api/v3"
    COINGECKO_API_KEY: str = ""
    CACHE_TTL_SECONDS: int = 180  # 3 minutes cache

    # Filter Criteria Defaults (from task specifications)
    MIN_MCAP: float = 0.0
    REQUIRE_PREVIEW_LISTING: bool = True
    MAX_FDV: float = 100_000_000.0  # $100M
    MIN_24H_VOLUME: float = 50_000.0  # $50k
    MIN_TVL: float = 50_000.0  # $50k

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()
