-- ===============================================
-- VERIFICAR DATOS DE GROUPS
-- ===============================================

-- Ver todos los grupos
SELECT group_id, name FROM groups ORDER BY group_id;

-- Ver usuarios con sus grupos
SELECT 
    u.user_id,
    u.username, 
    u.group_id,
    g.name as grupo_nombre
FROM users u 
LEFT JOIN groups g ON u.group_id = g.group_id
ORDER BY u.username;
