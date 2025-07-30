-- Tabla para ajustes de inventario
CREATE TABLE inventory_adjustments (
    adjustment_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del ajuste',
    article_id INT NOT NULL COMMENT 'Referencia al artículo',
    quantity INT NOT NULL COMMENT 'Cantidad ajustada (positiva o negativa)',
    reason VARCHAR(100) COMMENT 'Motivo del ajuste',
    user_id INT COMMENT 'Usuario que realiza el ajuste',
    date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha del ajuste',
    FOREIGN KEY (article_id) REFERENCES articles(article_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
) COMMENT='Ajustes de inventario';

-- Actualizar la vista para incluir ajustes:
CREATE OR REPLACE VIEW inventory_stock AS
SELECT
    a.article_id,
    a.code,
    a.name,
    COALESCE(SUM(e.quantity),0) - COALESCE(SUM(s.quantity),0) + COALESCE(SUM(adj.quantity),0) AS stock_actual,
    (SELECT unit_cost FROM inventory_entries WHERE article_id = a.article_id ORDER BY date DESC LIMIT 1) AS last_unit_cost,
    ((COALESCE(SUM(e.quantity),0) - COALESCE(SUM(s.quantity),0) + COALESCE(SUM(adj.quantity),0)) *
     (SELECT unit_cost FROM inventory_entries WHERE article_id = a.article_id ORDER BY date DESC LIMIT 1)) AS total_cost
FROM articles a
LEFT JOIN inventory_entries e ON a.article_id = e.article_id
LEFT JOIN inventory_exits s ON a.article_id = s.article_id
LEFT JOIN inventory_adjustments adj ON a.article_id = adj.article_id
GROUP BY a.article_id, a.code, a.name;
