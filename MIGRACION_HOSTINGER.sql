-- ========================================
-- MIGRACIÓN COMPLETA PARA HOSTINGER
-- ========================================
-- Copia y pega este script completo en phpMyAdmin de Hostinger
-- Ejecuta sección por sección para mayor seguridad

-- ========================================
-- PASO 1: VERIFICAR ESTADO ACTUAL
-- ========================================

-- Ver qué tablas tienes actualmente
SELECT 'TABLAS EXISTENTES:' as info;
SHOW TABLES;

-- Ver grupos disponibles
SELECT 'GRUPOS DISPONIBLES:' as info;
SELECT * FROM groups ORDER BY group_id;

-- Ver usuarios existentes
SELECT 'USUARIOS ACTUALES:' as info;
SELECT user_id, username, name, email, group_id FROM users ORDER BY username;

-- ========================================
-- PASO 2: CREAR BACKUP (OPCIONAL - RECOMENDADO)
-- ========================================

-- Si quieres hacer backup manual, exporta estas tablas desde phpMyAdmin:
-- - users
-- - groups
-- (Ve a Exportar > Seleccionar tablas > users, groups > Ejecutar)

-- ========================================
-- PASO 3: CREAR NUEVAS TABLAS DE RBAC
-- ========================================

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='Roles del sistema RBAC';

-- Tabla de permisos
CREATE TABLE IF NOT EXISTS permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  module VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_module (module)
) COMMENT='Permisos del sistema';

-- Tabla de permisos por rol
CREATE TABLE IF NOT EXISTS role_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  can_view BOOLEAN DEFAULT FALSE,
  can_create BOOLEAN DEFAULT FALSE,
  can_edit BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_permission (role_id, permission_id)
) COMMENT='Permisos asignados a cada rol';

-- ========================================
-- PASO 4: INSERTAR ROLES BASADOS EN TUS GRUPOS
-- ========================================

-- Insertar roles basados en grupos existentes
INSERT INTO roles (name, description) VALUES
('Administrador', 'Acceso completo al sistema'),
('Compras', 'Gestión de entradas y salidas'),
('Supervisor', 'Supervisión y consultas'),
('Ingenierias', 'Dirección e ingeniería'),
('Direccion', 'Dirección ejecutiva')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Verificar roles creados
SELECT 'ROLES CREADOS:' as info;
SELECT * FROM roles ORDER BY id;

-- ========================================
-- PASO 5: INSERTAR PERMISOS DEL SISTEMA
-- ========================================

-- Insertar permisos básicos
INSERT IGNORE INTO permissions (name, description, module) VALUES
-- Permisos de Almacén
('almacen_view', 'Ver artículos y stock', 'almacen'),
('almacen_create', 'Crear nuevos artículos', 'almacen'),
('almacen_edit', 'Editar artículos existentes', 'almacen'),
('almacen_delete', 'Eliminar artículos', 'almacen'),

-- Permisos de Entradas
('entradas_view', 'Ver entradas de mercancía', 'entradas'),
('entradas_create', 'Registrar nuevas entradas', 'entradas'),
('entradas_edit', 'Editar entradas existentes', 'entradas'),
('entradas_delete', 'Eliminar entradas', 'entradas'),

-- Permisos de Salidas
('salidas_view', 'Ver salidas de mercancía', 'salidas'),
('salidas_create', 'Registrar nuevas salidas', 'salidas'),
('salidas_edit', 'Editar salidas existentes', 'salidas'),
('salidas_delete', 'Eliminar salidas', 'salidas'),

-- Permisos de Usuarios
('usuarios_view', 'Ver lista de usuarios', 'usuarios'),
('usuarios_create', 'Crear nuevos usuarios', 'usuarios'),
('usuarios_edit', 'Editar usuarios existentes', 'usuarios'),
('usuarios_delete', 'Eliminar usuarios', 'usuarios'),

-- Permisos de Administración
('admin_view', 'Ver panel de administración', 'administracion'),
('admin_roles', 'Gestionar roles y permisos', 'administracion'),
('admin_system', 'Configuración del sistema', 'administracion');

-- Verificar permisos creados
SELECT 'PERMISOS CREADOS:' as info;
SELECT COUNT(*) as total_permisos, module FROM permissions GROUP BY module;

