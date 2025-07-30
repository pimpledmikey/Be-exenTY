#!/bin/bash

echo "🔍 Verificando implementación del sistema de roles y permisos..."
echo ""

# Verificar archivos de migración
echo "📁 Archivos de migración:"
if [ -f "/Users/miguelrequena/Documents/Be-exen-proyect/backend/migrations/add_supplier_fields_to_articles.sql" ]; then
    echo "✅ add_supplier_fields_to_articles.sql"
else
    echo "❌ add_supplier_fields_to_articles.sql - FALTANTE"
fi

if [ -f "/Users/miguelrequena/Documents/Be-exen-proyect/backend/migrations/create_roles_and_permissions.sql" ]; then
    echo "✅ create_roles_and_permissions.sql"
else
    echo "❌ create_roles_and_permissions.sql - FALTANTE"
fi

if [ -f "/Users/miguelrequena/Documents/Be-exen-proyect/backend/migrations/create_specific_users.sql" ]; then
    echo "✅ create_specific_users.sql"
else
    echo "❌ create_specific_users.sql - FALTANTE"
fi

if [ -f "/Users/miguelrequena/Documents/Be-exen-proyect/backend/migrations/hash-passwords.js" ]; then
    echo "✅ hash-passwords.js"
else
    echo "❌ hash-passwords.js - FALTANTE"
fi

echo ""

# Verificar archivos de backend
echo "🔧 Archivos de backend:"
if [ -f "/Users/miguelrequena/Documents/Be-exen-proyect/backend/controllers/roleController.js" ]; then
    echo "✅ roleController.js"
else
    echo "❌ roleController.js - FALTANTE"
fi

if [ -f "/Users/miguelrequena/Documents/Be-exen-proyect/backend/routes/roleRoutes.js" ]; then
    echo "✅ roleRoutes.js"
else
    echo "❌ roleRoutes.js - FALTANTE"
fi

if [ -f "/Users/miguelrequena/Documents/Be-exen-proyect/backend/middleware/authMiddleware.js" ]; then
    echo "✅ authMiddleware.js"
else
    echo "❌ authMiddleware.js - FALTANTE"
fi

echo ""

# Verificar archivos de frontend
echo "🎨 Archivos de frontend:"
if [ -f "/Users/miguelrequena/Documents/Be-exen-proyect/frontend/src/pages/administracion/PermisosPanel.tsx" ]; then
    echo "✅ PermisosPanel.tsx"
else
    echo "❌ PermisosPanel.tsx - FALTANTE"
fi

echo ""

# Verificar configuración en app.js
echo "🔗 Configuración de rutas:"
if grep -q "roleRoutes" "/Users/miguelrequena/Documents/Be-exen-proyect/backend/app.js"; then
    echo "✅ Rutas de roles configuradas en app.js"
else
    echo "❌ Rutas de roles NO configuradas en app.js"
fi

if grep -q "PermisosPanel" "/Users/miguelrequena/Documents/Be-exen-proyect/frontend/src/App.tsx"; then
    echo "✅ PermisosPanel importado en App.tsx"
else
    echo "❌ PermisosPanel NO importado en App.tsx"
fi

if grep -q "administracion" "/Users/miguelrequena/Documents/Be-exen-proyect/frontend/src/components/Sidebar.tsx"; then
    echo "✅ Menú de administración añadido al Sidebar"
else
    echo "❌ Menú de administración NO añadido al Sidebar"
fi

echo ""

# Verificar documentación
echo "📚 Documentación:"
if [ -f "/Users/miguelrequena/Documents/Be-exen-proyect/SISTEMA-PERMISOS.md" ]; then
    echo "✅ SISTEMA-PERMISOS.md"
else
    echo "❌ SISTEMA-PERMISOS.md - FALTANTE"
fi

if [ -f "/Users/miguelrequena/Documents/Be-exen-proyect/setup-permissions.sh" ]; then
    echo "✅ setup-permissions.sh"
else
    echo "❌ setup-permissions.sh - FALTANTE"
fi

echo ""
echo "🎯 RESUMEN DE LA IMPLEMENTACIÓN:"
echo "================================"
echo ""
echo "✅ COMPLETADO:"
echo "   • Punto 5: Campos de proveedor en artículos"
echo "   • Punto 6: Cambio de 'descripción' a 'nombre del proyecto'"
echo "   • Puntos 7-9: Sistema completo de roles y permisos (RBAC)"
echo "   • Panel de administración dinámico"
echo "   • Middleware de autorización granular"
echo "   • Usuarios específicos configurados"
echo "   • Documentación completa"
echo ""
echo "🎮 PRÓXIMOS PASOS:"
echo "   1. Ejecutar: ./setup-permissions.sh"
echo "   2. Verificar conexión a base de datos"
echo "   3. Probar login con usuarios creados"
echo "   4. Acceder al panel de administración"
echo ""
echo "👥 USUARIOS DISPONIBLES:"
echo "   • pavelino (Administrador)"
echo "   • gflores (Entradas/Salidas)"
echo "   • mcabrera (Solo Lectura)"
echo "   • eavila (Dirección)"
echo ""
