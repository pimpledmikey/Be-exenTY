-- Script para corregir el cálculo de stock y crear sistema más eficiente
-- Miguel Requena - 9 Sep 2025

-- 1. Crear tabla de stock físico para mejor rendimiento
CREATE TABLE IF NOT EXISTS article_stock (
    article_id INT(11) NOT NULL PRIMARY KEY,
    current_stock INT(11) NOT NULL DEFAULT 0,
    reserved_stock INT(11) NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(article_id) ON DELETE CASCADE,
    INDEX idx_stock (current_stock),
    INDEX idx_updated (last_updated)
) COMMENT='Stock físico actualizado en tiempo real';

-- 2. Inicializar stock basado en movimientos existentes
INSERT INTO article_stock (article_id, current_stock) 
SELECT 
    a.article_id,
    GREATEST(0, COALESCE(entradas.total_in, 0) - COALESCE(salidas.total_out, 0)) as current_stock
FROM articles a
LEFT JOIN (
    SELECT article_id, SUM(quantity) as total_in 
    FROM inventory_entries 
    GROUP BY article_id
) entradas ON a.article_id = entradas.article_id
LEFT JOIN (
    SELECT article_id, SUM(quantity) as total_out 
    FROM inventory_exits 
    GROUP BY article_id
) salidas ON a.article_id = salidas.article_id
ON DUPLICATE KEY UPDATE 
    current_stock = GREATEST(0, COALESCE(entradas.total_in, 0) - COALESCE(salidas.total_out, 0)),
    last_updated = NOW();

-- 3. Crear triggers para mantener sincronizado el stock

-- Trigger para entradas
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS update_stock_on_entry 
AFTER INSERT ON inventory_entries
FOR EACH ROW
BEGIN
    INSERT INTO article_stock (article_id, current_stock) 
    VALUES (NEW.article_id, NEW.quantity)
    ON DUPLICATE KEY UPDATE 
        current_stock = current_stock + NEW.quantity,
        last_updated = NOW();
END$$

-- Trigger para salidas
CREATE TRIGGER IF NOT EXISTS update_stock_on_exit 
AFTER INSERT ON inventory_exits
FOR EACH ROW
BEGIN
    INSERT INTO article_stock (article_id, current_stock) 
    VALUES (NEW.article_id, -NEW.quantity)
    ON DUPLICATE KEY UPDATE 
        current_stock = GREATEST(0, current_stock - NEW.quantity),
        last_updated = NOW();
END$$

-- Trigger para ajustes
CREATE TRIGGER IF NOT EXISTS update_stock_on_adjustment 
AFTER INSERT ON inventory_adjustments
FOR EACH ROW
BEGIN
    INSERT INTO article_stock (article_id, current_stock) 
    VALUES (NEW.article_id, NEW.quantity)
    ON DUPLICATE KEY UPDATE 
        current_stock = GREATEST(0, current_stock + NEW.quantity),
        last_updated = NOW();
END$$

DELIMITER ;

-- 4. Actualizar vista inventory_stock para usar tabla física
DROP VIEW IF EXISTS inventory_stock;
CREATE OR REPLACE VIEW inventory_stock AS
SELECT
    a.article_id,
    a.code,
    a.name,
    COALESCE(s.current_stock, 0) AS stock,
    (SELECT unit_cost FROM inventory_entries WHERE article_id = a.article_id ORDER BY date DESC LIMIT 1) AS last_unit_cost,
    (COALESCE(s.current_stock, 0) *
     (SELECT unit_cost FROM inventory_entries WHERE article_id = a.article_id ORDER BY date DESC LIMIT 1)) AS total_cost
FROM articles a
LEFT JOIN article_stock s ON a.article_id = s.article_id;

-- 5. Verificar datos de artículo problemático
SELECT 
    'VERIFICACIÓN STOCK ARTÍCULO 24' as info,
    a.name,
    COALESCE(entradas.total, 0) as total_entradas,
    COALESCE(salidas.total, 0) as total_salidas,
    COALESCE(entradas.total, 0) - COALESCE(salidas.total, 0) as stock_calculado,
    s.current_stock as stock_tabla
FROM articles a
LEFT JOIN (SELECT article_id, SUM(quantity) as total FROM inventory_entries WHERE article_id = 24) entradas ON a.article_id = entradas.article_id
LEFT JOIN (SELECT article_id, SUM(quantity) as total FROM inventory_exits WHERE article_id = 24) salidas ON a.article_id = salidas.article_id  
LEFT JOIN article_stock s ON a.article_id = s.article_id
WHERE a.article_id = 24;
