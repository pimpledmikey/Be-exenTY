# 🚀 GUÍA COMPLETA: MIGRACIÓN EN HOSTINGER

## 📋 **Pasos para ejecutar en tu Hostinger**

### 1. **Acceder a phpMyAdmin**
1. Ve a tu panel de Hostinger
2. Click en "Bases de datos" → "phpMyAdmin"
3. Selecciona tu base de datos (probablemente `u574849695_beexen`)

### 2. **Ejecutar el script**
1. Ve a la pestaña **"SQL"** en phpMyAdmin
2. Copia TODO el contenido del archivo `MIGRACION_HOSTINGER.sql`
3. Pégalo en el área de texto
4. Click en **"Ejecutar"**

### 3. **¿Qué hace el script?**

#### ✅ **CREA:**
- Tabla `roles` (Administrador, Compras, Supervisor, Ingenierias)
- Tabla `permissions` (permisos granulares por módulo)
- Tabla `role_permissions` (asignación de permisos)

#### ✅ **AÑADE:**
- Columna `role_id` a tabla `users` (preserva `group_id`)
- Campos `supplier_code` y `supplier_name` a tabla `articles`

#### ✅ **CREA USUARIOS:**
- `pavelino` (Administrador) - contraseña: `123456`
- `gflores` (Compras) - contraseña: `123456`
- `mcabrera` (Supervisor) - contraseña: `123456`
- `eavila` (Ingenierias) - contraseña: `123456`

#### ✅ **PRESERVA:**
- Todas tus tablas existentes
- Todos tus datos actuales
- Tu sistema actual sigue funcionando

### 4. **Verificación**
El script incluye verificaciones automáticas que te mostrarán:
- ✅ Tablas creadas
- ✅ Roles configurados
- ✅ Usuarios con roles asignados
- ✅ Permisos por rol

### 5. **Si algo falla:**
- **Error de permisos:** Tu usuario de base de datos necesita permisos CREATE/ALTER
- **Error de sintaxis:** Ejecuta el script por secciones (copia solo una parte)
- **Campos ya existen:** Normal, el script está preparado para eso

### 6. **Después de la migración:**

#### **Iniciar servicios:**
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend  
cd frontend
npm run dev
```

#### **Probar el sistema:**
1. Ve a `http://localhost:5173`
2. Login: `pavelino` / `123456`
3. Verás el nuevo menú "Administración"
4. Click en "Panel de Permisos"

## 🎯 **Beneficios después de la migración:**

### **Panel Visual:**
- Configurar permisos con checkboxes
- Ver usuarios y roles en tiempo real
- Cambios sin necesidad de código

### **Formularios Mejorados:**
- Artículos en 2 columnas
- Campos de proveedor
- "Nombre del proyecto" en lugar de "Motivo"

### **Seguridad Avanzada:**
- Permisos granulares (ver/crear/editar/eliminar)
- Menús que se adaptan al rol
- Acceso controlado por módulo

## 🔐 **Usuarios y Accesos:**

| Usuario | Contraseña | Puede Ver | Puede Crear | Puede Editar | Puede Eliminar |
|---------|------------|-----------|-------------|--------------|----------------|
| `pavelino` | `123456` | Todo | Todo | Todo | Todo |
| `gflores` | `123456` | Almacén, Entradas, Salidas | Entradas, Salidas | Entradas, Salidas | ❌ |
| `mcabrera` | `123456` | Almacén, Entradas, Salidas | ❌ | ❌ | ❌ |
| `eavila` | `123456` | Almacén, Entradas, Salidas | Almacén, Entradas, Salidas | Almacén, Entradas, Salidas | ❌ |

## 📞 **¿Necesitas ayuda?**
- El script es **reversible**
- No elimina datos existentes
- Puedes ejecutarlo múltiples veces sin problemas

¡Tu sistema estará listo con el panel dinámico de permisos funcionando! 🎉
