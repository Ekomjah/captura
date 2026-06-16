# app/api/deps.py
import re
from asyncio.log import logger

import jwt
from core.config import get_settings
from fastapi import Depends, Header, HTTPException
from jwt import PyJWKClient
from models.model import User
from services.db_service import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

_jwks_client: PyJWKClient | None = None
_jwks_client_url: str | None = None


def _get_jwks_client() -> PyJWKClient:
    settings = get_settings()
    if not settings.clerk_jwks_url:
        raise HTTPException(status_code=500, detail="Clerk JWKS URL is not configured")

    global _jwks_client, _jwks_client_url
    if _jwks_client is None or _jwks_client_url != settings.clerk_jwks_url:
        _jwks_client = PyJWKClient(settings.clerk_jwks_url, cache_keys=True)
        _jwks_client_url = settings.clerk_jwks_url
    return _jwks_client


def _is_allowed_azp(azp: str) -> bool:
    settings = get_settings()

    # check regex first — covers dynamic preview URLs
    if settings.allowed_origin_regex and re.fullmatch(
        settings.allowed_origin_regex, azp
    ):
        return True

    exact_origins = settings.clerk_authorized_parties or settings.allowed_origins
    return azp in exact_origins


async def get_current_user(
    authorization: str = Header(...), db: AsyncSession = Depends(get_db)
):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.removeprefix("Bearer ")

    try:
        signing_key = _get_jwks_client().get_signing_key_from_jwt(token)
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
    logger.warning(f"DEBUG azp: '{azp}'")  # remove after confirming

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
