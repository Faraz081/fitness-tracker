import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { SettingsProvider } from './context/SettingsContext';
import './index.css';
createRoot(document.getElementById('root')).render(<StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationsProvider>
          <SettingsProvider>
            <App />
          </SettingsProvider>
        </NotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>);
