-- Política de empresa: Las entradas NO se pueden editar ni eliminar
-- Solo se pueden ver y crear. Para correcciones usar ajustes de inventario.

-- Actualizar permisos de entradas para TODOS los roles
-- Remover permisos de edición y eliminación de entradas

-- Rol Administrador (role_id = 1): Solo view y create para entradas
UPDATE role_permissions 
SET can_edit = 0, can_delete = 0 
WHERE role_id = 1 AND permission_id IN (5, 6, 7, 8); -- IDs de entradas_view, entradas_create, entradas_edit, entradas_delete

-- Rol Gerente (role_id = 2): Solo view y create para entradas  
UPDATE role_permissions 
SET can_edit = 0, can_delete = 0 
WHERE role_id = 2 AND permission_id IN (5, 6, 7, 8);

-- Rol Usuario (role_id = 3): Solo view para entradas (ya está así)
UPDATE role_permissions 
SET can_create = 0, can_edit = 0, can_delete = 0 
WHERE role_id = 3 AND permission_id IN (5, 6, 7, 8);

-- Rol Operador (role_id = 4): Solo view y create para entradas
UPDATE role_permissions 
SET can_edit = 0, can_delete = 0 
WHERE role_id = 4 AND permission_id IN (5, 6, 7, 8);

-- Verificar cambios
SELECT 
    r.name as rol,
    p.name as permiso,
    rp.can_view,
    rp.can_create,
    rp.can_edit,
    rp.can_delete
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id  
JOIN permissions p ON rp.permission_id = p.id
WHERE p.module = 'entradas'
ORDER BY r.name, p.name;
