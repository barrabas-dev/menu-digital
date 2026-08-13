import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { login as loginRequest } from '../../services/authService';
import styles from './LoginPage.module.css';
import logoSrc from '../../assets/video-menu.png';

function formatElapsed(ms) {
  const totalCentiseconds = Math.floor(ms / 10);
  const seconds = Math.floor(totalCentiseconds / 100);
  const centiseconds = totalCentiseconds % 100;
  return `${String(seconds).padStart(2, '0')}:${String(centiseconds).padStart(2, '0')}`;
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | error
  const [errorMessage, setErrorMessage] = useState('');
  const [elapsed, setElapsed] = useState(0);

  const startRef = useRef(null);
  const intervalRef = useRef(null);
  const setAuth = useAuthStore((state) => state.login);

  const isLoading = status === 'loading';

  // Mientras dura la petición simulada, el botón muestra un timecode
  // en vez de un spinner — mismo lenguaje que el resto del sistema
  // (design-system.md §4: el timecode como elemento estructural).
  useEffect(() => {
    if (!isLoading) return undefined;

    startRef.current = performance.now();
    intervalRef.current = setInterval(() => {
      setElapsed(performance.now() - startRef.current);
    }, 40);

    return () => clearInterval(intervalRef.current);
  }, [isLoading]);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    setElapsed(0);

    try {
      const { token, userRole } = await loginRequest({ username, password });
      setAuth({ token, role: userRole });
      // no hace falta setStatus('idle'): el store cambia isAuthenticated
      // y App.jsx desmonta este componente.
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message);
    }
  }

  return (
    <div className={styles.stage}>
      <div className={styles.frame}>
        <img src={logoSrc} alt="Menú Digital" className={styles.logo} width={120} height={120} />
        <p className={styles.eyebrow}>acceso</p>
        <h1 className={styles.title}>Entra a tu sala de control</h1>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <label className={styles.field}>
            <span className={styles.label}>Usuario</span>
            <input
              className={styles.input}
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
              disabled={isLoading}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Contraseña</span>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              disabled={isLoading}
            />
          </label>

          {status === 'error' && (
            <p className={styles.errorText} role="alert">
              {errorMessage}
            </p>
          )}

          <button className={styles.submit} type="submit" disabled={isLoading}>
            {isLoading ? (
              <span className={styles.timecode}>{formatElapsed(elapsed)}</span>
            ) : (
              'Iniciar sesión'
            )}
          </button>

          {isLoading && (
            <span className={styles.scrubber} aria-hidden="true" />
          )}
        </form>
      </div>
    </div>
  );
}
