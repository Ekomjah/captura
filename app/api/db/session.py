import os
from functools import lru_cache

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

load_dotenv()


@lru_cache(maxsize=1)
def get_engine() -> Engine:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL environment variable is not set")

    # SQLite (used in tests) uses SingletonThreadPool which doesn't accept
    # pool-tuning arguments. Only configure the connection pool for Postgres.
    is_sqlite = database_url.startswith("sqlite")
    engine_kwargs: dict = {"pool_pre_ping": not is_sqlite}
    if not is_sqlite:
        engine_kwargs.update(
            pool_recycle=300,
            pool_size=5,
            max_overflow=10,
            pool_timeout=5,
            connect_args={"connect_timeout": 5},
        )

    return create_engine(database_url, **engine_kwargs)


@lru_cache(maxsize=1)
def _get_session_factory() -> sessionmaker:
    return sessionmaker(autocommit=False, autoflush=False, bind=get_engine())


def SessionLocal() -> Session:
    return _get_session_factory()()
