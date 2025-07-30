# 📋 QUERIES PARA CREAR USUARIOS EN HOSTINGER

## Paso 1: Ver tus grupos disponibles
```sql
SELECT group_id, name FROM groups;
```

## Paso 2: Crear los usuarios (ajusta los group_id según tu resultado del paso 1)

### Usuario: pavelino (Administrador)
```sql
INSERT INTO users (username, password, name, email, group_id, theme)
VALUES ('pavelino', '$2b$10$xEwKpYNKKyYkGDEJpYrR/.rVw8AJbU8KzLrWjX1dTHmvOZF5C5rTG', 'Pavel Administrador', 'pavelino@empresa.com', [GROUP_ID_ADMIN], 'dark');
```

### Usuario: gflores (Compras)
```sql
INSERT INTO users (username, password, name, email, group_id, theme)
VALUES ('gflores', '$2b$10$xEwKpYNKKyYkGDEJpYrR/.rVw8AJbU8KzLrWjX1dTHmvOZF5C5rTG', 'Gabriel Flores', 'gflores@empresa.com', [GROUP_ID_COMPRAS], 'dark');
```

### Usuario: mcabrera (Supervisor)
```sql
INSERT INTO users (username, password, name, email, group_id, theme)
VALUES ('mcabrera', '$2b$10$xEwKpYNKKyYkGDEJpYrR/.rVw8AJbU8KzLrWjX1dTHmvOZF5C5rTG', 'Miguel Cabrera', 'mcabrera@empresa.com', [GROUP_ID_SUPERVISOR], 'dark');
```

### Usuario: eavila (Supervisor/Dirección)
```sql
INSERT INTO users (username, password, name, email, group_id, theme)
VALUES ('eavila', '$2b$10$xEwKpYNKKyYkGDEJpYrR/.rVw8AJbU8KzLrWjX1dTHmvOZF5C5rTG', 'Eduardo Avila', 'eavila@empresa.com', [GROUP_ID_SUPERVISOR], 'dark');
```

## Paso 3: Verificar que se crearon correctamente
```sql
SELECT u.user_id, u.username, u.name, g.name as grupo 
FROM users u 
LEFT JOIN groups g ON u.group_id = g.group_id 
WHERE u.username IN ('pavelino', 'gflores', 'mcabrera', 'eavila');
```

## 🔧 INSTRUCCIONES:

1. **Ejecuta el Paso 1** para ver qué `group_id` tienes para cada grupo
2. **Reemplaza** `[GROUP_ID_ADMIN]`, `[GROUP_ID_COMPRAS]`, `[GROUP_ID_SUPERVISOR]` con los números reales
3. **Ejecuta** cada INSERT uno por uno
4. **Verifica** con la query del Paso 3

## 🔑 Información Importante:

- **Contraseña para todos**: `123456`
- **Hash usado**: `$2b$10$xEwKpYNKKyYkGDEJpYrR/.rVw8AJbU8KzLrWjX1dTHmvOZF5C5rTG`
- **Tema por defecto**: `dark`

## 📋 Mapeo de Roles:

| Usuario | Grupo Sugerido | Permisos |
|---------|----------------|----------|
| pavelino | admin | Acceso completo |
| gflores | compras | Entradas y salidas |
| mcabrera | supervisor | Solo consulta |
| eavila | supervisor | Solo consulta |

## ⚠️ Si no tienes algunos grupos:

### Crear grupo admin (si no existe):
```sql
INSERT INTO groups (name) VALUES ('admin');
```

### Crear grupo compras (si no existe):
```sql
INSERT INTO groups (name) VALUES ('compras');
```

### Crear grupo supervisor (si no existe):
```sql
INSERT INTO groups (name) VALUES ('supervisor');
```

## 🎯 Después de crear los usuarios:

Podrás usar estas credenciales para probar el sistema:
- `pavelino` / `123456` (acceso completo)
- `gflores` / `123456` (entradas/salidas)
- `mcabrera` / `123456` (solo consulta)
- `eavila` / `123456` (solo consulta)
