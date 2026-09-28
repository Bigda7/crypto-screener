from fastapi import APIRouter
from app.models.schemas import HealthResponse
from app.core.config import settings

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Basic healthcheck endpoint to verify API operation."""
    return HealthResponse(status="ok", version=settings.VERSION)
