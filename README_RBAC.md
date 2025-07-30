# 🔐 Sistema de Roles y Permisos (RBAC) - Be-exen

## 📋 Resumen

Este sistema implementa un **Role-Based Access Control (RBAC)** completo que es **totalmente compatible** con tu sistema existente de grupos y usuarios. 

### ✨ Características Principales

- 🔄 **Compatibilidad Total**: Mantiene tu sistema existente funcionando
- 🎛️ **Panel Dinámico**: Gestión de permisos sin cambios de código
- 👥 **Multi-Usuario**: Soporte para roles específicos (pavelino, gflores, mcabrera, eavila)
- 🔐 **Seguridad Granular**: Permisos de ver, crear, editar, eliminar por módulo
- 📊 **Migración Gradual**: Transición sin pérdida de datos

## 🗂️ Estructura del Sistema

### Tablas Nuevas (RBAC)
```sql
roles              -> Definición de roles (Administrador, Compras, Supervisor, etc.)
permissions        -> Permisos específicos por módulo
role_permissions   -> Matriz de permisos por rol
```

### Tablas Existentes (Preservadas)
```sql
users     -> Se mantiene, se añade role_id (opcional)
groups    -> Se mantiene intacta para compatibilidad
```

## 🚀 Guía de Implementación

### Paso 1: Ejecutar Migración

```bash
cd backend
./migrate-to-rbac.sh
```

Este script:
- ✅ Crea backup automático de tus datos
- ✅ Crea las nuevas tablas RBAC
- ✅ Migra grupos existentes a roles
- ✅ Asigna permisos según el tipo de grupo
- ✅ Actualiza contraseñas de usuarios

### Paso 2: Usuarios Creados/Actualizados

| Usuario | Contraseña | Rol | Permisos |
|---------|------------|-----|----------|
| `pavelino` | `123456` | Administrador | Todos los permisos |
| `gflores` | `123456` | Compras | Entradas y Salidas |
| `mcabrera` | `123456` | Supervisor | Solo consulta |
| `eavila` | `123456` | Dirección | Consulta + Reportes |

### Paso 3: Acceder al Panel de Administración

1. Inicia sesión con `pavelino` / `123456`
2. Ve a **Panel de Administración de Permisos**
3. Selecciona un rol de la lista de usuarios
4. Configura permisos por módulo dinámicamente

## 📁 Archivos Implementados

### Backend
```
backend/
├── controllers/roleController.js       -> Gestión de roles y permisos
├── middleware/authMiddleware.js        -> Verificación de permisos
├── routes/roleRoutes.js               -> Endpoints del sistema RBAC
├── scripts/update-passwords.js        -> Actualización de contraseñas
├── database/migrations/
│   ├── migrate_existing_system_to_rbac.sql  -> Migración principal
│   └── add_supplier_fields_to_articles.sql -> Campos de proveedor
└── migrate-to-rbac.sh                 -> Script de migración completo
```

### Frontend
```
frontend/src/
├── pages/administracion/
│   └── PermisosPanel.tsx              -> Panel de gestión dinámico
├── pages/almacen/
│   ├── ArticuloForm.tsx               -> Formulario con campos de proveedor
│   └── SalidaForm.tsx                 -> "Nombre del Proyecto"
└── App.tsx                            -> Ruta del panel añadida
```

## 🔧 API Endpoints

### Gestión de Roles
```
GET    /api/roles                      -> Obtener todos los roles
GET    /api/roles/users                -> Usuarios con roles
GET    /api/roles/permissions          -> Todos los permisos
GET    /api/roles/:id/permissions      -> Permisos de un rol
PUT    /api/roles/permissions          -> Actualizar permisos
```

### Gestión de Usuarios
```
GET    /api/roles/users/:id/permissions -> Permisos de usuario
POST   /api/roles/users/:id/migrate     -> Migrar usuario a RBAC
```

### Rutas Protegidas (Ejemplo)
```
GET    /api/almacen/articulos          -> Requiere permiso: almacen.view
POST   /api/almacen/articulos          -> Requiere permiso: almacen.create
PUT    /api/almacen/articulos/:id      -> Requiere permiso: almacen.edit
DELETE /api/almacen/articulos/:id      -> Requiere permiso: almacen.delete
```

## 🛡️ Sistema de Permisos

