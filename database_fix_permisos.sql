-- Agregar permisos faltantes para módulos ajustes y stock
-- Insertar permisos para módulo "ajustes"
INSERT INTO permissions (name, description, module) VALUES 
('ajustes_view', 'Ver ajustes de inventario', 'ajustes'),
('ajustes_create', 'Crear nuevos ajustes', 'ajustes'),
('ajustes_edit', 'Editar ajustes existentes', 'ajustes'),
('ajustes_delete', 'Eliminar ajustes', 'ajustes');

-- Insertar permisos para módulo "stock"
INSERT INTO permissions (name, description, module) VALUES 
('stock_view', 'Ver stock de artículos', 'stock'),
('stock_create', 'Gestionar stock', 'stock'),
('stock_edit', 'Editar información de stock', 'stock'),
('stock_delete', 'Eliminar registros de stock', 'stock');

-- Asignar permisos al rol de Administrador (role_id = 1) - todos los permisos
INSERT INTO role_permissions (role_id, permission_id, can_view, can_create, can_edit, can_delete) VALUES 
-- Permisos de ajustes para Admin
(1, 20, 1, 1, 1, 1),
(1, 21, 1, 1, 1, 1),
(1, 22, 1, 1, 1, 1),
(1, 23, 1, 1, 1, 1),
-- Permisos de stock para Admin
(1, 24, 1, 1, 1, 1),
(1, 25, 1, 1, 1, 1),
(1, 26, 1, 1, 1, 1),
(1, 27, 1, 1, 1, 1);

-- Asignar permisos al rol de Gerente (role_id = 2) - crear y editar pero no eliminar
INSERT INTO role_permissions (role_id, permission_id, can_view, can_create, can_edit, can_delete) VALUES 
-- Permisos de ajustes para Gerente
(2, 20, 1, 1, 1, 0),
(2, 21, 1, 1, 1, 0),
(2, 22, 1, 1, 1, 0),
(2, 23, 1, 1, 1, 0),
-- Permisos de stock para Gerente
(2, 24, 1, 1, 1, 0),
(2, 25, 1, 1, 1, 0),
(2, 26, 1, 1, 1, 0),
(2, 27, 1, 1, 1, 0);

-- Asignar permisos al rol de Usuario (role_id = 3) - solo lectura
INSERT INTO role_permissions (role_id, permission_id, can_view, can_create, can_edit, can_delete) VALUES 
-- Permisos de ajustes para Usuario (solo lectura)
(3, 20, 1, 0, 0, 0),
(3, 21, 1, 0, 0, 0),
(3, 22, 1, 0, 0, 0),
(3, 23, 1, 0, 0, 0),
-- Permisos de stock para Usuario (solo lectura)
(3, 24, 1, 0, 0, 0),
(3, 25, 1, 0, 0, 0),
(3, 26, 1, 0, 0, 0),
(3, 27, 1, 0, 0, 0);

-- Asignar permisos al rol de Operador (role_id = 4) - crear y editar pero no eliminar
INSERT INTO role_permissions (role_id, permission_id, can_view, can_create, can_edit, can_delete) VALUES 
-- Permisos de ajustes para Operador
(4, 20, 1, 1, 1, 0),
(4, 21, 1, 1, 1, 0),
(4, 22, 1, 1, 1, 0),
(4, 23, 1, 1, 1, 0),
-- Permisos de stock para Operador
(4, 24, 1, 1, 1, 0),
(4, 25, 1, 1, 1, 0),
(4, 26, 1, 1, 1, 0),
(4, 27, 1, 1, 1, 0);
