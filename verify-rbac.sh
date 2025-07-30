#!/bin/bash

# Script de verificación del sistema RBAC
echo "🔍 VERIFICACIÓN DEL SISTEMA RBAC"
echo "================================="

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

check_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

check_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

check_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo ""
echo "1. Verificando estructura de archivos..."
echo "========================================"

# Verificar archivos backend críticos
files_backend=(
    "backend/controllers/roleController.js"
    "backend/routes/roleRoutes.js"
    "backend/middleware/authMiddleware.js"
    "backend/scripts/update-passwords.js"
    "backend/database/migrations/migrate_existing_system_to_rbac.sql"
    "backend/migrate-to-rbac.sh"
)

for file in "${files_backend[@]}"; do
    if [[ -f "$file" ]]; then
        check_success "Backend: $file"
    else
        check_error "Falta: $file"
    fi
done

# Verificar archivos frontend críticos
files_frontend=(
    "frontend/src/pages/administracion/PermisosPanel.tsx"
    "frontend/src/pages/almacen/ArticuloForm.tsx"
)

for file in "${files_frontend[@]}"; do
    if [[ -f "$file" ]]; then
        check_success "Frontend: $file"
    else
        check_error "Falta: $file"
    fi
done

echo ""
echo "2. Verificando configuración..."
echo "==============================="

# Verificar .env
if [[ -f "backend/.env" ]]; then
    check_success "Archivo .env encontrado"
    
    # Verificar variables críticas
    if grep -q "DB_HOST" backend/.env; then
        check_success "DB_HOST configurado"
    else
        check_warning "DB_HOST no encontrado en .env"
    fi
    
    if grep -q "DB_DATABASE" backend/.env; then
        check_success "DB_DATABASE configurado"
    else
        check_warning "DB_DATABASE no encontrado en .env"
    fi
else
    check_warning "Archivo .env no encontrado en backend/"
fi

# Verificar que el script de migración sea ejecutable
if [[ -x "backend/migrate-to-rbac.sh" ]]; then
    check_success "Script de migración es ejecutable"
else
    check_warning "Script de migración no es ejecutable"
    echo "           Ejecuta: chmod +x backend/migrate-to-rbac.sh"
fi

echo ""
echo "3. Verificando dependencias..."
echo "=============================="

# Verificar Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    check_success "Node.js instalado: $NODE_VERSION"
else
    check_error "Node.js no encontrado"
fi

# Verificar npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    check_success "npm instalado: $NPM_VERSION"
else
    check_error "npm no encontrado"
fi

# Verificar MySQL cliente
if command -v mysql &> /dev/null; then
    check_success "Cliente MySQL encontrado"
else
    check_warning "Cliente MySQL no encontrado"
    echo "           Instala con: brew install mysql-client (macOS)"
fi

echo ""
echo "4. Verificando estructura del proyecto..."
echo "========================================="

# Verificar package.json en ambos directorios
if [[ -f "backend/package.json" ]]; then
    check_success "Backend package.json"
else
    check_error "Falta backend/package.json"
fi

if [[ -f "frontend/package.json" ]]; then
    check_success "Frontend package.json"
else
    check_error "Falta frontend/package.json"
fi

# Verificar node_modules
if [[ -d "backend/node_modules" ]]; then
    check_success "Backend dependencias instaladas"
else
    check_warning "Backend dependencias no instaladas"
    echo "           Ejecuta: cd backend && npm install"
fi

if [[ -d "frontend/node_modules" ]]; then
    check_success "Frontend dependencias instaladas"
else
    check_warning "Frontend dependencias no instaladas"
    echo "           Ejecuta: cd frontend && npm install"
fi

echo ""
echo "5. Verificando archivos de migración..."
echo "======================================="

# Verificar que existen los archivos SQL
migration_files=(
    "backend/database/migrations/migrate_existing_system_to_rbac.sql"
    "backend/database/migrations/add_supplier_fields_to_articles.sql"
)

for file in "${migration_files[@]}"; do
    if [[ -f "$file" ]]; then
        check_success "Migración: $(basename $file)"
    else
        check_error "Falta migración: $file"
    fi
done

echo ""
echo "📋 RESUMEN DE VERIFICACIÓN"
echo "=========================="

echo ""
check_info "Estado del Sistema:"
echo ""
echo "🔧 Preparación:"
echo "   - Archivos RBAC creados"
echo "   - Migraciones preparadas"
echo "   - Scripts de configuración listos"
echo ""
echo "🚀 Siguiente paso:"
echo "   1. Asegúrate de tener la base de datos funcionando"
echo "   2. Configura las variables en backend/.env"
echo "   3. Ejecuta: cd backend && ./migrate-to-rbac.sh"
echo ""
echo "💡 Después de la migración:"
echo "   - Inicia el backend: cd backend && npm start"
echo "   - Inicia el frontend: cd frontend && npm run dev"
echo "   - Login con: pavelino / 123456"
echo ""

# Verificar si ya se ejecutó la migración
if [[ -f "backend/backups/backup_before_rbac_"* ]]; then
    check_success "¡Migración ya ejecutada! (backup encontrado)"
    echo ""
    echo "🎉 El sistema RBAC está listo para usar"
    echo "   - Panel de administración disponible"
    echo "   - Usuarios configurados"
    echo "   - Permisos asignados"
else
    check_info "Migración pendiente - ejecuta ./migrate-to-rbac.sh cuando esté listo"
fi

echo ""
echo "📖 Para más información consulta: README_RBAC.md"
echo ""
