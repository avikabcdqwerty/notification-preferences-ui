import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from backend.routes.notifications import router as notifications_router
from backend.middleware.auth import AuthMiddleware

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s"
)
logger = logging.getLogger("notification_preferences_api")

def create_app() -> FastAPI:
    """
    Create and configure FastAPI application.
    Returns:
        FastAPI: Configured FastAPI app instance.
    """
    app = FastAPI(
        title="Notification Preferences API",
        description="API for managing and displaying notification types and descriptions.",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json"
    )

    # Enforce HTTPS in production (remove/comment for local dev if needed)
    app.add_middleware(HTTPSRedirectMiddleware)

    # CORS configuration (adjust origins as needed)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["https://your-frontend-domain.com"],  # Update with actual frontend domain
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Custom authentication middleware
    app.add_middleware(AuthMiddleware)

    # Include notification routes
    app.include_router(notifications_router, prefix="/api/notifications", tags=["Notifications"])

    # Global exception handlers
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        logger.warning(f"HTTPException: {exc.detail} (status: {exc.status_code})")
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail}
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.error(f"Validation error: {exc.errors()}")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": "Invalid request data.", "errors": exc.errors()}
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled exception occurred")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error. Please try again later."}
        )

    @app.get("/health", tags=["Health"])
    async def health_check():
        """
        Health check endpoint.
        Returns:
            dict: Health status.
        """
        return {"status": "ok"}

    return app

app = create_app()

# Exported: FastAPI app instance