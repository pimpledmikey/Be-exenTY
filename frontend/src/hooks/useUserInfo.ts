import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

interface UserInfo {
  user_id: number;
  username: string;
  role_id: number;
  role_name: string;
}

export const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/login/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
      }
    } catch (error) {
      console.error('Error cargando información del usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  return { userInfo, loading };
};
