-- Migración para agregar campos de proveedor a la tabla de artículos
-- Ejecutar solo si no existen las columnas

-- Verificar si las columnas ya existen antes de agregarlas
SET @dbname = DATABASE();
SET @tablename = 'articulos';
SET @columnname1 = 'supplier_code';
SET @columnname2 = 'supplier_name';
SET @preparedStatement1 = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname1)
  ) > 0,
  "SELECT 'La columna supplier_code ya existe' AS mensaje;",
  "ALTER TABLE articulos ADD COLUMN supplier_code VARCHAR(50) NULL COMMENT 'Código del proveedor' AFTER codigo;"
));
PREPARE alterIfNotExists1 FROM @preparedStatement1;
EXECUTE alterIfNotExists1;
DEALLOCATE PREPARE alterIfNotExists1;

SET @preparedStatement2 = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname2)
  ) > 0,
  "SELECT 'La columna supplier_name ya existe' AS mensaje;",
  "ALTER TABLE articulos ADD COLUMN supplier_name VARCHAR(100) NULL COMMENT 'Nombre del proveedor' AFTER supplier_code;"
));
PREPARE alterIfNotExists2 FROM @preparedStatement2;
EXECUTE alterIfNotExists2;
DEALLOCATE PREPARE alterIfNotExists2;

-- Agregar índices para mejorar rendimiento en búsquedas por proveedor
SET @indexStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = 'idx_supplier_code')
  ) > 0,
  "SELECT 'El índice idx_supplier_code ya existe' AS mensaje;",
  "ALTER TABLE articulos ADD INDEX idx_supplier_code (supplier_code);"
));
PREPARE addIndexIfNotExists FROM @indexStatement;
EXECUTE addIndexIfNotExists;
DEALLOCATE PREPARE addIndexIfNotExists;

-- Verificar que las columnas se agregaron correctamente
SELECT 
  COLUMN_NAME as columna,
  DATA_TYPE as tipo,
  IS_NULLABLE as permite_nulo,
  COLUMN_DEFAULT as valor_por_defecto,
  COLUMN_COMMENT as comentario
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'articulos' 
  AND COLUMN_NAME IN ('supplier_code', 'supplier_name')
ORDER BY ORDINAL_POSITION;
