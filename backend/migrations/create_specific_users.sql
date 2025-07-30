-- Crear usuarios específicos según requerimientos
-- Ejecutar DESPUÉS del script de roles y permisos

-- Insertar o actualizar usuarios
INSERT INTO users (username, password, email, role_id, active) VALUES 
(
  'pavelino', 
  '$2b$10$YourHashedPasswordHere', -- Necesita ser hasheado
  'administracion1@be-exen.com',
  (SELECT role_id FROM roles WHERE role_name = 'administrador'),
  TRUE
),
(
  'gflores', 
  '$2b$10$YourHashedPasswordHere', -- Necesita ser hasheado
  'administracion3@be-exen.com',
  (SELECT role_id FROM roles WHERE role_name = 'entradas_salidas'),
  TRUE
),
(
  'mcabrera', 
  '$2b$10$YourHashedPasswordHere', -- Necesita ser hasheado
  'proyectos@be-exen.com',
  (SELECT role_id FROM roles WHERE role_name = 'visualizador'),
  TRUE
),
(
  'eavila', 
  '$2b$10$YourHashedPasswordHere', -- Necesita ser hasheado
  'direccion@be-exen.com',
  (SELECT role_id FROM roles WHERE role_name = 'direccion'),
  TRUE
)
ON DUPLICATE KEY UPDATE 
email = VALUES(email), 
role_id = VALUES(role_id), 
active = VALUES(active);

-- NOTA: Las contraseñas necesitan ser hasheadas usando bcrypt
-- Para hashear "123456" usar en Node.js:
-- const bcrypt = require('bcrypt');
-- const hash = await bcrypt.hash('123456', 10);

-- Verificar usuarios creados
SELECT u.username, u.email, r.role_name, u.active
FROM users u 
JOIN roles r ON u.role_id = r.role_id 
WHERE u.username IN ('pavelino', 'gflores', 'mcabrera', 'eavila')
ORDER BY u.username;
