# 🚀 Guía de Despliegue en Render

## 📋 Variables de Entorno Requeridas

### Backend (https://be-exenty.onrender.com)
```
NODE_ENV=production
DB_HOST=tu_host_mysql
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password_mysql
DB_NAME=be_exenty_db
DB_PORT=3306
JWT_SECRET=tu_jwt_secret_muy_seguro
PORT=3001
```

### Frontend (https://front-lxru.onrender.com)
```
VITE_API_BASE_URL=https://be-exenty.onrender.com
```

## 🔧 Configuración de Servicios en Render

### Backend Service
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment**: Node
- **Plan**: Free (o el que prefieras)
- **Auto-Deploy**: Yes (conectado a GitHub)

### Frontend Service  
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment**: Static Site
- **Plan**: Free
- **Auto-Deploy**: Yes (conectado a GitHub)

## 🐛 Solución de Problemas Comunes

### Error 503 - Backend no inicia
1. Verificar que todas las variables de entorno estén configuradas
2. Revisar los logs del servicio en el dashboard de Render
3. Verificar conexión a la base de datos MySQL

### Error CORS  
- El código ya incluye configuración CORS mejorada
- Temporalmente permite todos los orígenes para debugging
- En producción usar solo: `https://front-lxru.onrender.com`

### Error de Base de Datos
1. Verificar credenciales de MySQL en Hostinger
2. Asegurarse de que la IP de Render esté en whitelist
3. Verificar que el schema existe

## ⚡ Scripts de Debug

### Verificar Backend Local
```bash
curl -X GET "http://localhost:3001/" 
```

### Verificar Backend en Render
```bash
curl -X GET "https://be-exenty.onrender.com/"
```

### Test de Login
```bash
curl -X POST "https://be-exenty.onrender.com/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"mavila","password":"Soldier10-"}'
```

## 🔄 Proceso de Re-deploy

1. Hacer cambios en el código
2. Commit y push a GitHub:
   ```bash
   git add -A
   git commit -m "mensaje descriptivo"
   git push origin main
   ```
3. Render detectará los cambios automáticamente
4. Esperar el build y deployment (2-5 minutos)

## 📊 Monitoreo

- **Backend Health**: https://be-exenty.onrender.com/
- **Frontend**: https://front-lxru.onrender.com/
- **Logs**: Dashboard de Render > tu servicio > Logs

## 🔒 Seguridad

- JWT tokens con expiración
- Encriptación bcrypt para passwords
- CORS configurado para dominios específicos
- Headers de seguridad incluidos
