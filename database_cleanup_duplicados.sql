-- Script para limpiar duplicados en la base de datos
-- EJECUTAR CON CUIDADO - Haz backup antes si es necesario

-- 1. Eliminar permissions duplicados manteniendo solo el más reciente de cada nombre/módulo
DELETE p1 FROM permissions p1
INNER JOIN permissions p2 
WHERE p1.id < p2.id 
AND p1.name = p2.name 
AND p1.module = p2.module;

-- 2. Eliminar role_permissions duplicados manteniendo solo uno por role_id/permission_id
DELETE rp1 FROM role_permissions rp1
INNER JOIN role_permissions rp2 
WHERE rp1.id < rp2.id 
AND rp1.role_id = rp2.role_id 
AND rp1.permission_id = rp2.permission_id;

-- 3. Verificar que ahora no hay duplicados en permissions
SELECT name, module, COUNT(*) as cantidad 
FROM permissions 
WHERE module IN ('ajustes', 'stock')
GROUP BY name, module 
HAVING COUNT(*) > 1;

-- 4. Verificar que no hay duplicados en role_permissions para role_id = 1
SELECT role_id, permission_id, COUNT(*) as cantidad 
FROM role_permissions 
WHERE role_id = 1 
GROUP BY role_id, permission_id 
HAVING COUNT(*) > 1;

-- 5. Verificar resultado final para mavila
SELECT 
    u.username,
    r.name as rol,
    p.module,
    p.name as permiso,
    COUNT(*) as repeticiones
FROM users u
JOIN roles r ON u.role_id = r.id
JOIN role_permissions rp ON u.role_id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.username = 'mavila' AND p.module IN ('ajustes', 'stock')
GROUP BY u.username, r.name, p.module, p.name
ORDER BY p.module, p.name;
