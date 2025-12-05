import React from 'react';
import { useTranslation } from 'react-i18next';

interface NotificationType {
  id: number;
  key: string;
  descriptions: Record<string, string>;
  available: boolean;
  deprecated: boolean;
  deprecated_reason?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface NotificationTypeCardProps {
  notificationType: NotificationType;
  language: string;
}

/**
 * NotificationTypeCard
 * Reusable, accessible card for displaying a notification type.
 * Handles deprecated marking, tooltips, and localization.
 */
const NotificationTypeCard: React.FC<NotificationTypeCardProps> = ({
  notificationType,
  language,
}) => {
  const { t } = useTranslation();

  // Get localized description, fallback to English
  const description =
    notificationType.descriptions[language] ||
    notificationType.descriptions['en'] ||
    t('noDescription');

  // Accessibility: tooltip for deprecated reason
  const deprecatedTooltipId = `deprecated-tooltip-${notificationType.id}`;

  return (
    <article
      aria-labelledby={`notification-type-title-${notificationType.id}`}
      aria-describedby={`notification-type-desc-${notificationType.id}`}
      tabIndex={0}
      style={{
        border: '2px solid',
        borderColor: notificationType.deprecated ? '#ffb300' : '#e0e0e0',
        background: notificationType.deprecated ? '#fffbe6' : '#f9f9f9',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        outline: 'none',
        transition: 'box-shadow 0.2s',
        position: 'relative',
      }}
      role="region"
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <h2
          id={`notification-type-title-${notificationType.id}`}
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            margin: 0,
            color: '#222',
          }}
        >
          {t(`notificationType.${notificationType.key}`, notificationType.key)}
        </h2>
        {notificationType.deprecated && (
          <span
            aria-label={t('deprecated')}
            tabIndex={0}
            style={{
              background: '#ffb300',
              color: '#222',
              borderRadius: '4px',
              padding: '0.25em 0.5em',
              fontSize: '0.95em',
              fontWeight: 500,
              marginLeft: '0.5em',
              cursor: 'help',
              outline: 'none',
            }}
            aria-describedby={deprecatedTooltipId}
          >
            {t('deprecated')}
            <span
              id={deprecatedTooltipId}
              role="tooltip"
              style={{
                display: 'inline-block',
                marginLeft: '0.5em',
                background: '#fffbe6',
                color: '#a8071a',
                border: '1px solid #ffb300',
                borderRadius: '4px',
                padding: '0.25em 0.5em',
                fontSize: '0.9em',
                fontWeight: 400,
                position: 'absolute',
                left: '100%',
                top: '0',
                whiteSpace: 'nowrap',
                zIndex: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                visibility: notificationType.deprecated_reason ? 'visible' : 'hidden',
              }}
            >
              {notificationType.deprecated_reason}
            </span>
          </span>
        )}
      </header>
      <p
        id={`notification-type-desc-${notificationType.id}`}
        style={{
          margin: '1rem 0 0 0',
          color: '#444',
          fontSize: '1rem',
        }}
      >
        {description}
      </p>
    </article>
  );
};

export default NotificationTypeCard;