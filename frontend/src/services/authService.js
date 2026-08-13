// frontend/src/services/authService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Credenciales inválidas o error de red');
    }

    const data = await response.json();

    // Estructura retornada hacia authStore.js
    return {
      token: data.access,
      refreshToken: data.refresh,
      userRole: data.user.rol,
      userId: data.user.id
    };

  } catch (error) {
    console.error("Error en la autenticación:", error);
    throw error;
  }
};