-- Migración para integrar el sistema existente de grupos con el nuevo RBAC
-- IMPORTANTE: Ejecutar paso a paso y verificar cada uno

-- Paso 1: Crear las nuevas tablas de roles y permisos
CREATE TABLE IF NOT EXISTS roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  module VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_module (module)
);

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
);

-- Paso 2: Insertar roles basados en los grupos existentes
INSERT INTO roles (name, description) 
SELECT 
  CASE 
    WHEN g.name = 'admin' THEN 'Administrador'
    WHEN g.name = 'compras' THEN 'Compras'
    WHEN g.name = 'supervisor' THEN 'Supervisor'
    ELSE CONCAT(UPPER(SUBSTRING(g.name, 1, 1)), LOWER(SUBSTRING(g.name, 2)))
  END as name,
  CASE 
    WHEN g.name = 'admin' THEN 'Acceso completo al sistema'
    WHEN g.name = 'compras' THEN 'Gestión de entradas y salidas'
    WHEN g.name = 'supervisor' THEN 'Supervisión y consultas'
    ELSE CONCAT('Rol basado en grupo: ', g.name)
  END as description
FROM groups g
WHERE NOT EXISTS (
  SELECT 1 FROM roles r 
  WHERE r.name = CASE 
    WHEN g.name = 'admin' THEN 'Administrador'
    WHEN g.name = 'compras' THEN 'Compras'
    WHEN g.name = 'supervisor' THEN 'Supervisor'
    ELSE CONCAT(UPPER(SUBSTRING(g.name, 1, 1)), LOWER(SUBSTRING(g.name, 2)))
  END
);

-- Paso 3: Insertar permisos básicos
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

-- Paso 4: Asignar permisos según el tipo de grupo
-- Administradores: todos los permisos
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

-- Compras: permisos de entradas, salidas y consulta de almacén
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

-- Supervisor: solo permisos de consulta
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

-- Paso 5: Agregar columna role_id a la tabla users (manteniendo group_id por compatibilidad)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role_id INT NULL AFTER group_id,
ADD INDEX IF NOT EXISTS idx_role_id (role_id);

-- Paso 6: Migrar usuarios al sistema de roles
UPDATE users u 
JOIN groups g ON u.group_id = g.group_id
JOIN roles r ON r.name = CASE 
  WHEN g.name = 'admin' THEN 'Administrador'
  WHEN g.name = 'compras' THEN 'Compras'
  WHEN g.name = 'supervisor' THEN 'Supervisor'
  ELSE CONCAT(UPPER(SUBSTRING(g.name, 1, 1)), LOWER(SUBSTRING(g.name, 2)))
END
SET u.role_id = r.id
WHERE u.role_id IS NULL;

-- Paso 7: Crear usuarios específicos si no existen
INSERT IGNORE INTO users (username, password, name, email, group_id, role_id) 
SELECT 
  'pavelino' as username,
  '$2b$10$example_hash_replace_this' as password,
  'Pavel Administrador' as name,
  'pavelino@empresa.com' as email,
  g.group_id,
  r.id as role_id
FROM groups g, roles r 
WHERE g.name = 'admin' AND r.name = 'Administrador'
LIMIT 1;

INSERT IGNORE INTO users (username, password, name, email, group_id, role_id) 
SELECT 
  'gflores' as username,
  '$2b$10$example_hash_replace_this' as password,
  'Gabriel Flores' as name,
  'gflores@empresa.com' as email,
  g.group_id,
  r.id as role_id
FROM groups g, roles r 
WHERE g.name = 'compras' AND r.name = 'Compras'
LIMIT 1;

INSERT IGNORE INTO users (username, password, name, email, group_id, role_id) 
SELECT 
  'mcabrera' as username,
  '$2b$10$example_hash_replace_this' as password,
  'Miguel Cabrera' as name,
  'mcabrera@empresa.com' as email,
  g.group_id,
  r.id as role_id
FROM groups g, roles r 
WHERE g.name = 'supervisor' AND r.name = 'Supervisor'
LIMIT 1;

-- Usuario especial de dirección con permisos similares a supervisor pero con acceso a reportes
INSERT IGNORE INTO roles (name, description) VALUES 
('Dirección', 'Acceso a reportes y supervisión ejecutiva');

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
WHERE r.name = 'Dirección' 
AND p.module IN ('almacen', 'entradas', 'salidas', 'usuarios');

INSERT IGNORE INTO users (username, password, name, email, group_id, role_id) 
SELECT 
  'eavila' as username,
  '$2b$10$example_hash_replace_this' as password,
  'Eduardo Avila' as name,
  'eavila@empresa.com' as email,
  (SELECT group_id FROM groups WHERE name = 'supervisor' LIMIT 1),
  r.id as role_id
FROM roles r 
WHERE r.name = 'Dirección'
LIMIT 1;

-- Verificaciones finales
SELECT 'Verificación de roles creados:' as mensaje;
SELECT * FROM roles;

SELECT 'Verificación de permisos creados:' as mensaje;
SELECT COUNT(*) as total_permisos, module FROM permissions GROUP BY module;

SELECT 'Verificación de usuarios migrados:' as mensaje;
SELECT u.username, u.name, g.name as grupo, r.name as rol 
FROM users u 
LEFT JOIN groups g ON u.group_id = g.group_id
LEFT JOIN roles r ON u.role_id = r.id;

SELECT 'Verificación de permisos por rol:' as mensaje;
SELECT r.name as rol, COUNT(*) as total_permisos
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name;
