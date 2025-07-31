import React from 'react';
import { Alert } from 'react-bootstrap';

interface PermissionAlertProps {
  show: boolean;
  onClose: () => void;
  action?: string;
  module?: string;
}

export const PermissionAlert: React.FC<PermissionAlertProps> = ({ 
  show, 
  onClose, 
  action = 'realizar esta acción',
  module = ''
}) => {
  if (!show) return null;

  return (
    <Alert variant="warning" dismissible onClose={onClose} className="mb-3">
      <Alert.Heading>
        <i className="fas fa-exclamation-triangle me-2"></i>
        Sin permisos suficientes
      </Alert.Heading>
      <p className="mb-0">
        No tienes los permisos necesarios para {action}
        {module && ` en ${module}`}. 
        Contacta al administrador del sistema.
      </p>
    </Alert>
  );
};

interface PermissionGuardProps {
  children: React.ReactNode;
  module: string;
  permission: string;
  action: 'view' | 'create' | 'edit' | 'delete';
  canPerform: (module: string, permission: string, action: 'view' | 'create' | 'edit' | 'delete') => boolean;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  module,
  permission,
  action,
  canPerform,
  fallback = null
}) => {
  if (!canPerform(module, permission, action)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};
