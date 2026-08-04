---
name: alembic-migration-reminder
enabled: true
event: file
action: warn
conditions:
  - field: tool_name
    operator: regex_match
    pattern: ^(Edit|Write|MultiEdit)$
  - field: file_path
    operator: regex_match
    pattern: /backend/app/models
---

Model changed, human needs to review before generating an Alembic migration. Do not run alembic revision automatically. Wait for the human to review the model change and explicitly ask for the migration.
