import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider } from './context/AppContext.tsx';
import 'leaflet/dist/leaflet.css';
import { SocketProvider } from './context/SocketContext.tsx';

export const authService = 'https://cravio-auth-s63j.onrender.com';
export const restaurantService = 'https://cravio-restaurant-1.onrender.com';
export const utilsService = 'https://cravio-utils.onrender.com'
export const realtimeServer = 'https://cravio-realtime.onrender.com'
export const riderServer = 'https://cravio-rider.onrender.com'
export const adminServer = 'https://cravio-admin-qh3b.onrender.com'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="684657779588-73eje3ik892mr1kgic3or3jnsmtktlfa.apps.googleusercontent.com">
      <AppProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