### Módulos Disponibles
- **almacen**: Gestión de artículos y stock
- **entradas**: Registro de entradas de mercancía
- **salidas**: Registro de salidas de mercancía
- **usuarios**: Gestión de usuarios
- **administracion**: Panel de administración

### Tipos de Permisos
- **can_view**: Ver información
- **can_create**: Crear nuevos registros
- **can_edit**: Modificar registros existentes
- **can_delete**: Eliminar registros

### Matriz de Permisos por Rol

| Rol | Almacén | Entradas | Salidas | Usuarios | Admin |
|-----|---------|----------|---------|----------|-------|
| **Administrador** | ✅ ✅ ✅ ✅ | ✅ ✅ ✅ ✅ | ✅ ✅ ✅ ✅ | ✅ ✅ ✅ ✅ | ✅ ✅ ✅ ✅ |
| **Compras** | ✅ ❌ ❌ ❌ | ✅ ✅ ✅ ❌ | ✅ ✅ ✅ ❌ | ❌ ❌ ❌ ❌ | ❌ ❌ ❌ ❌ |
| **Supervisor** | ✅ ❌ ❌ ❌ | ✅ ❌ ❌ ❌ | ✅ ❌ ❌ ❌ | ❌ ❌ ❌ ❌ | ❌ ❌ ❌ ❌ |
| **Dirección** | ✅ ❌ ❌ ❌ | ✅ ❌ ❌ ❌ | ✅ ❌ ❌ ❌ | ✅ ❌ ❌ ❌ | ❌ ❌ ❌ ❌ |

*Leyenda: Ver | Crear | Editar | Eliminar*

## 🔄 Compatibilidad con Sistema Anterior

### Sistema Dual
El sistema funciona con **doble compatibilidad**:

1. **Usuarios Legacy**: Siguen usando `group_id`, permisos asignados automáticamente
2. **Usuarios RBAC**: Usan `role_id`, permisos configurables dinámicamente

### Migración Gradual
```javascript
// Usuario legacy (automático)
user.group_id = 1 (admin) -> Permisos completos automáticos

// Usuario migrado (configurable)
user.role_id = 1 (Administrador) -> Permisos configurables en panel
```

## 📊 Mejoras Implementadas

### ✅ Punto 5: Campos de Proveedor
- Formulario de artículos en 2 columnas
- Campos: `supplier_code` y `supplier_name`
- Modal más amplio (modal-xl)

### ✅ Punto 6: Nombre del Proyecto
- Campo "Motivo" cambiado a "Nombre del Proyecto"
- Actualizado en formularios y listas

### ✅ Puntos 7-9: Sistema RBAC Completo
- Panel de administración dinámico
- Gestión de permisos sin código
- Usuarios específicos configurados

## 🚨 Consideraciones Importantes

### Backup Automático
- Se crea backup antes de cada migración
- Ubicación: `backend/backups/backup_before_rbac_YYYYMMDD_HHMMSS.sql`

### Restauración (si necesaria)
```bash
mysql -h HOST -P PORT -u USER -p DATABASE < backup_file.sql
```

### Variables de Entorno Requeridas
```env
DB_HOST=tu_host
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_DATABASE=be_exen_db
JWT_SECRET=tu_jwt_secret
```

## 🎯 Próximos Pasos

1. **Ejecutar migración**: `./migrate-to-rbac.sh`
2. **Probar acceso**: Login con `pavelino` / `123456`
3. **Configurar permisos**: Usar panel de administración
4. **Migrar usuarios**: Opcional, uno por uno según necesidad

## 🔧 Troubleshooting

### Error de Conexión DB
```bash
# Verificar conexión
mysql -h HOST -P PORT -u USER -p

# Verificar variables de entorno
cat .env | grep DB_
```

### Error de Permisos
```bash
# Verificar tablas creadas
mysql> SHOW TABLES LIKE '%role%';

# Verificar usuarios migrados
mysql> SELECT username, group_id, role_id FROM users;
```

### Panel No Visible
1. Verificar que las rutas estén añadidas en `App.tsx`
2. Verificar que el backend tenga las rutas `/api/roles`
3. Verificar autenticación con token válido

---

## 🎉 ¡Sistema Listo!

Tu sistema ahora cuenta con:
- ✅ Gestión dinámica de permisos
- ✅ Compatibilidad total con sistema anterior
- ✅ Panel de administración intuitivo
- ✅ Seguridad granular por módulo
- ✅ Migración sin pérdida de datos

**¡Perfecto para gestionar permisos sin tocar código!** 🚀
