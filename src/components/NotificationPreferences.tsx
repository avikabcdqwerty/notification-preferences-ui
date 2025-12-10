import React, { useEffect, useState, KeyboardEvent } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@mui/material'; // Assumes MUI is installed for accessible tooltips
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';

// Types for notification types
export interface NotificationType {
  id: string;
  name: string;
  description: string;
  available: boolean;
  deprecated: boolean;
  explanation?: string;
}

// Fetcher for SWR, ensures HTTPS and error handling
const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: 'include', // Ensures cookies/session for auth
    headers: {
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    const error = new Error('Failed to fetch');
    // Attach status for error handling
    (error as any).status = response.status;
    throw error;
  }
  return response.json();
};

// Accessible focus management for error and loading states
const focusRef = React.createRef<HTMLDivElement>();

/**
 * NotificationPreferences
 * Main UI component for displaying and managing notification preferences.
 * Handles authentication, localization, accessibility, error, and loading states.
 */
const NotificationPreferences: React.FC = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // SWR for notification types
  const {
    data: notificationTypes,
    error,
    isLoading,
  } = useSWR<NotificationType[]>('/api/notification-types', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  // Authentication check (could be replaced with context/provider in larger app)
  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check', {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) {
          if (isMounted) setIsAuthenticated(false);
        } else {
          if (isMounted) setIsAuthenticated(true);
        }
      } catch {
        if (isMounted) setIsAuthenticated(false);
      }
    };
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  // Redirect unauthenticated users
  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace(`/login?redirect=${encodeURIComponent(router.asPath)}`);
    }
  }, [isAuthenticated, router]);

  // Focus error/loading for accessibility
  useEffect(() => {
    if ((error || isLoading) && focusRef.current) {
      focusRef.current.focus();
    }
  }, [error, isLoading]);

  // Loading indicator for heavy load
  if (isAuthenticated === null || isLoading) {
    return (
      <Box
        ref={focusRef}
        tabIndex={-1}
        aria-busy="true"
        aria-live="polite"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 8,
        }}
      >
        <CircularProgress aria-label={t('loading')} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {t('notificationPreferences.loading', 'Loading notification preferences...')}
        </Typography>
      </Box>
    );
  }

  // Error handling
  if (error) {
    let errorMsg = t(
      'notificationPreferences.error.generic',
      'Unable to load notification preferences. Please try again later.'
    );
    if ((error as any).status === 401) {
      errorMsg = t(
        'notificationPreferences.error.unauthenticated',
        'You must be logged in to view notification preferences.'
      );
    }
    return (
      <Box
        ref={focusRef}
        tabIndex={-1}
        aria-live="assertive"
        sx={{ mt: 8, mx: 'auto', maxWidth: 600 }}
      >
        <Alert severity="error" role="alert">
          {errorMsg}
        </Alert>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => router.replace(`/login?redirect=${encodeURIComponent(router.asPath)}`)}
        >
          {t('notificationPreferences.loginButton', 'Log In')}
        </Button>
      </Box>
    );
  }

  // No data case
  if (!notificationTypes || notificationTypes.length === 0) {
    return (
      <Box
        ref={focusRef}
        tabIndex={-1}
        aria-live="polite"
        sx={{ mt: 8, mx: 'auto', maxWidth: 600 }}
      >
        <Alert severity="info" role="status">
          {t('notificationPreferences.noTypes', 'No notification types available.')}
        </Alert>
      </Box>
    );
  }

  // Keyboard navigation for deprecated/unavailable tooltips
  const handleKeyDownTooltip = (event: KeyboardEvent<HTMLSpanElement>, explanation: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      // Show tooltip (handled by MUI)
      event.preventDefault();
    }
  };

  return (
    <Box
      component="main"
      aria-labelledby="notification-preferences-title"
      sx={{
        mx: 'auto',
        maxWidth: 800,
        p: 2,
      }}
    >
      <Typography
        id="notification-preferences-title"
        variant="h4"
        component="h1"
        tabIndex={0}
        sx={{ mb: 3, fontWeight: 'bold' }}
      >
        {t('notificationPreferences.title', 'Notification Preferences')}
      </Typography>
      <Divider aria-hidden="true" sx={{ mb: 2 }} />

      <Box
        role="list"
        aria-label={t('notificationPreferences.listLabel', 'List of notification types')}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        {notificationTypes.map((type) => {
          // Hide unavailable types unless deprecated (show explanation)
          if (!type.available && !type.deprecated) {
            return null;
          }

          const isInactive = !type.available || type.deprecated;
          const explanation =
            type.explanation ||
            (type.deprecated
              ? t(
                  'notificationPreferences.deprecatedExplanation',
                  'This notification type is deprecated and may be removed soon.'
                )
              : t(
                  'notificationPreferences.unavailableExplanation',
                  'This notification type is currently unavailable.'
                ));

          return (
            <Paper
              key={type.id}
              role="listitem"
              elevation={isInactive ? 1 : 3}
              sx={{
                p: 2,
                opacity: isInactive ? 0.6 : 1,
                backgroundColor: isInactive ? 'grey.100' : 'background.paper',
                border: isInactive ? '1px dashed #aaa' : '1px solid #e0e0e0',
                position: 'relative',
                outline: 'none',
                '&:focus-within': {
                  boxShadow: '0 0 0 2px #1976d2',
                },
              }}
              tabIndex={0}
              aria-disabled={isInactive}
              aria-describedby={isInactive ? `explanation-${type.id}` : undefined}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="h6"
                  component="span"
                  sx={{
                    fontWeight: 'bold',
                    color: isInactive ? 'text.secondary' : 'text.primary',
                  }}
                  tabIndex={0}
                  aria-label={t('notificationPreferences.typeName', {
                    name: type.name,
                  })}
                >
                  {t(`notificationTypes.${type.id}.name`, type.name)}
                </Typography>
                {isInactive && (
                  <Tooltip
                    title={explanation}
                    enterTouchDelay={0}
                    leaveTouchDelay={3000}
                    aria-label={explanation}
                  >
                    <span
                      tabIndex={0}
                      role="button"
                      aria-describedby={`explanation-${type.id}`}
                      onKeyDown={(e) => handleKeyDownTooltip(e, explanation)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        marginLeft: 4,
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        focusable="false"
                        style={{ color: '#1976d2' }}
                      >
                        <circle cx="12" cy="12" r="10" fill="#1976d2" />
                        <text
                          x="12"
                          y="16"
                          textAnchor="middle"
                          fontSize="14"
                          fill="#fff"
                          fontFamily="Arial, sans-serif"
                        >
                          ?
                        </text>
                      </svg>
                    </span>
                  </Tooltip>
                )}
              </Box>
              <Typography
                variant="body1"
                sx={{
                  mt: 1,
                  color: isInactive ? 'text.secondary' : 'text.primary',
                }}
                aria-label={t('notificationPreferences.typeDescription', {
                  name: type.name,
                  description: type.description,
                })}
              >
                {t(`notificationTypes.${type.id}.description`, type.description)}
              </Typography>
              {isInactive && (
                <Typography
                  id={`explanation-${type.id}`}
                  variant="caption"
                  sx={{ mt: 1, color: 'error.main' }}
                  aria-live="polite"
                >
                  {explanation}
                </Typography>
              )}
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};

export default NotificationPreferences;