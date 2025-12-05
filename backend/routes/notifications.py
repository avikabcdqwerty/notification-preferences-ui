from typing import List
from fastapi import APIRouter, Depends, Query, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import logging

from backend.models import NotificationType, Base
from backend.schemas import NotificationTypeOut, NotificationTypeListResponse, ErrorResponse
from backend.middleware.auth import get_current_user
from backend.routes.dependencies import get_db

router = APIRouter()

logger = logging.getLogger("notification_preferences_api.notifications")

@router.get(
    "/",
    response_model=NotificationTypeListResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        500: {"model": ErrorResponse, "description": "Internal Server Error"},
    },
    summary="Get all available notification types",
    description="Fetches all available notification types and their descriptions, localized to the user's language. Unavailable/deprecated types are hidden or clearly marked."
)
async def get_notification_types(
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    lang: str = Query("en", min_length=2, max_length=5, description="Language code for localization (e.g., 'en', 'fr').")
) -> NotificationTypeListResponse:
    """
    Returns a list of notification types and their descriptions, localized to the user's language.
    Only available types are shown; deprecated types are marked with explanations.
    """
    try:
        # Query all notification types, including deprecated for marking
        notification_types: List[NotificationType] = db.query(NotificationType).all()

        # Filter and annotate types for response
        result_types: List[NotificationTypeOut] = []
        for nt in notification_types:
            # Hide unavailable types
            if not nt.available:
                continue
            # Mark deprecated types with reason
            nt_out = NotificationTypeOut(
                id=nt.id,
                key=nt.key,
                descriptions=nt.descriptions,
                available=nt.available,
                deprecated=nt.deprecated,
                deprecated_reason=nt.deprecated_reason,
                created_at=nt.created_at,
                updated_at=nt.updated_at
            )
            result_types.append(nt_out)

        # Sort for consistent UI (e.g., by key)
        result_types.sort(key=lambda x: x.key)

        return NotificationTypeListResponse(notification_types=result_types)
    except SQLAlchemyError as e:
        logger.error(f"Database error fetching notification types: {e}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=ErrorResponse(detail="Failed to fetch notification types. Please try again later.").dict()
        )
    except Exception as e:
        logger.exception("Unhandled error in get_notification_types")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=ErrorResponse(detail="Internal server error. Please try again later.").dict()
        )

# Exported: router