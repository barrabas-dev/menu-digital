import { useAuthStore } from '../../store/authStore';
import styles from './DashboardPage.module.css';

const ROLE_LABELS = {
  superadmin: 'Superadministrador',
  restaurant: 'Restaurante',
};

const ROLE_COPY = {
  superadmin: 'Tienes acceso a todos los restaurantes registrados en el sistema.',
  restaurant: 'Estás administrando el menú de tu propio restaurante.',
};

/**
 * Placeholder de Fase 1: solo existe para comprobar visualmente que el
 * store reacciona distinto según el rol devuelto por authService.
 * En una fase posterior esto se reemplaza por las rutas reales
 * (/admin, /restaurante) protegidas con React Router.
 */
export default function DashboardPage() {
  const userRole = useAuthStore((state) => state.userRole);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className={styles.stage}>
      <div className={styles.frame}>
        <p className={styles.eyebrow}>sesión activa</p>
        <h1 className={styles.title}>{ROLE_LABELS[userRole] ?? 'Rol desconocido'}</h1>
        <p className={styles.body}>{ROLE_COPY[userRole]}</p>
        <p className={styles.token}>token · {token}</p>
        <button className={styles.logout} onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
