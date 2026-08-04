"""Dashboard stats route. Scoped to the signed-in user."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DbSession

from app.db import get_db
from app.dependencies import CurrentUser
from app.schemas.common import DataEnvelope
from app.schemas.stats import StatsOut
from app.services import sessions as sessions_service

router = APIRouter(prefix="/api", tags=["stats"])


@router.get("/stats", response_model=DataEnvelope[StatsOut])
def read_stats(
    user: CurrentUser,
    db: DbSession = Depends(get_db),
) -> DataEnvelope[StatsOut]:
    """Return the current user's aggregate counts for the dashboard cards."""
    data = sessions_service.compute_stats(db, user.id)
    return DataEnvelope(data=data)
