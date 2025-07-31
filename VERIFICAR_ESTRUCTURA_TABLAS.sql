-- Verificar estructura de las tablas RBAC
-- Ejecutar estas consultas en phpMyAdmin para ver qué está mal

-- 1. Verificar estructura de tabla roles
DESCRIBE roles;

-- 2. Verificar estructura de tabla role_permissions
DESCRIBE role_permissions;

-- 3. Verificar estructura de tabla permissions
DESCRIBE permissions;

-- 4. Ver datos de ejemplo en roles
SELECT * FROM roles LIMIT 5;

-- 5. Ver datos de ejemplo en permissions
SELECT * FROM permissions LIMIT 5;

-- 6. Ver datos de ejemplo en role_permissions 
SELECT * FROM role_permissions LIMIT 5;

-- 7. Ver si la tabla role_permissions tiene la estructura correcta
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    EXTRA
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'role_permissions' 
  AND TABLE_SCHEMA = DATABASE()
ORDER BY ORDINAL_POSITION;
