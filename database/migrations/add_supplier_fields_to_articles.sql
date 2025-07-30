-- Agregar campos de proveedor a la tabla articles
-- Ejecutar este script en la base de datos

ALTER TABLE articles 
ADD COLUMN supplier_code VARCHAR(100) NULL COMMENT 'Código del proveedor para este artículo',
ADD COLUMN supplier_name VARCHAR(255) NULL COMMENT 'Nombre del proveedor';
