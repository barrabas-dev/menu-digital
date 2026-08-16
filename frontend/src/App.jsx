import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@fontsource/fraunces/400.css';
import '@fontsource/fraunces/500.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/ibm-plex-mono/500.css';

import { useAuthStore } from './store/authStore';
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/tokens.css';

export default function App() {
  const { isAuthenticated, userRole } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            !isAuthenticated ? (
              <LoginPage />
            ) : userRole === 'superadmin' ? (
              <Navigate to="/agencia" replace />
            ) : (
              <Navigate to="/restaurante" replace />
            )
          } 
        />
        
        <Route 
          path="/agencia" 
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/restaurante" 
          element={
            <ProtectedRoute allowedRoles={['restaurant']}>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}