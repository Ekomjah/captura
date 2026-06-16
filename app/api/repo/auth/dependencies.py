# app/api/deps.py
import re

import jwt
from core.config import get_settings
from fastapi import Depends, Header, HTTPException
from jwt import PyJWKClient
from models.model import User
from services.db_service import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

env_config = get_settings()


def _is_allowed_azp(azp: str) -> bool:
    # Check exact origins first
    if azp in env_config.allowed_origins:
        return True
    # Fall back to regex (for Vercel preview URLs etc.)
    if env_config.allowed_origin_regex:
        return bool(re.fullmatch(env_config.allowed_origin_regex, azp))
    return False


CLERK_JWKS_URL = "https://api.clerk.com/v1/jwks"

# Cached JWKS client — created once, reused across requests
_jwks_client = PyJWKClient(CLERK_JWKS_URL, cache_keys=True)


async def get_current_user(
    authorization: str = Header(...), db: AsyncSession = Depends(get_db)
):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.removeprefix("Bearer ")

    try:
        signing_key = _jwks_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={
                "verify_audience": False
            },  # Clerk JWTs have no audience by default
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")

    azp = payload.get("azp")

    if not azp or not _is_allowed_azp(azp):
        raise HTTPException(status_code=401, detail="Invalid token origin")

    clerk_id = payload["sub"]

    result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=404, detail="User not found - webhook may not have fired yet"
        )

    return user
