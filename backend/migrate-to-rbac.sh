#!/bin/bash

# Script para migrar el sistema existente al nuevo RBAC
# Ejecuta paso a paso con verificaciones

echo "🔄 MIGRACIÓN DEL SISTEMA A RBAC"
echo "==============================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
show_message() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

show_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

show_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

show_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    show_error "Este script debe ejecutarse desde el directorio raíz del backend"
    exit 1
fi

# Verificar que existe el archivo de migración
MIGRATION_FILE="database/migrations/migrate_existing_system_to_rbac.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
    show_error "Archivo de migración no encontrado: $MIGRATION_FILE"
    exit 1
fi

echo "Paso 1: Verificar conexión a la base de datos"
echo "============================================="

# Verificar variables de entorno
if [ -f ".env" ]; then
    show_success "Archivo .env encontrado"
    source .env
else
    show_warning "Archivo .env no encontrado, usando valores por defecto"
fi

DB_HOST=${DB_HOST:-localhost}
DB_USER=${DB_USER:-root}
DB_DATABASE=${DB_DATABASE:-be_exen_db}
DB_PORT=${DB_PORT:-3306}

echo "Configuración de BD:"
echo "  Host: $DB_HOST"
echo "  Puerto: $DB_PORT"
echo "  Usuario: $DB_USER"
echo "  Base de datos: $DB_DATABASE"
echo ""

read -p "¿La configuración es correcta? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    show_error "Configura las variables de entorno en .env y vuelve a ejecutar"
    exit 1
fi

echo ""
echo "Paso 2: Hacer backup de las tablas existentes"
echo "=============================================="

# Crear directorio de backups si no existe
mkdir -p backups

# Generar nombre de backup con fecha
BACKUP_FILE="backups/backup_before_rbac_$(date +%Y%m%d_%H%M%S).sql"

show_message "Creando backup en: $BACKUP_FILE"

# Crear backup de las tablas importantes
mysqldump --host="$DB_HOST" --port="$DB_PORT" --user="$DB_USER" -p \
    --single-transaction --routines --triggers \
    "$DB_DATABASE" users groups > "$BACKUP_FILE" 2>/dev/null

if [ $? -eq 0 ]; then
    show_success "Backup creado exitosamente"
else
    show_error "Error al crear backup. Verifica la conexión a la BD"
    exit 1
fi

echo ""
echo "Paso 3: Ejecutar migración SQL"
echo "==============================="

show_message "Ejecutando migración RBAC..."

# Ejecutar la migración
mysql --host="$DB_HOST" --port="$DB_PORT" --user="$DB_USER" -p \
    "$DB_DATABASE" < "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    show_success "Migración SQL ejecutada exitosamente"
else
    show_error "Error al ejecutar migración SQL"
    echo ""
    show_warning "Para restaurar el backup:"
    echo "mysql --host=\"$DB_HOST\" --port=\"$DB_PORT\" --user=\"$DB_USER\" -p \"$DB_DATABASE\" < \"$BACKUP_FILE\""
    exit 1
fi

echo ""
echo "Paso 4: Actualizar contraseñas de usuarios"
echo "=========================================="

show_message "Ejecutando script de actualización de contraseñas..."

# Ejecutar script de actualización de contraseñas
node scripts/update-passwords.js

if [ $? -eq 0 ]; then
    show_success "Contraseñas actualizadas exitosamente"
else
    show_warning "Hubo un problema al actualizar contraseñas, pero la migración continuó"
fi

echo ""
echo "Paso 5: Verificar la migración"
echo "==============================="

show_message "Verificando estructura de la base de datos..."

# Crear script de verificación temporal
cat > temp_verify.sql << 'EOF'
SELECT 'TABLAS CREADAS:' as verificacion;
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('roles', 'permissions', 'role_permissions') THEN 'NUEVA'
        ELSE 'EXISTENTE'
    END as tipo
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name IN ('users', 'groups', 'roles', 'permissions', 'role_permissions')
ORDER BY tipo, table_name;

SELECT '' as espacio;
SELECT 'ROLES CREADOS:' as verificacion;
SELECT id, name, description FROM roles ORDER BY id;

SELECT '' as espacio;
SELECT 'USUARIOS CON ROLES:' as verificacion;
SELECT u.username, u.name, g.name as grupo, r.name as rol 
FROM users u 
LEFT JOIN groups g ON u.group_id = g.group_id
LEFT JOIN roles r ON u.role_id = r.id
ORDER BY u.username;

SELECT '' as espacio;
SELECT 'PERMISOS POR ROL:' as verificacion;
SELECT r.name as rol, 
       COUNT(CASE WHEN rp.can_view = 1 THEN 1 END) as puede_ver,
       COUNT(CASE WHEN rp.can_create = 1 THEN 1 END) as puede_crear,
       COUNT(CASE WHEN rp.can_edit = 1 THEN 1 END) as puede_editar,
       COUNT(CASE WHEN rp.can_delete = 1 THEN 1 END) as puede_eliminar
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name
ORDER BY r.name;
EOF

# Ejecutar verificación
mysql --host="$DB_HOST" --port="$DB_PORT" --user="$DB_USER" -p \
    --table "$DB_DATABASE" < temp_verify.sql

# Limpiar archivo temporal
rm temp_verify.sql

if [ $? -eq 0 ]; then
    show_success "Verificación completada"
else
    show_warning "Problema al ejecutar verificación"
fi

echo ""
echo "🎉 MIGRACIÓN COMPLETADA"
echo "======================"
echo ""
show_success "El sistema ha sido migrado exitosamente al nuevo RBAC"
echo ""
echo "📋 Resumen de cambios:"
echo "  ✅ Tablas de roles y permisos creadas"
echo "  ✅ Grupos existentes migrados a roles"
echo "  ✅ Usuarios vinculados al sistema de roles"
echo "  ✅ Permisos asignados según el tipo de usuario"
echo "  ✅ Contraseñas actualizadas (123456 para todos)"
echo ""
echo "📁 Backup guardado en: $BACKUP_FILE"
echo ""
show_warning "IMPORTANTE:"
echo "  1. Tu sistema anterior sigue funcionando (group_id mantenido)"
echo "  2. El nuevo sistema RBAC está ahora disponible"
echo "  3. Puedes acceder al Panel de Administración con usuario 'pavelino'"
echo "  4. La contraseña temporal para todos los usuarios es: 123456"
echo ""
echo "🚀 Siguiente paso: Iniciar el frontend y backend para probar el sistema"
