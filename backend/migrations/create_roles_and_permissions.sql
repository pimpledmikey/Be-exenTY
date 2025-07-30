-- Crear nuevos roles en el sistema
-- Ejecutar este script en la base de datos

-- Insertar nuevos roles
INSERT INTO roles (role_name, description) VALUES 
('administrador', 'Acceso completo al sistema'),
('entradas_salidas', 'Acceso solo a entradas y salidas'),
('visualizador', 'Solo visualización'),
('direccion', 'Dirección - acceso completo')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Verificar roles actuales
SELECT * FROM roles ORDER BY role_id;

-- Crear tabla de permisos por módulo si no existe
CREATE TABLE IF NOT EXISTS role_permissions (
  permission_id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  module_name VARCHAR(50) NOT NULL,
  can_view BOOLEAN DEFAULT FALSE,
  can_create BOOLEAN DEFAULT FALSE,
  can_edit BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(role_id),
  UNIQUE KEY unique_role_module (role_id, module_name)
);

-- Configurar permisos para rol 'administrador' (acceso completo)
INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete) VALUES
-- Administrador tiene acceso completo a todo
((SELECT role_id FROM roles WHERE role_name = 'administrador'), 'articulos', TRUE, TRUE, TRUE, TRUE),
((SELECT role_id FROM roles WHERE role_name = 'administrador'), 'entradas', TRUE, TRUE, TRUE, TRUE),
((SELECT role_id FROM roles WHERE role_name = 'administrador'), 'salidas', TRUE, TRUE, TRUE, TRUE),
((SELECT role_id FROM roles WHERE role_name = 'administrador'), 'ajustes', TRUE, TRUE, TRUE, TRUE),
((SELECT role_id FROM roles WHERE role_name = 'administrador'), 'stock', TRUE, TRUE, TRUE, TRUE),
((SELECT role_id FROM roles WHERE role_name = 'administrador'), 'usuarios', TRUE, TRUE, TRUE, TRUE),
((SELECT role_id FROM roles WHERE role_name = 'administrador'), 'grupos', TRUE, TRUE, TRUE, TRUE),
((SELECT role_id FROM roles WHERE role_name = 'administrador'), 'catalogos', TRUE, TRUE, TRUE, TRUE)
ON DUPLICATE KEY UPDATE 
can_view = VALUES(can_view), can_create = VALUES(can_create), 
can_edit = VALUES(can_edit), can_delete = VALUES(can_delete);

-- Configurar permisos para rol 'entradas_salidas'
INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete) VALUES
((SELECT role_id FROM roles WHERE role_name = 'entradas_salidas'), 'articulos', TRUE, FALSE, FALSE, FALSE),
((SELECT role_id FROM roles WHERE role_name = 'entradas_salidas'), 'entradas', TRUE, TRUE, TRUE, FALSE),
((SELECT role_id FROM roles WHERE role_name = 'entradas_salidas'), 'salidas', TRUE, TRUE, TRUE, FALSE),
((SELECT role_id FROM roles WHERE role_name = 'entradas_salidas'), 'stock', TRUE, FALSE, FALSE, FALSE)
ON DUPLICATE KEY UPDATE 
can_view = VALUES(can_view), can_create = VALUES(can_create), 
can_edit = VALUES(can_edit), can_delete = VALUES(can_delete);

-- Configurar permisos para rol 'visualizador' (solo ver)
INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete) VALUES
((SELECT role_id FROM roles WHERE role_name = 'visualizador'), 'articulos', TRUE, FALSE, FALSE, FALSE),
((SELECT role_id FROM roles WHERE role_name = 'visualizador'), 'entradas', TRUE, FALSE, FALSE, FALSE),
((SELECT role_id FROM roles WHERE role_name = 'visualizador'), 'salidas', TRUE, FALSE, FALSE, FALSE),
((SELECT role_id FROM roles WHERE role_name = 'visualizador'), 'stock', TRUE, FALSE, FALSE, FALSE)
ON DUPLICATE KEY UPDATE 
can_view = VALUES(can_view), can_create = VALUES(can_create), 
can_edit = VALUES(can_edit), can_delete = VALUES(can_delete);

-- Configurar permisos para rol 'direccion' (acceso completo)
INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete) VALUES
((SELECT role_id FROM roles WHERE role_name = 'direccion'), 'articulos', TRUE, TRUE, TRUE, TRUE),
((SELECT role_id FROM roles WHERE role_name = 'direccion'), 'entradas', TRUE, TRUE, TRUE, TRUE),
((SELECT role_id FROM roles WHERE role_name = 'direccion'), 'salidas', TRUE, TRUE, TRUE, TRUE),
((SELECT role_id FROM roles WHERE role_name = 'direccion'), 'ajustes', TRUE, TRUE, TRUE, TRUE),
((SELECT role_id FROM roles WHERE role_name = 'direccion'), 'stock', TRUE, TRUE, TRUE, TRUE),
((SELECT role_id FROM roles WHERE role_name = 'direccion'), 'usuarios', TRUE, TRUE, TRUE, TRUE),
((SELECT role_id FROM roles WHERE role_name = 'direccion'), 'grupos', TRUE, TRUE, TRUE, TRUE),
((SELECT role_id FROM roles WHERE role_name = 'direccion'), 'catalogos', TRUE, TRUE, TRUE, TRUE)
ON DUPLICATE KEY UPDATE 
can_view = VALUES(can_view), can_create = VALUES(can_create), 
can_edit = VALUES(can_edit), can_delete = VALUES(can_delete);

-- Verificar permisos creados
SELECT r.role_name, rp.module_name, rp.can_view, rp.can_create, rp.can_edit, rp.can_delete
FROM roles r 
JOIN role_permissions rp ON r.role_id = rp.role_id 
ORDER BY r.role_name, rp.module_name;
