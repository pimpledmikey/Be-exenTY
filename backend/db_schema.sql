-- Script para ejecutar en phpMyAdmin de Hostinger
-- (Selecciona primero la base de datos creada desde el panel de Hostinger)

-- 2. Tabla de grupos de usuario
CREATE TABLE groups (
    group_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del grupo',
    name VARCHAR(50) NOT NULL UNIQUE COMMENT 'Nombre del grupo: admin, compras, supervisor'
) COMMENT='Grupos de usuario';

INSERT INTO groups (name) VALUES ('admin'), ('compras'), ('supervisor');

-- 3. Tabla de usuarios
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del usuario',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT 'Nombre de usuario',
    password VARCHAR(255) NOT NULL COMMENT 'Contraseña (hash)',
    group_id INT NOT NULL COMMENT 'Referencia al grupo de usuario',
    FOREIGN KEY (group_id) REFERENCES groups(group_id)
) COMMENT='Usuarios del sistema';

-- 4. Catálogo de artículos
CREATE TABLE articles (
    article_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del artículo',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Código del artículo',
    name VARCHAR(100) NOT NULL COMMENT 'Nombre del artículo',
    description TEXT COMMENT 'Descripción',
    unit VARCHAR(20) COMMENT 'Unidad de medida',
    min_stock INT DEFAULT 0 COMMENT 'Stock mínimo',
    max_stock INT DEFAULT 0 COMMENT 'Stock máximo',
    status ENUM('activo','inactivo') DEFAULT 'activo' COMMENT 'Estado del artículo'
) COMMENT='Catálogo de artículos';

-- 5. Entradas de inventario
CREATE TABLE inventory_entries (
    entry_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único de la entrada',
    article_id INT NOT NULL COMMENT 'Referencia al artículo',
    quantity INT NOT NULL COMMENT 'Cantidad ingresada',
    unit_cost DECIMAL(10,2) NOT NULL COMMENT 'Costo unitario',
    invoice_number VARCHAR(50) COMMENT 'Número de factura',
    date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de entrada',
    supplier VARCHAR(100) COMMENT 'Proveedor',
    FOREIGN KEY (article_id) REFERENCES articles(article_id)
) COMMENT='Entradas de inventario';

-- 6. Salidas de inventario
CREATE TABLE inventory_exits (
    exit_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único de la salida',
    article_id INT NOT NULL COMMENT 'Referencia al artículo',
    quantity INT NOT NULL COMMENT 'Cantidad retirada',
    date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de salida',
    reason VARCHAR(100) COMMENT 'Motivo de salida',
    user_id INT COMMENT 'Usuario que realiza la salida',
    FOREIGN KEY (article_id) REFERENCES articles(article_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
) COMMENT='Salidas de inventario';

-- 7. Vista para stock actual y costo total
CREATE OR REPLACE VIEW inventory_stock AS
SELECT
    a.article_id,
    a.code,
    a.name,
    COALESCE(SUM(e.quantity),0) - COALESCE(SUM(s.quantity),0) AS stock,
    (SELECT unit_cost FROM inventory_entries WHERE article_id = a.article_id ORDER BY date DESC LIMIT 1) AS last_unit_cost,
    ((COALESCE(SUM(e.quantity),0) - COALESCE(SUM(s.quantity),0)) *
     (SELECT unit_cost FROM inventory_entries WHERE article_id = a.article_id ORDER BY date DESC LIMIT 1)) AS total_cost
FROM articles a
LEFT JOIN inventory_entries e ON a.article_id = e.article_id
LEFT JOIN inventory_exits s ON a.article_id = s.article_id
GROUP BY a.article_id, a.code, a.name;
