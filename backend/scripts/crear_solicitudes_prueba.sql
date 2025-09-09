-- Script para crear solicitudes de prueba para demostrar el sistema de autorización
-- Fecha: 9 de septiembre de 2025

-- Insertar algunas solicitudes de salida pendientes de autorización
INSERT INTO solicitudes (folio, tipo, fecha, usuario_solicita_id, estado, observaciones) VALUES
('SALIDA-2025-001234', 'SALIDA', '2025-09-09', 1, 'PENDIENTE', 'Solicitud de materiales para proyecto Alpha'),
('SALIDA-2025-001235', 'SALIDA', '2025-09-09', 1, 'PENDIENTE', 'Materiales de oficina urgentes'),
('ENTRADA-2025-001236', 'ENTRADA', '2025-09-08', 1, 'PENDIENTE', 'Compra de nuevos equipos');

-- Obtener los IDs de las solicitudes insertadas
SET @solicitud1_id = LAST_INSERT_ID();
SET @solicitud2_id = @solicitud1_id + 1;
SET @solicitud3_id = @solicitud1_id + 2;

-- Verificar qué artículos existen en la base de datos
-- SELECT article_id, code, name FROM articles LIMIT 5;

-- Insertar items para las solicitudes (usando IDs de artículos que probablemente existan)
-- Para solicitud 1 (SALIDA-2025-001234)
INSERT INTO solicitudes_items (solicitud_id, article_id, cantidad, precio_unitario, observaciones) VALUES
(@solicitud1_id, 1, 10, 25.50, 'Para proyecto Alpha'),
(@solicitud1_id, 2, 5, 45.00, 'Equipos adicionales'),
(@solicitud1_id, 3, 2, 120.00, 'Material especializado');

-- Para solicitud 2 (SALIDA-2025-001235)
INSERT INTO solicitudes_items (solicitud_id, article_id, cantidad, precio_unitario, observaciones) VALUES
(@solicitud2_id, 1, 20, 25.50, 'Reposición mensual'),
(@solicitud2_id, 4, 3, 85.00, 'Urgente');

-- Para solicitud 3 (ENTRADA-2025-001236)
INSERT INTO solicitudes_items (solicitud_id, article_id, cantidad, precio_unitario, observaciones) VALUES
(@solicitud3_id, 5, 1, 2500.00, 'Equipo nuevo'),
(@solicitud3_id, 6, 2, 150.00, 'Accesorios');

-- Verificar las solicitudes creadas
SELECT 
    s.id, 
    s.folio, 
    s.tipo, 
    s.fecha, 
    s.estado, 
    s.observaciones,
    COUNT(si.id) as total_items
FROM solicitudes s
LEFT JOIN solicitudes_items si ON s.id = si.solicitud_id
WHERE s.estado = 'PENDIENTE'
GROUP BY s.id
ORDER BY s.created_at DESC;
