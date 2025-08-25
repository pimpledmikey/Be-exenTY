-- Crear tabla de solicitudes
CREATE TABLE IF NOT EXISTS solicitudes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    folio VARCHAR(50) UNIQUE NOT NULL,
    tipo ENUM('ENTRADA', 'SALIDA') NOT NULL,
    fecha DATE NOT NULL,
    usuario_solicita_id INT NOT NULL,
    usuario_autoriza_id INT NULL,
    estado ENUM('PENDIENTE', 'AUTORIZADA', 'RECHAZADA', 'COMPLETADA') DEFAULT 'PENDIENTE',
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_folio (folio),
    INDEX idx_tipo (tipo),
    INDEX idx_estado (estado),
    INDEX idx_fecha (fecha),
    FOREIGN KEY (usuario_solicita_id) REFERENCES users(user_id),
    FOREIGN KEY (usuario_autoriza_id) REFERENCES users(user_id)
);

-- Crear tabla de items de solicitudes
CREATE TABLE IF NOT EXISTS solicitudes_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_id INT NOT NULL,
    article_id INT NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL,
    precio_unitario DECIMAL(10,2) NULL,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_solicitud (solicitud_id),
    INDEX idx_articulo (article_id),
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(article_id)
);

-- Función para generar folio automático
DELIMITER //
CREATE FUNCTION IF NOT EXISTS generar_folio_solicitud(tipo_sol VARCHAR(10)) 
RETURNS VARCHAR(50) 
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE contador INT DEFAULT 1;
    DECLARE nuevo_folio VARCHAR(50);
    DECLARE existe INT DEFAULT 0;
    
    -- Obtener el próximo número de folio para este tipo y año
    SELECT COALESCE(MAX(CAST(SUBSTRING(folio, -6) AS UNSIGNED)), 0) + 1 
    INTO contador
    FROM solicitudes 
    WHERE tipo = tipo_sol 
    AND YEAR(fecha) = YEAR(CURDATE())
    AND folio LIKE CONCAT(tipo_sol, '-', YEAR(CURDATE()), '-%');
    
    -- Generar el folio
    SET nuevo_folio = CONCAT(tipo_sol, '-', YEAR(CURDATE()), '-', LPAD(contador, 6, '0'));
    
    RETURN nuevo_folio;
END//
DELIMITER ;
