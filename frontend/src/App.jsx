// Fuentes self-hosted (@fontsource) — un solo peso por rol, el mínimo que
// usa el sistema de diseño (design-system.md §2). Si más adelante se
// necesita otro peso, se importa aquí, no desde un CDN.
import '@fontsource/fraunces/400.css';
import '@fontsource/fraunces/500.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/ibm-plex-mono/500.css';

import { useAuthStore } from './store/authStore';
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import './styles/tokens.css';

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return isAuthenticated ? <DashboardPage /> : <LoginPage />;
}