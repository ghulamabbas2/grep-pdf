# grep.pdf — Database

Postgres accessed via **SQLAlchemy**, with schema changes managed by **Alembic** migrations. The **pgvector** extension provides the vector type and similarity search used for embeddings on the `chunks` table.

## Layout

- **Models** — `backend/app/models`. SQLAlchemy ORM models, one concern per module.
- **Session helper** — `backend/app/db`. Engine and session factory; import the session dependency here rather than constructing engines ad hoc.
- **Migrations** — Alembic. Every schema change (new table, column, index, or the `pgvector` extension) ships as a migration; never edit the DB out of band.

## Access rule

**Every query is scoped to the signed-in user's id.** All user-owned tables carry a `user_id` foreign key, and reads/writes filter on it. There are no unscoped queries against user data — treat a missing `user_id` filter as a bug.

## Core tables

| Table | Purpose | Key columns |
|-------|---------|-------------|
| `users` | Account records | `id` (PK) |
| `sessions` | Auth/login sessions | `id` (PK), `user_id` (FK) |
| `pdfs` | Uploaded PDF documents | `id` (PK), `user_id` (FK) |
| `chunks` | Text chunks extracted from PDFs, with embeddings | `id` (PK), `user_id` (FK), `pdf_id` (FK), `embedding` (`vector` column) |
| `messages` | Chat/query messages | `id` (PK), `user_id` (FK) |

## Indexes

- **`user_id` index on every user-owned table** (`sessions`, `pdfs`, `chunks`, `messages`) — supports the per-user query scoping above.
- **IVFFlat index on `chunks.embedding`** — pgvector approximate-nearest-neighbor index for similarity search over chunk embeddings.
