"""Sessions resource routes. Scoped to the signed-in user."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DbSession

from app.db import get_db
from app.dependencies import CurrentUser
from app.schemas.common import DataEnvelope
from app.schemas.session import SessionOut
from app.services import sessions as sessions_service

router = APIRouter(prefix="/api", tags=["sessions"])


@router.get("/sessions", response_model=DataEnvelope[list[SessionOut]])
def list_sessions(
    user: CurrentUser,
    db: DbSession = Depends(get_db),
) -> DataEnvelope[list[SessionOut]]:
    """Return the current user's sessions for the dashboard, newest first."""
    data = sessions_service.list_sessions(db, user.id)
    return DataEnvelope(data=data)
