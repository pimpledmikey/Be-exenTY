#!/bin/sh
# Script para arrancar frontend y backend en modo desarrollo

cd "$(dirname "$0")"

# Arrancar backend
echo "Iniciando backend..."
(cd backend && npm run dev &)

# Arrancar frontend
echo "Iniciando frontend..."
(cd frontend && npm run dev &)

echo "Ambos servidores están arrancando."
