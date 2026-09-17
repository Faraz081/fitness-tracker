import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { SettingsProvider } from './context/SettingsContext';
import { DashboardProvider } from './context/DashboardContext';
import './index.css';
createRoot(document.getElementById('root')).render(<StrictMode>
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          <DashboardProvider>
            <SettingsProvider>
              <NotificationsProvider>
                <App />
              </NotificationsProvider>
            </SettingsProvider>
          </DashboardProvider>
        </AuthProvider>
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>);
