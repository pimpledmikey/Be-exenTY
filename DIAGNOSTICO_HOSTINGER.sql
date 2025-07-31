-- ===============================================
-- DIAGNÓSTICO DE BASE DE DATOS HOSTINGER
-- ===============================================
-- Ejecuta estas queries UNA POR UNA para diagnosticar

-- 1. Ver qué base de datos estás usando
SELECT DATABASE() as base_datos_actual;

-- 2. Ver todas las bases de datos disponibles
SHOW DATABASES;

-- 3. Ver todas las tablas en la base de datos actual
SHOW TABLES;

-- 4. Si ves tablas, ver específicamente si existe 'users'
SHOW TABLES LIKE 'users';

-- 5. Si no ves la tabla users, buscar tablas similares
SHOW TABLES LIKE '%user%';

-- 6. Ver información sobre todas las tablas
SELECT 
    TABLE_NAME as tabla,
    TABLE_ROWS as filas,
    CREATE_TIME as fecha_creacion
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME;

-- ===============================================
-- PASOS A SEGUIR SEGÚN EL RESULTADO:
-- ===============================================

/*
SI NO VES NINGUNA TABLA:
- Necesitas ejecutar el script de migración completo
- Usa MIGRACION_HOSTINGER.sql

SI VES OTRAS TABLAS PERO NO 'users':
- La tabla users podría tener otro nombre
- Revisa si existe 'user', 'usuarios', etc.

SI DATABASE() DEVUELVE NULL:
- Necesitas seleccionar tu base de datos primero:
- USE tu_nombre_de_base_de_datos;

SI VES MÚLTIPLES BASES DE DATOS:
- Asegúrate de estar en la correcta
- Generalmente es algo como 'u123456_nombreapp'
*/

SELECT '🔍 DIAGNÓSTICO COMPLETADO' as resultado;
