"""add message citations

Adds a nullable JSONB ``citations`` column to ``messages`` so an assistant
answer's structured citations (page + chunk id + quote) persist and reload with
the chat history (see docs/llm.md, docs/api.md).

Revision ID: c4e7a1f9b2d0
Revises: b3d351d114bb
Create Date: 2026-08-05 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c4e7a1f9b2d0"
down_revision: str | Sequence[str] | None = "b3d351d114bb"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "messages",
        sa.Column("citations", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("messages", "citations")
