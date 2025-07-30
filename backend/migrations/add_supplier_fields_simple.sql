-- Script simple para agregar campos de proveedor
-- Usar este si el script principal da problemas

-- Opción 1: Agregar ambas columnas de una vez
ALTER TABLE articles 
ADD COLUMN supplier_code VARCHAR(100) NULL,
ADD COLUMN supplier_name VARCHAR(255) NULL;

-- Si la opción 1 falla, usar estas consultas individuales:
-- ALTER TABLE articles ADD COLUMN supplier_code VARCHAR(100) NULL;
-- ALTER TABLE articles ADD COLUMN supplier_name VARCHAR(255) NULL;

-- Verificar que se agregaron correctamente
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'articles' 
AND COLUMN_NAME IN ('supplier_code', 'supplier_name')
ORDER BY COLUMN_NAME;
