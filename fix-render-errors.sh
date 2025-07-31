#!/bin/bash

# ===============================================
# CORRECCIÓN RÁPIDA - ERRORES 500 EN RENDER
# ===============================================

echo "🔧 Corrigiendo imports de middleware..."

# Hacer commit de los cambios
git add .
git commit -m "fix: Corregir imports de middleware para solucionar errores 500

- Unificar imports de ../middleware/authMiddleware.js
- Reemplazar auth/onlyAdmin con verifyAuth/checkAdmin/checkPermission
- Corregir rutas de almacén, usuarios, ajustes, permisos y seguridad
- Eliminar referencias a middlewares obsoletos"

echo "✅ Cambios commiteados"

# Push a GitHub
git push origin main

echo "🚀 Cambios enviados a GitHub"
echo ""
echo "📋 SIGUIENTE PASO:"
echo "1. Ve a Render.com"
echo "2. Tu app se redesplegarÃ¡ automáticamente"
echo "3. Espera 2-3 minutos"
echo "4. Prueba login con: pavelino / 123456"
echo "5. Verifica que los paneles cargan sin errores 500"
echo ""
echo "🔍 USUARIOS DISPONIBLES:"
echo "- pavelino / 123456 (Administrador)"
echo "- gflores / 123456 (Compras)"
echo "- mcabrera / 123456 (Supervisor)"
echo "- eavila / 123456 (Ingenierias)"
