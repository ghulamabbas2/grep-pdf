"""Current-user route. First protected `/api/*` endpoint."""

from fastapi import APIRouter

from app.dependencies import CurrentUser
from app.schemas.common import DataEnvelope
from app.schemas.user import UserOut

router = APIRouter(prefix="/api", tags=["me"])


@router.get("/me", response_model=DataEnvelope[UserOut])
def read_current_user(user: CurrentUser) -> DataEnvelope[UserOut]:
    """Return the signed-in user, derived solely from the verified token."""
    return DataEnvelope(data=UserOut.model_validate(user))
