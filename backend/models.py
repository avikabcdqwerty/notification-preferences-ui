from typing import Dict
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    JSON,
    func,
    Index
)
from sqlalchemy.ext.declarative import declarative_base

# SQLAlchemy Base for model definitions
Base = declarative_base()

class NotificationType(Base):
    """
    SQLAlchemy model for notification types and their descriptions.
    Supports localization via JSON field for descriptions.
    """
    __tablename__ = "notification_types"

    id = Column(Integer, primary_key=True, autoincrement=True)
    key = Column(String(64), unique=True, nullable=False, index=True, doc="Unique key for notification type (e.g., 'email_alert')")
    # Localized descriptions: { "en": "English desc", "fr": "French desc", ... }
    descriptions = Column(JSON, nullable=False, doc="Localized descriptions for notification type")
    available = Column(Boolean, nullable=False, default=True, index=True, doc="Is this notification type currently available?")
    deprecated = Column(Boolean, nullable=False, default=False, index=True, doc="Is this notification type deprecated?")
    deprecated_reason = Column(String(256), nullable=True, doc="Reason for deprecation (if deprecated)")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, doc="Creation timestamp")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False, doc="Last update timestamp")

    def get_description(self, lang: str = "en") -> str:
        """
        Get the localized description for the notification type.
        Args:
            lang (str): Language code (e.g., 'en', 'fr').
        Returns:
            str: Localized description if available, else English or empty string.
        """
        if not self.descriptions:
            return ""
        return self.descriptions.get(lang) or self.descriptions.get("en") or ""

    def as_dict(self) -> Dict:
        """
        Serialize the notification type to a dictionary.
        Returns:
            dict: Serialized notification type.
        """
        return {
            "id": self.id,
            "key": self.key,
            "descriptions": self.descriptions,
            "available": self.available,
            "deprecated": self.deprecated,
            "deprecated_reason": self.deprecated_reason,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

# Indexes for performance on large tables
Index("ix_notification_types_available", NotificationType.available)
Index("ix_notification_types_deprecated", NotificationType.deprecated)

# Exported: Base, NotificationType