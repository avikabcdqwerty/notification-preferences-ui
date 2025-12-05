import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      notificationPreferences: 'Notification Preferences',
      notificationPreferencesTitle: 'Manage Your Notification Preferences',
      notificationPreferencesDescription: 'Choose which types of notifications you want to receive. Each type is described below.',
      notificationTypesList: 'List of Notification Types',
      noNotificationTypes: 'No notification types are available.',
      loading: 'Loading notification types...',
      fetchError: 'Unable to load notification types. Please try again later.',
      deprecated: 'Deprecated',
      noDescription: 'No description available.',
      loginPage: 'Login Page',
      loginTitle: 'Sign In',
      loginPrompt: 'Please sign in to access your notification preferences.',
      notificationType: {
        email_alert: 'Email Alerts',
        sms_alert: 'SMS Alerts',
        push_alert: 'Push Notifications',
        legacy_alert: 'Legacy Alerts',
      },
    },
  },
  fr: {
    translation: {
      notificationPreferences: 'Préférences de notification',
      notificationPreferencesTitle: 'Gérez vos préférences de notification',
      notificationPreferencesDescription: 'Choisissez les types de notifications que vous souhaitez recevoir. Chaque type est décrit ci-dessous.',
      notificationTypesList: 'Liste des types de notification',
      noNotificationTypes: 'Aucun type de notification disponible.',
      loading: 'Chargement des types de notification...',
      fetchError: 'Impossible de charger les types de notification. Veuillez réessayer plus tard.',
      deprecated: 'Obsolète',
      noDescription: 'Aucune description disponible.',
      loginPage: 'Page de connexion',
      loginTitle: 'Se connecter',
      loginPrompt: 'Veuillez vous connecter pour accéder à vos préférences de notification.',
      notificationType: {
        email_alert: 'Alertes par email',
        sms_alert: 'Alertes SMS',
        push_alert: 'Notifications push',
        legacy_alert: 'Alertes héritées',
      },
    },
  },
  // Add more languages here as needed
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: navigator.language.split('-')[0] || 'en', // Detect browser language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    keySeparator: '.',
    react: {
      useSuspense: false,
    },
  });

export default i18n;