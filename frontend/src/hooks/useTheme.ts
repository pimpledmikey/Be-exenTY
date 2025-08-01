import { useState, useEffect } from 'react';

export type Theme = 'dark' | 'light';

interface UseThemeReturn {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isLoading: boolean;
}

const API_URL = import.meta.env.VITE_API_URL;

export const useTheme = (): UseThemeReturn => {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [isLoading, setIsLoading] = useState(true);

  // Cargar tema del usuario desde el backend
  useEffect(() => {
    const loadUserTheme = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          
          // También obtener el tema del token JWT si está disponible
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          const userTheme = tokenPayload.user?.theme || userData.theme || 'dark';
          setThemeState(userTheme);
          
          // Aplicar tema al documento
          document.documentElement.setAttribute('data-bs-theme', userTheme);
        }
      } catch (error) {
        console.error('Error al cargar tema del usuario:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserTheme();
  }, []);

  // Función para cambiar tema
  const setTheme = async (newTheme: Theme) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Actualizar en el backend
      const response = await fetch(`${API_URL}/auth/me/theme`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ theme: newTheme })
      });

      if (response.ok) {
        setThemeState(newTheme);
        document.documentElement.setAttribute('data-bs-theme', newTheme);
        
        // Actualizar el localStorage si es necesario para mantener consistencia
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        if (tokenPayload.user) {
          tokenPayload.user.theme = newTheme;
          // Note: En un caso real, el token debería renovarse desde el backend
        }
      }
    } catch (error) {
      console.error('Error al actualizar tema:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    isLoading
  };
};
