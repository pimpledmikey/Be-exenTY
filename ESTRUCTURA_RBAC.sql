-- ===============================================
-- VERIFICACIÓN DE ESTRUCTURA RBAC
-- Base de datos: u322888101_beexenty_inv
-- ===============================================

-- 1. Ver estructura de la tabla permissions
DESCRIBE permissions;

-- 2. Ver estructura de la tabla roles
DESCRIBE roles;

-- 3. Ver estructura de la tabla role_permissions
DESCRIBE role_permissions;

-- 4. Ver algunos datos de permissions para entender su estructura
SELECT * FROM permissions LIMIT 10;

-- 5. Ver algunos datos de roles
SELECT * FROM roles;

-- 6. Ver algunos datos de role_permissions
SELECT * FROM role_permissions LIMIT 10;

-- 7. Ver usuarios actuales (consulta que sabemos que funciona)
SELECT user_id, username, name, email, group_id, role_id, theme
FROM users 
ORDER BY user_id;

SELECT '🔍 ESTRUCTURA RBAC VERIFICADA' as resultado;
