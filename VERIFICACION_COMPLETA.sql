-- ===============================================
-- VERIFICACIÓN SISTEMA RBAC INSTALADO
-- Base de datos: u322888101_beexenty_inv
-- ===============================================

-- 1. Estructura de la tabla users
DESCRIBE users;

-- 2. Ver todos los usuarios actuales
SELECT user_id, username, name, email, group_id, role_id, created_at 
FROM users 
ORDER BY user_id;

-- 3. Ver todos los roles disponibles
SELECT id, name, description 
FROM roles 
ORDER BY id;

-- 4. Ver usuarios con sus roles asignados
SELECT 
    u.username,
    u.name as nombre_completo,
    COALESCE(r.name, 'Sin rol') as rol_asignado,
    u.role_id
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
ORDER BY u.username;

-- 5. Verificar si existen los usuarios específicos
SELECT 
    CASE 
        WHEN username = 'pavelino' THEN '✅ pavelino encontrado'
        WHEN username = 'gflores' THEN '✅ gflores encontrado'
        WHEN username = 'mcabrera' THEN '✅ mcabrera encontrado'
        WHEN username = 'eavila' THEN '✅ eavila encontrado'
        ELSE CONCAT('❓ ', username, ' (otro usuario)')
    END as estado_usuario,
    username,
    name,
    role_id
FROM users
ORDER BY username;

-- 6. Ver permisos configurados por rol
SELECT 
    r.name as rol,
    p.resource as recurso,
    rp.can_view as ver,
    rp.can_create as crear,
    rp.can_edit as editar,
    rp.can_delete as eliminar
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
ORDER BY r.name, p.resource;

-- 7. Verificar campos de proveedor en artículos
DESCRIBE articles;

SELECT '🎯 VERIFICACIÓN COMPLETA - SISTEMA LISTO PARA PROBAR' as resultado;
