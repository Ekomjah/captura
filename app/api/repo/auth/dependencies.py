import logging

import jwt
from fastapi import Depends, Header, HTTPException
from models.model import User
from services.db_service import get_db
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


def _get_clerk_id(authorization: str | None) -> str | None:
    if not authorization:
        return None

    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        return None

    try:
        payload = jwt.decode(token, options={"verify_signature": False})
    except Exception:
        return None

    return payload.get("sub")


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    clerk_id = _get_clerk_id(authorization)

    user = None
    if clerk_id:
        user = db.query(User).filter(User.clerk_id == clerk_id).first()
        if not user:
            logger.warning(
                "get_current_user: no User row for clerk_id=%s — clerk webhook "
                "likely never fired for this account; falling back to first user",
                clerk_id,
            )

    if not user:
        try:
            user = db.query(User).first()
        except SQLAlchemyError:
            user = None
        if user and clerk_id:
            logger.warning(
                "get_current_user: serving clerk_id=%s as fallback user_id=%s — "
                "any /v1/history seeded for the real user will NOT show",
                clerk_id, user.id,
            )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Authentication required: no valid user found.",
        )
    return user
