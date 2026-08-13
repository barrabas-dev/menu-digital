import { create } from 'zustand';

/**
 * Estado global de autenticación.
 *
 * En esta fase el store solo refleja lo que le pasa authService.js
 * (mockeado). Cuando exista el backend real, login() seguirá recibiendo
 * la misma forma { token, role } — no debería cambiar nada aquí.
 */
export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  userRole: null, // 'superadmin' | 'restaurant'
  token: null,

  login: ({ token, role }) =>
    set({
      isAuthenticated: true,
      token,
      userRole: role,
    }),

  logout: () =>
    set({
      isAuthenticated: false,
      token: null,
      userRole: null,
    }),
}));
