# Be-exenTY

Monorepo para el sistema web de la empresa.

## Estructura
- `frontend/`: React + Vite + TypeScript
- `backend/`: Node.js + Express + MySQL

## Primeros pasos

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
1. Copia `.env.example` a `.env` y coloca tus datos de MySQL de Hostinger.
2. Luego:
```bash
cd backend
npm install
npm run dev
```

## Despliegue
- Sube el proyecto a GitHub.
- Conecta Render para desplegar backend y frontend.

## Notas
- El backend está preparado para conectar a MySQL remoto (Hostinger).
- El frontend y backend pueden desplegarse por separado en Render.
