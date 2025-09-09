-- Solución rápida: Corregir vista inventory_stock para cálculo correcto
-- Miguel Requena - 9 Sep 2025

-- Verificar stock actual del artículo problemático
SELECT 
    a.article_id,
    a.name,
    COALESCE(entradas.total_in, 0) as entradas_total,
    COALESCE(salidas.total_out, 0) as salidas_total,
    COALESCE(entradas.total_in, 0) - COALESCE(salidas.total_out, 0) as stock_correcto
FROM articles a
LEFT JOIN (
    SELECT article_id, SUM(quantity) as total_in 
    FROM inventory_entries 
    WHERE article_id = 24
    GROUP BY article_id
) entradas ON a.article_id = entradas.article_id
LEFT JOIN (
    SELECT article_id, SUM(quantity) as total_out 
    FROM inventory_exits 
    WHERE article_id = 24
    GROUP BY article_id
) salidas ON a.article_id = salidas.article_id
WHERE a.article_id = 24;

-- Recrear vista con cálculo más preciso
DROP VIEW IF EXISTS inventory_stock;
CREATE OR REPLACE VIEW inventory_stock AS
SELECT
    a.article_id,
    a.code,
    a.name,
    GREATEST(0, COALESCE(entradas.total_in, 0) - COALESCE(salidas.total_out, 0)) AS stock,
    (SELECT unit_cost FROM inventory_entries ie WHERE ie.article_id = a.article_id ORDER BY date DESC LIMIT 1) AS last_unit_cost,
    (GREATEST(0, COALESCE(entradas.total_in, 0) - COALESCE(salidas.total_out, 0)) *
     COALESCE((SELECT unit_cost FROM inventory_entries ie WHERE ie.article_id = a.article_id ORDER BY date DESC LIMIT 1), 0)) AS total_cost
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
) salidas ON a.article_id = salidas.article_id;
