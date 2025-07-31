import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

interface UserPermissions {
  [module: string]: {
    [permission: string]: {
      can_view: boolean;
      can_create: boolean;
      can_edit: boolean;
      can_delete: boolean;
    };
  };
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<UserPermissions>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserPermissions();
  }, []);

  const fetchUserPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/login/me/permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPermissions(data);
      }
    } catch (error) {
      console.error('Error cargando permisos del usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const canPerform = (module: string, permission: string, action: 'view' | 'create' | 'edit' | 'delete'): boolean => {
    const modulePermissions = permissions[module];
    if (!modulePermissions) return false;
    
    const permissionData = modulePermissions[permission];
    if (!permissionData) return false;
    
    switch (action) {
      case 'view': return permissionData.can_view;
      case 'create': return permissionData.can_create;
      case 'edit': return permissionData.can_edit;
      case 'delete': return permissionData.can_delete;
      default: return false;
    }
  };

  return { permissions, loading, canPerform };
};
