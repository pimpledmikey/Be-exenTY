-- ===============================================
-- CONSULTA PARA VER TABLA PERMISSIONS
-- ===============================================

-- Ver estructura de permissions
DESCRIBE permissions;

-- Ver todos los permisos
SELECT id, name, description, module, created_at 
FROM permissions 
ORDER BY module, id;

-- Ver resumen por módulo
SELECT 
    module,
    COUNT(*) as total_permisos
FROM permissions 
GROUP BY module
ORDER BY module;
