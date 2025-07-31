-- ===============================================
-- VERIFICACIÓN AJUSTADA - SIN CREATED_AT
-- Base de datos: u322888101_beexenty_inv
-- ===============================================

-- 1. Estructura de la tabla users (EJECUTAR PRIMERO)
DESCRIBE users;

-- 2. Ver todos los usuarios actuales (SIN created_at)
SELECT user_id, username, name, email, group_id, role_id
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

-- 6. Contar usuarios por rol
SELECT 
    r.name as rol,
    COUNT(u.user_id) as cantidad_usuarios
FROM roles r
LEFT JOIN users u ON r.id = u.role_id
GROUP BY r.id, r.name
ORDER BY r.name;

-- 7. Ver algunos permisos configurados (limitado para evitar muchos resultados)
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
WHERE r.name IN ('Admin', 'Manager', 'User')
ORDER BY r.name, p.resource
LIMIT 20;

SELECT '🎯 VERIFICACIÓN AJUSTADA COMPLETA' as resultado;
