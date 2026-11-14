"""
neemSEO Database Session and Engine setup.
Supports SQLite (Phase 1) and PostgreSQL (Production) with zero code changes.
"""

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from neemseo.core.config import settings

# Configure SQLite or PostgreSQL
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False
    connect_args["timeout"] = 30

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False,
)

# Enable foreign key support for SQLite
if settings.DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables in the database if they don't exist and ensure SQLite schema migrations."""
    Base.metadata.create_all(bind=engine)
    if settings.DATABASE_URL.startswith("sqlite"):
        with engine.begin() as conn:
            try:
                res = conn.exec_driver_sql("PRAGMA table_info(users)")
                cols = [row[1] for row in res.fetchall()]
                if cols and "api_token" not in cols:
                    conn.exec_driver_sql("ALTER TABLE users ADD COLUMN api_token VARCHAR(128)")
            except Exception:
                pass

