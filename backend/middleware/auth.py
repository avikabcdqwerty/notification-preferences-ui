from typing import Optional, Dict, Any
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp, Receive, Scope, Send
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends, HTTPException

import logging
import jwt  # PyJWT (latest stable)
import os

logger = logging.getLogger("notification_preferences_api.auth")

# Secret key for JWT validation (should be set securely in environment)
JWT_SECRET = os.getenv("JWT_SECRET", "change_this_secret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

class AuthMiddleware(BaseHTTPMiddleware):
    """
    FastAPI middleware to enforce authentication on protected endpoints.
    Only allows requests with valid JWT Bearer tokens.
    """
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.bearer = HTTPBearer(auto_error=False)

    async def dispatch(self, request: Request, call_next):
        # Allow unauthenticated access to health and docs endpoints
        if request.url.path.startswith("/health") or \
           request.url.path.startswith("/docs") or \
           request.url.path.startswith("/openapi.json") or \
           request.url.path.startswith("/redoc"):
            return await call_next(request)

        credentials: Optional[HTTPAuthorizationCredentials] = await self.bearer(request)
        if credentials is None or credentials.scheme.lower() != "bearer":
            logger.info("Missing or invalid authentication credentials")
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Authentication required. Please log in."}
            )

        token = credentials.credentials
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            # Attach user info to request state for downstream usage
            request.state.user = payload
        except jwt.ExpiredSignatureError:
            logger.info("Expired JWT token")
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Session expired. Please log in again."}
            )
        except jwt.InvalidTokenError:
            logger.info("Invalid JWT token")
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid authentication token."}
            )
        except Exception as e:
            logger.exception("Unhandled authentication error")
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Authentication failed. Please log in."}
            )

        return await call_next(request)

def get_current_user(request: Request) -> Dict[str, Any]:
    """
    Dependency to retrieve current authenticated user from request state.
    Raises HTTPException if user is not authenticated.
    Returns:
        dict: User payload from JWT.
    """
    user = getattr(request.state, "user", None)
    if not user:
        logger.info("No authenticated user found in request state")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in."
        )
    return user

# Exported: AuthMiddleware, get_current_user