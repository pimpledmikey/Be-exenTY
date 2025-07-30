-- Tabla de permisos de acceso a módulos
CREATE TABLE IF NOT EXISTS module_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  module VARCHAR(50) NOT NULL,
  group_id INT,
  user_id INT,
  UNIQUE KEY (module, group_id, user_id),
  FOREIGN KEY (group_id) REFERENCES groups(group_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
) COMMENT='Permisos de acceso a módulos por grupo o usuario';

-- Permitir acceso al módulo de almacén a admin, supervisor y comprador
INSERT INTO module_permissions (module, group_id)
SELECT 'almacen', group_id FROM groups WHERE name IN ('admin', 'supervisor', 'compras');