-- ========================================
-- PASO 6: ASIGNAR PERMISOS A ROLES
-- ========================================

-- ADMINISTRADOR: Todos los permisos
INSERT IGNORE INTO role_permissions (role_id, permission_id, can_view, can_create, can_edit, can_delete)
SELECT 
  r.id as role_id,
  p.id as permission_id,
  TRUE as can_view,
  TRUE as can_create,
  TRUE as can_edit,
  TRUE as can_delete
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Administrador';

-- COMPRAS: Permisos de entradas, salidas y consulta de almacén
INSERT IGNORE INTO role_permissions (role_id, permission_id, can_view, can_create, can_edit, can_delete)
SELECT 
  r.id as role_id,
  p.id as permission_id,
  TRUE as can_view,
  CASE WHEN p.module IN ('entradas', 'salidas') THEN TRUE ELSE FALSE END as can_create,
  CASE WHEN p.module IN ('entradas', 'salidas') THEN TRUE ELSE FALSE END as can_edit,
  FALSE as can_delete
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Compras' 
AND p.module IN ('almacen', 'entradas', 'salidas');

-- SUPERVISOR: Solo permisos de consulta
INSERT IGNORE INTO role_permissions (role_id, permission_id, can_view, can_create, can_edit, can_delete)
SELECT 
  r.id as role_id,
  p.id as permission_id,
  TRUE as can_view,
  FALSE as can_create,
  FALSE as can_edit,
  FALSE as can_delete
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Supervisor' 
AND p.module IN ('almacen', 'entradas', 'salidas');

-- INGENIERIAS: Permisos similares a dirección
INSERT IGNORE INTO role_permissions (role_id, permission_id, can_view, can_create, can_edit, can_delete)
SELECT 
  r.id as role_id,
  p.id as permission_id,
  TRUE as can_view,
  CASE WHEN p.module IN ('almacen', 'entradas', 'salidas') THEN TRUE ELSE FALSE END as can_create,
  CASE WHEN p.module IN ('almacen', 'entradas', 'salidas') THEN TRUE ELSE FALSE END as can_edit,
  FALSE as can_delete
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Ingenierias' 
AND p.module IN ('almacen', 'entradas', 'salidas', 'usuarios');

-- ========================================
-- PASO 7: AÑADIR COLUMNA role_id A USERS
-- ========================================

-- Añadir columna role_id a la tabla users (manteniendo group_id por compatibilidad)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role_id INT NULL AFTER group_id,
ADD INDEX IF NOT EXISTS idx_role_id (role_id);

-- ========================================
-- PASO 8: MIGRAR USUARIOS AL SISTEMA DE ROLES
-- ========================================

-- Migrar usuarios existentes al sistema de roles
UPDATE users u 
JOIN groups g ON u.group_id = g.group_id
JOIN roles r ON r.name = CASE 
  WHEN g.name = 'admin' THEN 'Administrador'
  WHEN g.name = 'compras' THEN 'Compras'
  WHEN g.name = 'supervisor' THEN 'Supervisor'
  WHEN g.name = 'Ingenierias' THEN 'Ingenierias'
  ELSE 'Supervisor'  -- Por defecto
END
SET u.role_id = r.id
WHERE u.role_id IS NULL;

-- ========================================
-- PASO 9: CREAR USUARIOS ESPECÍFICOS
-- ========================================

-- Generar hash de contraseña para "123456"
-- Hash generado: $2b$10$aN75IvPClOr7F5U3Er9XFeRNQc60bcRLqDay7DZ.WiQOWe2oX05q2

