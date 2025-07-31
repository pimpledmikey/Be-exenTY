-- ===============================================
-- VERIFICACIÓN DEL SISTEMA RBAC YA INSTALADO
-- ===============================================
-- Ejecuta estas queries para verificar tu sistema

-- 1. Ver roles existentes
SELECT 'ROLES EXISTENTES:' as info;
SELECT id, name, description FROM roles ORDER BY id;

-- 2. Ver usuarios con roles asignados
SELECT 'USUARIOS CON ROLES:' as info;
SELECT 
    u.user_id,
    u.username, 
    u.name, 
    g.name as grupo, 
    r.name as rol,
    u.role_id
FROM users u 
LEFT JOIN groups g ON u.group_id = g.group_id
LEFT JOIN roles r ON u.role_id = r.id
ORDER BY u.username;

-- 3. Ver permisos por rol
SELECT 'PERMISOS POR ROL:' as info;
SELECT 
    r.name as rol,
    COUNT(CASE WHEN rp.can_view = 1 THEN 1 END) as puede_ver,
    COUNT(CASE WHEN rp.can_create = 1 THEN 1 END) as puede_crear,
    COUNT(CASE WHEN rp.can_edit = 1 THEN 1 END) as puede_editar,
    COUNT(CASE WHEN rp.can_delete = 1 THEN 1 END) as puede_eliminar
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name
ORDER BY r.name;

-- 4. Verificar si los usuarios específicos existen
SELECT 'USUARIOS ESPECÍFICOS:' as info;
SELECT username, name, email, 
       CASE WHEN username IN ('pavelino', 'gflores', 'mcabrera', 'eavila') 
            THEN 'ESPECÍFICO' 
            ELSE 'OTRO' 
       END as tipo
FROM users 
ORDER BY tipo DESC, username;

-- 5. Ver campos de proveedor en artículos
SELECT 'CAMPOS DE PROVEEDOR:' as info;
SELECT 
  COLUMN_NAME as columna,
  DATA_TYPE as tipo,
  IS_NULLABLE as permite_nulo,
  COLUMN_COMMENT as comentario
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'articles' 
  AND COLUMN_NAME IN ('supplier_code', 'supplier_name')
ORDER BY ORDINAL_POSITION;

-- 6. Verificar si la columna role_id existe en users
SELECT 'ESTRUCTURA TABLA USERS:' as info;
DESCRIBE users;

-- ===============================================
-- SI FALTA ALGO, EJECUTA ESTAS CORRECCIONES:
-- ===============================================

-- Solo si no tienes la columna role_id en users:
-- ALTER TABLE users ADD COLUMN role_id INT NULL AFTER group_id;

-- Solo si no tienes los campos de proveedor:
-- ALTER TABLE articles ADD COLUMN supplier_code VARCHAR(100) NULL AFTER code;
-- ALTER TABLE articles ADD COLUMN supplier_name VARCHAR(255) NULL AFTER supplier_code;

-- Solo si no tienes los usuarios específicos (ejecutar uno por uno):
-- INSERT IGNORE INTO users (username, password, name, email, group_id, role_id, theme) 
-- VALUES ('pavelino', '$2b$10$aN75IvPClOr7F5U3Er9XFeRNQc60bcRLqDay7DZ.WiQOWe2oX05q2', 'Pavel Administrador', 'pavelino@empresa.com', 1, 1, 'dark');

SELECT '✅ VERIFICACIÓN COMPLETA' as resultado;
