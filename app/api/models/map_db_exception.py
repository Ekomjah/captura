import logging
from sqlalchemy import exc as sa_exc

logger = logging.getLogger(__name__)


def _map_db_exception(
    exc: Exception, *, action: str = "access"
) -> tuple[str, str, int]:
    """Categorize a database exception so the frontend can distinguish
    transient network issues from permanent configuration errors."""
    logger.exception("Database %s failed", action)

    if isinstance(exc, sa_exc.OperationalError):
        message = str(exc).lower()
        if any(
            phrase in message
            for phrase in (
                "could not connect",
                "connection refused",
                "connection timed out",
                "no route to host",
                "connection reset",
                "could not translate host",
                "name or service not known",
            )
        ):
            return (
                "DatabaseConnectionError",
                "The database server is unreachable — this may be a temporary "
                "network issue. Please try again in a moment.",
                503,
            )
        if any(
            phrase in message
            for phrase in (
                "authentication",
                "password",
                "login",
            )
        ):
            return (
                "DatabaseAuthError",
                "Database authentication failed. Please verify the credentials.",
                500,
            )
        # Catch-all for other operational errors (disk full, etc.)
        return (
            "DatabaseError",
            "A database operation failed. Please try again later.",
            500,
        )

    if isinstance(exc, sa_exc.DBAPIError):
        return (
            "DatabaseError",
            "A database operation failed. Please try again later.",
            500,
        )

    # Unexpected error class — log and return generic
    return (
        "DatabaseError",
        "An unexpected database error occurred.",
        500,
    )
