-- ===============================================
-- VERIFICAR ESTRUCTURA DE GROUPS
-- ===============================================

-- Ver estructura de groups
DESCRIBE groups;

-- Ver datos de groups
SELECT * FROM groups LIMIT 10;

-- Verificar si existe la columna name en groups
SELECT 
    COLUMN_NAME as columna,
    DATA_TYPE as tipo
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'groups'
ORDER BY ORDINAL_POSITION;
