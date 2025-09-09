# Configuración de Variables de Entorno

## Desarrollo Local

Para desarrollo local, crea un archivo `.env.local` en la carpeta `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

O simplemente deja que use la configuración automática (proxy de Vite).

## Producción

En Render u otros servicios de hosting, configura la variable de entorno:

```
VITE_API_BASE_URL=https://be-exenty.onrender.com/api
```

## Cómo funciona

- **Desarrollo**: Usa el proxy de Vite (`/api` → `http://localhost:3001`)
- **Producción**: Usa la URL completa del backend desplegado
- **Configuración automática**: Si no se define `VITE_API_BASE_URL`, usa valores por defecto según el entorno

## Archivos importantes

- `frontend/src/config/api.ts` - Configuración de URLs de API
- `frontend/.env.example` - Ejemplo de variables de entorno
- `frontend/.env.local` - Variables para desarrollo (no se sube al repo)
