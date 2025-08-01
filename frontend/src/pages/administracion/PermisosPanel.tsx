import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Alert, Badge, Spinner } from 'react-bootstrap';
import { useTheme } from '../../hooks/useTheme';

const API_URL = import.meta.env.VITE_API_URL;

// Estilos para las tarjetas de roles
const roleCardStyle = {
  marginBottom: '0.75rem',
  transition: 'all 0.2s ease',
  cursor: 'pointer'
};

interface User {
  id: number;
  username: string;
  name: string;
  role_name: string;
  role_id: number;
}

interface Role {
  id: number;
  name: string;
  description: string;
}

interface Permission {
  id: number;
  name: string;
  description: string;
  module: string;
}

interface RolePermission {
  role_id: number;
  permission_id: number;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

const PermisosPanel: React.FC = () => {
  const { theme } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

            // Cargar usuarios con roles
      const usersResponse = await fetch(`${API_URL}/roles/users`, { headers });
      const users = await usersResponse.json();
      setUsers(users);

      const rolesResponse = await fetch(`${API_URL}/roles`, { headers });
      const roles = await rolesResponse.json();
      setRoles(roles);

      const permissionsResponse = await fetch(`${API_URL}/roles/permissions`, { headers });
      const permissionsData = await permissionsResponse.json();

      setUsers(users);
      setRoles(roles);
      setPermissions(permissionsData);

    } catch (error) {
      console.error('Error cargando datos:', error);
      setMessage({ type: 'error', text: 'Error al cargar los datos' });
    } finally {
      setLoading(false);
    }
  };

  const loadRolePermissions = async (roleId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/roles/${roleId}/permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      // La respuesta viene directamente como array, no con wrapper success/data
      setRolePermissions(data);
      setSelectedRole(roleId);
    } catch (error) {
      console.error('Error cargando permisos del rol:', error);
    }
  };

  const updatePermission = async (permissionId: number, action: string, value: boolean) => {
    if (!selectedRole) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      // Encontrar el permiso actual o crear uno nuevo
      const existingPermission = rolePermissions.find(
        rp => rp.role_id === selectedRole && rp.permission_id === permissionId
      );

      const updatedPermission = {
        role_id: selectedRole,
        permission_id: permissionId,
        can_view: existingPermission?.can_view || false,
        can_create: existingPermission?.can_create || false,
        can_edit: existingPermission?.can_edit || false,
        can_delete: existingPermission?.can_delete || false,
        [action]: value
      };

      const response = await fetch(`${API_URL}/roles/permissions`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedPermission)
      });

      const data = await response.json();
      
      if (response.ok && (data.success !== false)) {
        // Actualizar el estado local
        setRolePermissions(prev => {
          const filtered = prev.filter(
            rp => !(rp.role_id === selectedRole && rp.permission_id === permissionId)
          );
          return [...filtered, updatedPermission];
        });
        setMessage({ type: 'success', text: 'Permiso actualizado correctamente' });
      } else {
        setMessage({ type: 'error', text: data.message || data.error || 'Error al actualizar permiso' });
      }
    } catch (error) {
      console.error('Error actualizando permiso:', error);
      setMessage({ type: 'error', text: 'Error al actualizar permiso' });
    } finally {
      setSaving(false);
    }
  };

  const getPermissionValue = (permissionId: number, action: string): boolean => {
    const permission = rolePermissions.find(
      rp => rp.role_id === selectedRole && rp.permission_id === permissionId
    );
    return permission ? permission[action as keyof RolePermission] as boolean : false;
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="page-header d-print-none">
            <div className="container-xl">
              <div className="row g-2 align-items-center">
                <div className="col">
                  <h2 className="page-title">Panel de Administración de Permisos</h2>
                  <div className="text-muted mt-1">
                    Gestiona roles y permisos de usuarios de forma dinámica
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="container-xl">
          {message && (
            <Alert 
              variant={message.type === 'success' ? 'success' : 'danger'}
              dismissible
              onClose={() => setMessage(null)}
              className="mb-3"
            >
              {message.text}
            </Alert>
          )}

          <div className="row row-deck row-cards">
            {/* Lista de Roles */}
            <div className="col-md-4">
              <Card data-bs-theme={theme}>
                <Card.Header>
                  <Card.Title>Gestión de Roles</Card.Title>
                  <div className="text-muted small">
                    Selecciona un rol para configurar sus permisos
                  </div>
                </Card.Header>
                <Card.Body style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  <div className="d-flex flex-column gap-3">
                    {roles.map(role => {
                      const usersWithRole = users.filter(u => u.role_id === role.id);
                      return (
                        <Card key={role.id} className={`role-card ${selectedRole === role.id ? 'border-primary' : ''}`} style={roleCardStyle}>
                          <Card.Body className="p-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <h6 className="mb-1">{role.name}</h6>
                                <small className="text-muted">{role.description}</small>
                              </div>
                              <Badge 
                                bg={theme === 'light' ? 'info' : 'info'} 
                                className="ms-2"
                                style={{ 
                                  color: theme === 'light' ? '#000' : '#fff', 
                                  fontWeight: 500,
                                  backgroundColor: theme === 'light' ? '#d1ecf1' : '#0dcaf0'
                                }}
                              >
                                {usersWithRole.length} {usersWithRole.length === 1 ? 'usuario' : 'usuarios'}
                              </Badge>
                            </div>
                            
                            {usersWithRole.length > 0 && (
                              <div className="mb-2">
                                <small className="text-muted">Usuarios:</small>
                                <div className="mt-1">
                                  {usersWithRole.map(user => (
                                    <Badge 
                                      key={user.id} 
                                      bg={theme === 'light' ? 'light' : 'secondary'} 
                                      className="me-1 mb-1"
                                      style={{ 
                                        color: theme === 'light' ? '#000' : '#fff', 
                                        fontWeight: 500, 
                                        border: theme === 'light' ? '1px solid #dee2e6' : '1px solid #495057',
                                        backgroundColor: theme === 'light' ? '#f8f9fa' : '#6c757d'
                                      }}
                                    >
                                      {user.username}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <Button
                              size="sm"
                              variant={selectedRole === role.id ? "primary" : "outline-primary"}
                              onClick={() => loadRolePermissions(role.id)}
                              className="w-100"
                            >
                              {selectedRole === role.id ? "✓ Editando Permisos" : "Configurar Permisos"}
                            </Button>
                          </Card.Body>
                        </Card>
                      );
                    })}
                  </div>
                </Card.Body>
              </Card>
            </div>

            {/* Panel de Permisos */}
            <div className="col-md-8">
              <Card data-bs-theme={theme}>
                <Card.Header>
                  <Card.Title>
                    Configuración de Permisos
                    {selectedRole && (
                      <Badge 
                        bg="primary" 
                        className="ms-2"
                        style={{ 
                          color: '#fff', 
                          fontWeight: 500,
                          backgroundColor: theme === 'light' ? '#0d6efd' : '#0d6efd'
                        }}
                      >
                        {roles.find(r => r.id === selectedRole)?.name}
                      </Badge>
                    )}
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  {!selectedRole ? (
                    <div className="text-center py-5">
                      <div className="text-muted">
                        <svg className="icon icon-lg mb-3" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                          <path d="M12 3a9 9 0 0 1 9 9a9 9 0 0 1 -9 9a9 9 0 0 1 -9 -9a9 9 0 0 1 9 -9"/>
                          <path d="M12 9h.01"/>
                          <path d="M11 12h1v4h1"/>
                        </svg>
                        <h3>Selecciona un rol para configurar</h3>
                        <p>Haz clic en "Configurar Permisos" de cualquier rol para establecer sus permisos.<br/>
                        <small className="text-info">
                          💡 Los cambios se aplicarán automáticamente a todos los usuarios con ese rol.
                        </small></p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                      {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                        <div key={module} className="mb-4">
                          <h5 className="text-primary border-bottom pb-2 mb-3">
                            {module.charAt(0).toUpperCase() + module.slice(1)}
                          </h5>
                          <Table size="sm" bordered>
                            <thead className="table-light">
                              <tr>
                                <th style={{ width: '30%' }}>Permiso</th>
                                <th style={{ width: '17.5%' }} className="text-center">Ver</th>
                                <th style={{ width: '17.5%' }} className="text-center">Crear</th>
                                <th style={{ width: '17.5%' }} className="text-center">Editar</th>
                                <th style={{ width: '17.5%' }} className="text-center">Eliminar</th>
                              </tr>
                            </thead>
                            <tbody>
                              {modulePermissions.map(permission => (
                                <tr key={permission.id}>
                                  <td>
                                    <strong>{permission.name}</strong>
                                    <br />
                                    <small className="text-muted">{permission.description}</small>
                                  </td>
                                  <td className="text-center">
                                    <Form.Check
                                      type="checkbox"
                                      checked={getPermissionValue(permission.id, 'can_view')}
                                      onChange={(e) => updatePermission(permission.id, 'can_view', e.target.checked)}
                                      disabled={saving}
                                    />
                                  </td>
                                  <td className="text-center">
                                    <Form.Check
                                      type="checkbox"
                                      checked={getPermissionValue(permission.id, 'can_create')}
                                      onChange={(e) => updatePermission(permission.id, 'can_create', e.target.checked)}
                                      disabled={saving}
                                    />
                                  </td>
                                  <td className="text-center">
                                    <Form.Check
                                      type="checkbox"
                                      checked={getPermissionValue(permission.id, 'can_edit')}
                                      onChange={(e) => updatePermission(permission.id, 'can_edit', e.target.checked)}
                                      disabled={saving}
                                    />
                                  </td>
                                  <td className="text-center">
                                    <Form.Check
                                      type="checkbox"
                                      checked={getPermissionValue(permission.id, 'can_delete')}
                                      onChange={(e) => updatePermission(permission.id, 'can_delete', e.target.checked)}
                                      disabled={saving}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermisosPanel;