-- Crear/actualizar usuarios específicos
INSERT INTO users (username, password, name, email, group_id, role_id, theme) VALUES 
(
  'pavelino', 
  '$2b$10$aN75IvPClOr7F5U3Er9XFeRNQc60bcRLqDay7DZ.WiQOWe2oX05q2', 
  'Pavel Administrador', 
  'pavelino@empresa.com',
  (SELECT group_id FROM groups WHERE name = 'admin' LIMIT 1),
  (SELECT id FROM roles WHERE name = 'Administrador' LIMIT 1),
  'dark'
),
(
  'gflores', 
  '$2b$10$aN75IvPClOr7F5U3Er9XFeRNQc60bcRLqDay7DZ.WiQOWe2oX05q2', 
  'Gabriel Flores', 
  'gflores@empresa.com',
  (SELECT group_id FROM groups WHERE name = 'compras' LIMIT 1),
  (SELECT id FROM roles WHERE name = 'Compras' LIMIT 1),
  'dark'
),
(
  'mcabrera', 
  '$2b$10$aN75IvPClOr7F5U3Er9XFeRNQc60bcRLqDay7DZ.WiQOWe2oX05q2', 
  'Miguel Cabrera', 
  'mcabrera@empresa.com',
  (SELECT group_id FROM groups WHERE name = 'supervisor' LIMIT 1),
  (SELECT id FROM roles WHERE name = 'Supervisor' LIMIT 1),
  'dark'
),
(
  'eavila', 
  '$2b$10$aN75IvPClOr7F5U3Er9XFeRNQc60bcRLqDay7DZ.WiQOWe2oX05q2', 
  'Eduardo Avila', 
  'eavila@empresa.com',
  (SELECT group_id FROM groups WHERE name = 'Ingenierias' LIMIT 1),
  (SELECT id FROM roles WHERE name = 'Ingenierias' LIMIT 1),
  'dark'
)
ON DUPLICATE KEY UPDATE 
password = VALUES(password),
name = VALUES(name), 
email = VALUES(email), 
role_id = VALUES(role_id),
theme = VALUES(theme);

-- ========================================
-- PASO 10: AÑADIR CAMPOS DE PROVEEDOR A ARTÍCULOS
-- ========================================

-- Añadir campos de proveedor a la tabla de artículos
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS supplier_code VARCHAR(100) NULL COMMENT 'Código del proveedor' AFTER code,
ADD COLUMN IF NOT EXISTS supplier_name VARCHAR(255) NULL COMMENT 'Nombre del proveedor' AFTER supplier_code;

-- Añadir índice para búsquedas por proveedor
ALTER TABLE articles 
ADD INDEX IF NOT EXISTS idx_supplier_code (supplier_code);

-- ========================================
-- PASO 11: VERIFICACIÓN FINAL
-- ========================================

-- Verificar tablas creadas
SELECT 'VERIFICACIÓN - TABLAS CREADAS:' as info;
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('roles', 'permissions', 'role_permissions') THEN 'NUEVA'
        ELSE 'EXISTENTE'
    END as tipo
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name IN ('users', 'groups', 'roles', 'permissions', 'role_permissions', 'articles')
ORDER BY tipo, table_name;

-- Verificar roles creados
SELECT 'VERIFICACIÓN - ROLES:' as info;
SELECT id, name, description FROM roles ORDER BY id;

-- Verificar usuarios con roles
SELECT 'VERIFICACIÓN - USUARIOS CON ROLES:' as info;
SELECT u.username, u.name, g.name as grupo, r.name as rol 
FROM users u 
LEFT JOIN groups g ON u.group_id = g.group_id
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.username IN ('pavelino', 'gflores', 'mcabrera', 'eavila')
ORDER BY u.username;

-- Verificar permisos por rol
SELECT 'VERIFICACIÓN - PERMISOS POR ROL:' as info;
SELECT r.name as rol, 
       COUNT(CASE WHEN rp.can_view = 1 THEN 1 END) as puede_ver,
       COUNT(CASE WHEN rp.can_create = 1 THEN 1 END) as puede_crear,
       COUNT(CASE WHEN rp.can_edit = 1 THEN 1 END) as puede_editar,
       COUNT(CASE WHEN rp.can_delete = 1 THEN 1 END) as puede_eliminar
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name
ORDER BY r.name;

-- Verificar campos de proveedor en artículos
SELECT 'VERIFICACIÓN - CAMPOS DE PROVEEDOR:' as info;
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

-- ========================================
-- ¡MIGRACIÓN COMPLETADA!
-- ========================================

SELECT '🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE' as resultado;
SELECT 'Usuarios creados con contraseña: 123456' as info;
SELECT 'Sistema RBAC activado y funcionando' as estado;
