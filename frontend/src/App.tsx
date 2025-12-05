import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n';
import NotificationPreferences from './components/NotificationPreferences';
import { isAuthenticated } from './utils/auth';

/**
 * ProtectedRoute component to enforce authentication.
 * Redirects unauthenticated users to login page.
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isAuthenticated()) {
    // Redirect to login page or show login prompt
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

/**
 * Placeholder Login component.
 * Replace with actual login implementation.
 */
const Login: React.FC = () => (
  <main
    aria-label={i18n.t('loginPage')}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#f8f9fa',
    }}
  >
    <h1>{i18n.t('loginTitle')}</h1>
    <p>{i18n.t('loginPrompt')}</p>
    {/* Add login form or OAuth button here */}
  </main>
);

/**
 * Main App component.
 * Sets up routing, localization, and accessibility.
 */
const App: React.FC = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <NotificationPreferences />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          {/* Add additional routes as needed */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </I18nextProvider>
  );
};

export default App;