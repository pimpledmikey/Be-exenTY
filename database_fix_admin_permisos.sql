-- Script simplificado para asegurar permisos de ajustes y stock
-- Ejecutar este script si los módulos de ajustes y stock no funcionan

-- Primero verificar si los permisos existen
SELECT * FROM permissions WHERE module IN ('ajustes', 'stock');

-- Si no existen, los insertamos
INSERT IGNORE INTO permissions (name, description, module) VALUES 
('ajustes_view', 'Ver ajustes de inventario', 'ajustes'),
('ajustes_create', 'Crear nuevos ajustes', 'ajustes'),
('ajustes_edit', 'Editar ajustes existentes', 'ajustes'),
('ajustes_delete', 'Eliminar ajustes', 'ajustes'),
('stock_view', 'Ver stock de artículos', 'stock'),
('stock_create', 'Gestionar stock', 'stock'),
('stock_edit', 'Editar información de stock', 'stock'),
('stock_delete', 'Eliminar registros de stock', 'stock');

-- Asignar TODOS los permisos al rol de Administrador (role_id = 1) usando JOIN directo
INSERT IGNORE INTO role_permissions (role_id, permission_id, can_view, can_create, can_edit, can_delete) 
SELECT 
    1 as role_id,
    p.id as permission_id,
    1 as can_view,
    1 as can_create,
    1 as can_edit,
    1 as can_delete
FROM permissions p 
WHERE p.module IN ('ajustes', 'stock')
AND p.id NOT IN (
    SELECT permission_id 
    FROM role_permissions 
    WHERE role_id = 1 AND permission_id = p.id
);

-- Verificar que mavila tiene los permisos
SELECT 
    u.username,
    r.name as rol,
    p.module,
    p.name as permiso,
    rp.can_view,
    rp.can_create,
    rp.can_edit,
    rp.can_delete
FROM users u
JOIN roles r ON u.role_id = r.id
JOIN role_permissions rp ON u.role_id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.username = 'mavila' AND p.module IN ('ajustes', 'stock')
ORDER BY p.module, p.name;
