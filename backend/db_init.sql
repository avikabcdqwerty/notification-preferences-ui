-- SQL script to initialize the notification_types table for Notification Preferences UI
-- Supports localization, availability, deprecation, and audit timestamps

CREATE TABLE IF NOT EXISTS notification_types (
    id SERIAL PRIMARY KEY,
    key VARCHAR(64) UNIQUE NOT NULL,
    descriptions JSONB NOT NULL, -- Localized descriptions: {"en": "...", "fr": "...", ...}
    available BOOLEAN NOT NULL DEFAULT TRUE,
    deprecated BOOLEAN NOT NULL DEFAULT FALSE,
    deprecated_reason VARCHAR(256),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance and filtering
CREATE INDEX IF NOT EXISTS ix_notification_types_key ON notification_types (key);
CREATE INDEX IF NOT EXISTS ix_notification_types_available ON notification_types (available);
CREATE INDEX IF NOT EXISTS ix_notification_types_deprecated ON notification_types (deprecated);

-- Example seed data (for development/testing)
INSERT INTO notification_types (key, descriptions, available, deprecated, deprecated_reason)
VALUES
    (
        'email_alert',
        '{"en": "Email alerts", "fr": "Alertes par email"}',
        TRUE,
        FALSE,
        NULL
    ),
    (
        'sms_alert',
        '{"en": "SMS alerts", "fr": "Alertes SMS"}',
        TRUE,
        TRUE,
        'Replaced by push notifications'
    ),
    (
        'push_alert',
        '{"en": "Push notifications", "fr": "Notifications push"}',
        TRUE,
        FALSE,
        NULL
    ),
    (
        'legacy_alert',
        '{"en": "Legacy alerts", "fr": "Alertes héritées"}',
        FALSE,
        TRUE,
        'Deprecated and unavailable'
    );