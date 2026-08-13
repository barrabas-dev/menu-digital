/**
 * authService.js — MOCK
 *
 * Simula el endpoint /api/token/ de Django (ver informe técnico §9).
 * Cuando DRF exponga TokenObtainPairView de verdad, solo hay que
 * reemplazar el cuerpo de login() por un fetch/axios real — la firma
 * (recibe { email, password }, resuelve { token, role }) no cambia,
 * así que ni el store ni el componente de Login necesitan tocarse.
 */

const MOCK_USERS = [
  {
    email: 'admin@menudigital.dev',
    password: 'super2026',
    role: 'superadmin',
    token: 'mock-jwt-superadmin-token',
  },
  {
    email: 'restaurante@menudigital.dev',
    password: 'restaurante2026',
    role: 'restaurant',
    token: 'mock-jwt-restaurant-token',
  },
];

const SIMULATED_NETWORK_DELAY_MS = 1600;

export function login({ email, password }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = MOCK_USERS.find(
        (candidate) => candidate.email === email && candidate.password === password
      );

      if (!user) {
        reject(new Error('Credenciales inválidas. Verifica tu correo y contraseña.'));
        return;
      }

      resolve({
        token: user.token,
        role: user.role,
      });
    }, SIMULATED_NETWORK_DELAY_MS);
  });
}
