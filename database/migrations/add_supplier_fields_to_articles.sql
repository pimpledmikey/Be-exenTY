-- Agregar campos de proveedor a la tabla articles
-- Ejecutar este script en la base de datos

-- Verificar y agregar columna supplier_code si no existe
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'articles' AND column_name = 'supplier_code' AND table_schema = DATABASE()) = 0,
    'ALTER TABLE articles ADD COLUMN supplier_code VARCHAR(100) NULL COMMENT "Código del proveedor para este artículo"',
    'SELECT "La columna supplier_code ya existe"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna supplier_name si no existe
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'articles' AND column_name = 'supplier_name' AND table_schema = DATABASE()) = 0,
    'ALTER TABLE articles ADD COLUMN supplier_name VARCHAR(255) NULL COMMENT "Nombre del proveedor"',
    'SELECT "La columna supplier_name ya existe"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar la estructura final
DESCRIBE articles;
