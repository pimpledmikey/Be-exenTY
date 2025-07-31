-- ===============================================
-- VERIFICACIÓN FINAL - ESTRUCTURA CONFIRMADA
-- Base de datos: u322888101_beexenty_inv
-- ===============================================

-- 1. Ver todos los usuarios actuales (SIN created_at)
SELECT user_id, username, name, email, group_id, role_id, theme
FROM users 
ORDER BY user_id;

-- 2. Ver todos los roles disponibles
SELECT id, name, description 
FROM roles 
ORDER BY id;

-- 3. Ver usuarios con sus roles asignados
SELECT 
    u.username,
    u.name as nombre_completo,
    COALESCE(r.name, 'Sin rol') as rol_asignado,
    u.role_id,
    u.theme
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
ORDER BY u.username;

-- 4. Verificar si existen los usuarios específicos
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

-- 5. Verificar passwords (solo para confirmar formato bcrypt)
SELECT username, 
       CASE 
           WHEN password LIKE '$2b$%' THEN '✅ bcrypt correcto'
           WHEN password LIKE '$2y$%' THEN '✅ bcrypt válido'
           ELSE '❌ password sin hash'
       END as formato_password,
       LEFT(password, 20) as inicio_hash
FROM users
ORDER BY username;

-- 6. Contar permisos por rol
SELECT 
    r.name as rol,
    COUNT(rp.permission_id) as total_permisos,
    SUM(rp.can_view) as puede_ver,
    SUM(rp.can_create) as puede_crear,
    SUM(rp.can_edit) as puede_editar,
    SUM(rp.can_delete) as puede_eliminar
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name
ORDER BY r.name;

-- 7. Ver campos de proveedor en artículos
SELECT 
  COLUMN_NAME as columna,
  DATA_TYPE as tipo,
  IS_NULLABLE as permite_nulo
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'articles' 
  AND COLUMN_NAME IN ('supplier_code', 'supplier_name', 'code', 'name')
ORDER BY ORDINAL_POSITION;

SELECT '🎯 VERIFICACIÓN FINAL COMPLETA - LISTO PARA PROBAR SISTEMA' as resultado;
