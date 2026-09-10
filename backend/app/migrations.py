"""Additive schema upgrades, including a backed-up nullable contact migration."""
from sqlalchemy import inspect, text, String
from alembic.migration import MigrationContext
from alembic.operations import Operations
from app.database import Base, engine


def initialize_database(target_engine=None):
    target_engine = target_engine or engine
    from app import models  # register all tables before create_all
    del models
    existing = inspect(target_engine)
    if "tests" in existing.get_table_names():
        test_columns = {c["name"] for c in existing.get_columns("tests")}
        email = next(c for c in existing.get_columns("users") if c["name"] == "email")
        if not {"set_number", "test_mode", "section_state"}.issubset(test_columns) or not email["nullable"]:
            if target_engine is engine:
                from app.services.backup import create_backup
                create_backup(label="before-migration")
    with target_engine.begin() as conn:
        if target_engine.dialect.name == "postgresql":
            conn.execute(text("SELECT pg_advisory_xact_lock(192004027)"))
        Base.metadata.create_all(bind=conn)
        columns = {c["name"] for c in inspect(conn).get_columns("tests")}
        additions = {"set_number": "INTEGER DEFAULT 1", "test_mode": "VARCHAR DEFAULT 'full'", "section_state": "JSON"}
        for name, sql_type in additions.items():
            if name not in columns:
                conn.execute(text(f"ALTER TABLE tests ADD COLUMN {name} {sql_type}"))
        email = next(c for c in inspect(conn).get_columns("users") if c["name"] == "email")
        if not email["nullable"]:
            operation = Operations(MigrationContext.configure(conn))
            with operation.batch_alter_table("users") as batch:
                batch.alter_column("email", existing_type=String(), nullable=True)
        # Existing data is retained; refuse ambiguous phone identities rather than merging users.
        from app.schemas.user import normalize_phone
        rows = conn.execute(text("SELECT id, phone FROM users WHERE phone IS NOT NULL")).all()
        phones = {}
        normalized = []
        for user_id, phone in rows:
            value = normalize_phone(phone)
            if value and value in phones:
                raise RuntimeError(f"Duplicate phone on user ids {phones[value]} and {user_id}; resolve before migration.")
            if value:
                phones[value] = user_id
            normalized.append({"id": user_id, "phone": value})
        for row in normalized:
            conn.execute(text("UPDATE users SET phone=:phone WHERE id=:id"), row)
        conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ux_users_phone ON users(phone)"))


if __name__ == "__main__":
    initialize_database()
    print("Database schema ready.")
