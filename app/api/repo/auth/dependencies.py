import logging

import jwt
from fastapi import Depends, Header, HTTPException
from models.model import User
from seed.seed import seed_user_assets
from services.db_service import get_db
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


def _get_token_payload(authorization: str | None) -> dict:
    if not authorization:
        return {}

    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        return {}

    try:
        return jwt.decode(token, options={"verify_signature": False})
    except Exception:
        return {}


def _email_from_payload(payload: dict, clerk_id: str) -> str:
    for claim in ("email", "email_address", "primary_email_address"):
        email = payload.get(claim)
        if isinstance(email, str) and email:
            return email

    return f"{clerk_id}@clerk.local"


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    payload = _get_token_payload(authorization)
    clerk_id = payload.get("sub")

    if not isinstance(clerk_id, str) or not clerk_id:
        raise HTTPException(
            status_code=401,
            detail="Authentication required: no valid user found.",
        )

    user = db.query(User).filter(User.clerk_id == clerk_id).first()
    if user:
        return user

    user = User(clerk_id=clerk_id, email=_email_from_payload(payload, clerk_id))
    db.add(user)
    db.commit()
    db.refresh(user)
    seed_user_assets(db, user.id)
    logger.info(
        "get_current_user: lazily created and seeded user_id=%s clerk_id=%s",
        user.id,
        clerk_id,
    )
    return user
