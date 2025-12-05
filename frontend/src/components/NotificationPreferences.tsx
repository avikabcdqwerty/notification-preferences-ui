import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import NotificationTypeCard from './NotificationTypeCard';
import { getAuthToken } from '../utils/auth';

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

interface NotificationTypeListResponse {
  notification_types: NotificationType[];
}

const API_URL = process.env.REACT_APP_API_URL || '/api/notifications/';

/**
 * NotificationPreferences component
 * Displays all available notification types and their descriptions.
 * Handles loading, error, localization, and accessibility.
 */
const NotificationPreferences: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notification types from backend API
  useEffect(() => {
    const fetchNotificationTypes = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_URL}?lang=${i18n.language}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
            credentials: 'include',
          }
        );
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || t('fetchError'));
        }
        const data: NotificationTypeListResponse = await response.json();
        setNotificationTypes(data.notification_types);
      } catch (err: any) {
        setError(err.message || t('fetchError'));
      } finally {
        setLoading(false);
      }
    };
    fetchNotificationTypes();
  }, [i18n.language, t]);

  // Accessibility: focus management for error/loading
  useEffect(() => {
    if (error) {
      const errorElem = document.getElementById('notification-error');
      errorElem?.focus();
    }
    if (loading) {
      const loadingElem = document.getElementById('notification-loading');
      loadingElem?.focus();
    }
  }, [error, loading]);

  return (
    <main
      aria-label={t('notificationPreferences')}
      tabIndex={-1}
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem',
        background: '#fff',
        color: '#222',
      }}
    >
      <h1>{t('notificationPreferencesTitle')}</h1>
      <p>{t('notificationPreferencesDescription')}</p>

      {loading && (
        <div
          id="notification-loading"
          role="status"
          aria-live="polite"
          tabIndex={-1}
          style={{
            margin: '2rem 0',
            padding: '1rem',
            background: '#e9ecef',
            borderRadius: '4px',
            color: '#333',
          }}
        >
          <span className="sr-only">{t('loading')}</span>
          <span aria-hidden="true">{t('loading')}</span>
        </div>
      )}

      {error && (
        <div
          id="notification-error"
          role="alert"
          aria-live="assertive"
          tabIndex={-1}
          style={{
            margin: '2rem 0',
            padding: '1rem',
            background: '#ffe5e5',
            border: '1px solid #ff4d4f',
            borderRadius: '4px',
            color: '#a8071a',
          }}
        >
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <section
          aria-label={t('notificationTypesList')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            marginTop: '2rem',
          }}
        >
          {notificationTypes.length === 0 ? (
            <div
              role="note"
              aria-live="polite"
              style={{
                padding: '1rem',
                background: '#f6f6f6',
                borderRadius: '4px',
                color: '#555',
              }}
            >
              {t('noNotificationTypes')}
            </div>
          ) : (
            notificationTypes.map((type) => (
              <NotificationTypeCard
                key={type.id}
                notificationType={type}
                language={i18n.language}
              />
            ))
          )}
        </section>
      )}
    </main>
  );
};

export default NotificationPreferences;