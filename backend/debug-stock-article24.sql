-- Investigar problema de stock del artículo 24
-- Miguel Requena - 9 Sep 2025

-- 1. Revisar todas las entradas del artículo 24
SELECT 'ENTRADAS ARTÍCULO 24' as tipo, entry_id, quantity, date, supplier, invoice_number
FROM inventory_entries 
WHERE article_id = 24 
ORDER BY date;

-- 2. Revisar todas las salidas del artículo 24  
SELECT 'SALIDAS ARTÍCULO 24' as tipo, exit_id, quantity, date, reason, user_id
FROM inventory_exits 
WHERE article_id = 24 
ORDER BY date;

-- 3. Revisar todos los ajustes del artículo 24
SELECT 'AJUSTES ARTÍCULO 24' as tipo, adjustment_id, quantity, date, reason, user_id
FROM inventory_adjustments 
WHERE article_id = 24 
ORDER BY date;

-- 4. Calcular stock paso a paso
SELECT 
    'CÁLCULO STOCK ARTÍCULO 24' as info,
    COALESCE(SUM(e.quantity), 0) as total_entradas,
    COALESCE(SUM(s.quantity), 0) as total_salidas, 
    COALESCE(SUM(adj.quantity), 0) as total_ajustes,
    COALESCE(SUM(e.quantity), 0) - COALESCE(SUM(s.quantity), 0) + COALESCE(SUM(adj.quantity), 0) as stock_calculado
FROM articles a
LEFT JOIN inventory_entries e ON a.article_id = e.article_id
LEFT JOIN inventory_exits s ON a.article_id = s.article_id  
LEFT JOIN inventory_adjustments adj ON a.article_id = adj.article_id
WHERE a.article_id = 24
GROUP BY a.article_id;

-- 5. Comparar con vista actual
SELECT 'VISTA ACTUAL' as tipo, article_id, code, name, stock, last_unit_cost, total_cost
FROM inventory_stock 
WHERE article_id = 24;
