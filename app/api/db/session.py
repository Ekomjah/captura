import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# SQLite (used in tests) uses SingletonThreadPool which doesn't accept
# pool-tuning arguments. Only configure the connection pool for Postgres.
_is_sqlite = DATABASE_URL.startswith("sqlite")
_engine_kwargs: dict = {"pool_pre_ping": not _is_sqlite}
if not _is_sqlite:
    _engine_kwargs.update(
        pool_recycle=300,
        pool_size=5,
        max_overflow=10,
        pool_timeout=5,
        connect_args={"connect_timeout": 5},
    )

engine = create_engine(DATABASE_URL, **_engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
