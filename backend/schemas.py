from typing import Dict, Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class NotificationTypeBase(BaseModel):
    """
    Base schema for NotificationType.
    """
    key: str = Field(..., description="Unique key for notification type (e.g., 'email_alert').")
    descriptions: Dict[str, str] = Field(
        ..., 
        description="Localized descriptions for notification type. Keys are language codes (e.g., 'en', 'fr')."
    )
    available: bool = Field(..., description="Is this notification type currently available?")
    deprecated: bool = Field(..., description="Is this notification type deprecated?")
    deprecated_reason: Optional[str] = Field(
        None, 
        description="Reason for deprecation (if deprecated)."
    )

class NotificationTypeOut(NotificationTypeBase):
    """
    Output schema for NotificationType (API response).
    """
    id: int = Field(..., description="Unique identifier for notification type.")
    created_at: Optional[datetime] = Field(
        None, 
        description="Creation timestamp (ISO 8601)."
    )
    updated_at: Optional[datetime] = Field(
        None, 
        description="Last update timestamp (ISO 8601)."
    )

    class Config:
        orm_mode = True

class NotificationTypeListResponse(BaseModel):
    """
    Response schema for list of notification types.
    """
    notification_types: List[NotificationTypeOut] = Field(
        ..., 
        description="List of notification types and their descriptions."
    )

class ErrorResponse(BaseModel):
    """
    Standard error response schema.
    """
    detail: str = Field(..., description="Error message.")
    errors: Optional[List[dict]] = Field(
        None, 
        description="Optional list of error details."
    )

# Exported: NotificationTypeBase, NotificationTypeOut, NotificationTypeListResponse, ErrorResponse