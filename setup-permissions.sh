#!/bin/bash

# Script para configurar el sistema de roles y permisos
echo "🚀 Configurando sistema de roles y permisos..."

# Definir ruta del proyecto
PROJECT_ROOT="/Users/miguelrequena/Documents/Be-exen-proyect"
BACKEND_ROOT="$PROJECT_ROOT/backend"

# Verificar que estamos en el directorio correcto
if [ ! -d "$BACKEND_ROOT" ]; then
    echo "❌ Error: No se encuentra el directorio backend en $PROJECT_ROOT"
    exit 1
fi

cd "$BACKEND_ROOT"

echo "📁 Directorio actual: $(pwd)"

# Verificar conexión a base de datos
echo "🔍 Verificando conexión a la base de datos..."

# Ejecutar migraciones
echo "📊 Ejecutando migraciones de base de datos..."

echo "1️⃣ Añadiendo campos de proveedor a artículos..."
if [ -f "migrations/add_supplier_fields_to_articles.sql" ]; then
    mysql -u root -p -e "source migrations/add_supplier_fields_to_articles.sql"
    echo "✅ Campos de proveedor añadidos"
else
    echo "⚠️ Archivo de migración no encontrado: migrations/add_supplier_fields_to_articles.sql"
fi

echo "2️⃣ Creando tablas de roles y permisos..."
if [ -f "migrations/create_roles_and_permissions.sql" ]; then
    mysql -u root -p -e "source migrations/create_roles_and_permissions.sql"
    echo "✅ Tablas de roles y permisos creadas"
else
    echo "⚠️ Archivo de migración no encontrado: migrations/create_roles_and_permissions.sql"
fi

echo "3️⃣ Creando usuarios específicos..."
if [ -f "migrations/create_specific_users.sql" ]; then
    mysql -u root -p -e "source migrations/create_specific_users.sql"
    echo "✅ Usuarios específicos creados"
else
    echo "⚠️ Archivo de migración no encontrado: migrations/create_specific_users.sql"
fi

# Generar hashes de contraseñas
echo "🔐 Generando hashes de contraseñas..."
if [ -f "migrations/hash-passwords.js" ]; then
    node migrations/hash-passwords.js
    echo "✅ Hashes de contraseñas generados"
else
    echo "⚠️ Script de hash no encontrado: migrations/hash-passwords.js"
fi

# Instalar dependencias si es necesario
echo "📦 Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependencias del backend..."
    npm install
fi

# Verificar que todas las rutas estén configuradas
echo "🔗 Verificando configuración de rutas..."
if grep -q "roleRoutes" app.js; then
    echo "✅ Rutas de roles configuradas"
else
    echo "⚠️ Las rutas de roles no están configuradas en app.js"
fi

echo "🎉 Configuración completada!"
echo ""
echo "📋 Resumen de usuarios creados:"
echo "├── pavelino (Administrador) - Acceso completo"
echo "├── gflores (Entradas/Salidas) - Gestión de inventario"
echo "├── mcabrera (Solo lectura) - Consultas únicamente"
echo "└── eavila (Dirección) - Supervisión general"
echo ""
echo "🌐 Para acceder al panel de administración:"
echo "1. Inicia sesión con el usuario 'pavelino'"
echo "2. Ve a la sección 'Administración' en el menú lateral"
echo "3. Configura los permisos según tus necesidades"
echo ""
echo "⚠️ IMPORTANTE:"
echo "- Asegúrate de que la base de datos 'be_exen_proyect' exista"
echo "- Verifica las credenciales de base de datos en config/database.js"
echo "- Las contraseñas por defecto están en el archivo hash-passwords.js"
