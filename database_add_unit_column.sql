-- Script para agregar columna unit a la tabla articles si no existe
-- Ejecutar solo si la columna unit no existe en la tabla articles

-- Verificar si la columna unit existe
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'articles' 
AND COLUMN_NAME = 'unit' 
AND TABLE_SCHEMA = DATABASE();

-- Si no existe, agregar la columna unit con valor por defecto 'pieza'
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS unit VARCHAR(20) DEFAULT 'pieza' AFTER name;

-- Actualizar algunos artículos de ejemplo con diferentes unidades
UPDATE articles SET unit = 'metro' WHERE name LIKE '%cable%' OR name LIKE '%manguera%' OR name LIKE '%alambre%';
UPDATE articles SET unit = 'litro' WHERE name LIKE '%aceite%' OR name LIKE '%liquido%' OR name LIKE '%combustible%';
UPDATE articles SET unit = 'bolsa' WHERE name LIKE '%cemento%' OR name LIKE '%arena%' OR name LIKE '%gravilla%';

-- Verificar resultado
SELECT article_id, code, name, unit, stock FROM articles LIMIT 10;
