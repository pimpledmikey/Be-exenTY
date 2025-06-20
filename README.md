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

## Despliegue en Render

### Backend (servicio web)
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Variables de entorno:**
  - `DB_HOST`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`
  - `JWT_SECRET` (elige una clave segura)
  - `PORT` (opcional)

### Frontend (servicio web estático o Node)
- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Start Command:**
  - Si usas Node: `npm run preview`
  - Si usas servicio estático: apunta a la carpeta `frontend/dist`

### Proxy y rutas API
- En desarrollo, el proxy de Vite redirige `/api` a `localhost:3001`.
- En producción, asegúrate de que las URLs del frontend apunten al dominio del backend de Render (puedes usar rutas relativas `/api`).

### Seguridad
- **Nunca subas `.env` real a GitHub.**
- Configura todas las variables de entorno desde el panel de Render.
- No subas archivos de base de datos ni datos sensibles.

## Notas
- El backend está preparado para conectar a MySQL remoto (Hostinger).
- El frontend y backend pueden desplegarse por separado en Render.
- Si necesitas migrar la base de datos, usa los scripts SQL incluidos en `/backend`.
- Si usas dominios personalizados, configura los CORS en el backend.
