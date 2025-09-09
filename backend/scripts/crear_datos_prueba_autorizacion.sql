-- Script para crear datos de prueba para el sistema de autorización de solicitudes
-- Asegurándonos de que existan usuarios primero

-- Verificar que tenemos usuarios en el sistema
INSERT IGNORE INTO users (user_id, username, password, name, email, group_id, role_id) 
VALUES 
(1, 'admin', '$2b$10$86IXzHzVjTzOGN7P3M3V5eF7GQbWXGsN5kGJ.vu0nHzXNmJ9.mHU2', 'Administrador', 'admin@beexen.com', 1, 1),
(2, 'compras', '$2b$10$86IXzHzVjTzOGN7P3M3V5eF7GQbWXGsN5kGJ.vu0nHzXNmJ9.mHU2', 'Juan Pérez', 'compras@beexen.com', 2, 2),
(3, 'almacenista', '$2b$10$86IXzHzVjTzOGN7P3M3V5eF7GQbWXGsN5kGJ.vu0nHzXNmJ9.mHU2', 'María García', 'almacen@beexen.com', 3, 3);

-- Asegurándonos de que existan grupos
INSERT IGNORE INTO groups (group_id, name) VALUES 
(1, 'admin'),
(2, 'compras'),
(3, 'almacen');

-- Crear algunas solicitudes de prueba pendientes
INSERT INTO solicitudes (folio, tipo, fecha, usuario_solicita_id, estado, observaciones) VALUES
('SALIDA-2025-001', 'SALIDA', '2025-01-09', 2, 'PENDIENTE', 'Materiales para proyecto urgente cliente ABC'),
('SALIDA-2025-002', 'SALIDA', '2025-01-09', 3, 'PENDIENTE', 'Suministros para mantenimiento de equipos'),
('ENTRADA-2025-001', 'ENTRADA', '2025-01-09', 2, 'PENDIENTE', 'Recepción de materiales nuevos proveedor XYZ'),
('SALIDA-2025-003', 'SALIDA', '2025-01-08', 2, 'PENDIENTE', 'Materiales para obra construcción'),
('ENTRADA-2025-002', 'ENTRADA', '2025-01-08', 3, 'PENDIENTE', 'Compra de herramientas y equipos');

-- Obtener los IDs de las solicitudes recién creadas para crear items
SET @solicitud1 = (SELECT id FROM solicitudes WHERE folio = 'SALIDA-2025-001');
SET @solicitud2 = (SELECT id FROM solicitudes WHERE folio = 'SALIDA-2025-002');  
SET @solicitud3 = (SELECT id FROM solicitudes WHERE folio = 'ENTRADA-2025-001');
SET @solicitud4 = (SELECT id FROM solicitudes WHERE folio = 'SALIDA-2025-003');
SET @solicitud5 = (SELECT id FROM solicitudes WHERE folio = 'ENTRADA-2025-002');

-- Crear items para las solicitudes (usando article_id de artículos existentes)
-- Solicitud 1: SALIDA-2025-001
INSERT INTO solicitudes_items (solicitud_id, article_id, cantidad, observaciones) VALUES
(@solicitud1, 1, 10, 'Tornillos para estructura'),
(@solicitud1, 2, 5, 'Placas metálicas'),
(@solicitud1, 3, 15, 'Cables eléctricos');

-- Solicitud 2: SALIDA-2025-002  
INSERT INTO solicitudes_items (solicitud_id, article_id, cantidad, observaciones) VALUES
(@solicitud2, 4, 2, 'Aceite para maquinaria'),
(@solicitud2, 5, 8, 'Filtros de aire'),
(@solicitud2, 1, 20, 'Tornillos de repuesto');

-- Solicitud 3: ENTRADA-2025-001
INSERT INTO solicitudes_items (solicitud_id, article_id, cantidad, precio_unitario, observaciones) VALUES
(@solicitud3, 6, 100, 2.50, 'Nuevos componentes electrónicos'),
(@solicitud3, 7, 50, 15.00, 'Sensores de temperatura'),
(@solicitud3, 8, 25, 45.00, 'Módulos de control');

-- Solicitud 4: SALIDA-2025-003
INSERT INTO solicitudes_items (solicitud_id, article_id, cantidad, observaciones) VALUES
(@solicitud4, 2, 30, 'Placas para cimentación'),
(@solicitud4, 9, 12, 'Varillas de refuerzo'),
(@solicitud4, 10, 8, 'Conectores especiales');

-- Solicitud 5: ENTRADA-2025-002
INSERT INTO solicitudes_items (solicitud_id, article_id, cantidad, precio_unitario, observaciones) VALUES
(@solicitud5, 11, 5, 250.00, 'Taladros industriales'),
(@solicitud5, 12, 3, 180.00, 'Sierra circular'),
(@solicitud5, 13, 10, 35.00, 'Kit de llaves');

-- Verificar que se crearon correctamente
SELECT 'Solicitudes creadas:' as info;
SELECT s.id, s.folio, s.tipo, s.fecha, s.estado, u.username as usuario_solicita,
       COUNT(si.id) as total_items
FROM solicitudes s
LEFT JOIN users u ON s.usuario_solicita_id = u.user_id  
LEFT JOIN solicitudes_items si ON s.id = si.solicitud_id
WHERE s.estado = 'PENDIENTE'
GROUP BY s.id
ORDER BY s.created_at DESC;
