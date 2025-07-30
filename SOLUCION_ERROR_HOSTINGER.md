# 🔧 SOLUCIÓN AL ERROR DE HOSTINGER

## ❌ **Error que tienes:**
```
#1054 - No se reconoce la columna 'X' en VALUES
```

## 💡 **Causa del problema:**
Pusiste la letra "X" literal en lugar del número del `group_id`.

## ✅ **SOLUCIÓN PASO A PASO:**

### **Paso 1:** Ejecuta esta query primero para ver tus grupos
```sql
SELECT group_id, name FROM groups;
```

### **Ejemplo de resultado:**
```
group_id | name
---------|----------
   1     | admin
   2     | compras  
   3     | supervisor
```

### **Paso 2:** Usa los números reales en las queries

#### ✅ **CORRECTO** (usando números reales):
```sql
-- Ejemplo si admin tiene group_id = 1
INSERT INTO users (username, password, name, email, group_id, theme)
VALUES ('pavelino', '$2b$10$aN75IvPClOr7F5U3Er9XFeRNQc60bcRLqDay7DZ.WiQOWe2oX05q2', 'Pavel Administrador', 'pavelino@empresa.com', 1, 'dark');

-- Ejemplo si compras tiene group_id = 2
INSERT INTO users (username, password, name, email, group_id, theme)
VALUES ('gflores', '$2b$10$aN75IvPClOr7F5U3Er9XFeRNQc60bcRLqDay7DZ.WiQOWe2oX05q2', 'Gabriel Flores', 'gflores@empresa.com', 2, 'dark');

-- Ejemplo si supervisor tiene group_id = 3
INSERT INTO users (username, password, name, email, group_id, theme)
VALUES ('mcabrera', '$2b$10$aN75IvPClOr7F5U3Er9XFeRNQc60bcRLqDay7DZ.WiQOWe2oX05q2', 'Miguel Cabrera', 'mcabrera@empresa.com', 3, 'dark');

INSERT INTO users (username, password, name, email, group_id, theme)
VALUES ('eavila', '$2b$10$aN75IvPClOr7F5U3Er9XFeRNQc60bcRLqDay7DZ.WiQOWe2oX05q2', 'Eduardo Avila', 'eavila@empresa.com', 3, 'dark');
```

## 🎯 **PASOS EXACTOS:**

1. **Ejecuta:** `SELECT group_id, name FROM groups;`
2. **Anota** los números de group_id 
3. **Reemplaza:**
   - X = número del group_id de "admin"
   - Y = número del group_id de "compras" 
   - Z = número del group_id de "supervisor"
4. **Ejecuta** las queries con los números reales

## 📋 **Ejemplo completo si tus group_id son 1, 2, 3:**

```sql
-- Ver grupos primero
SELECT group_id, name FROM groups;

-- Crear usuarios (ajustar números según tu resultado)
INSERT INTO users (username, password, name, email, group_id, theme)
VALUES ('pavelino', '$2b$10$aN75IvPClOr7F5U3Er9XFeRNQc60bcRLqDay7DZ.WiQOWe2oX05q2', 'Pavel Administrador', 'pavelino@empresa.com', 1, 'dark');

INSERT INTO users (username, password, name, email, group_id, theme)
VALUES ('gflores', '$2b$10$aN75IvPClOr7F5U3Er9XFeRNQc60bcRLqDay7DZ.WiQOWe2oX05q2', 'Gabriel Flores', 'gflores@empresa.com', 2, 'dark');

INSERT INTO users (username, password, name, email, group_id, theme)
VALUES ('mcabrera', '$2b$10$aN75IvPClOr7F5U3Er9XFeRNQc60bcRLqDay7DZ.WiQOWe2oX05q2', 'Miguel Cabrera', 'mcabrera@empresa.com', 3, 'dark');

INSERT INTO users (username, password, name, email, group_id, theme)
VALUES ('eavila', '$2b$10$aN75IvPClOr7F5U3Er9XFeRNQc60bcRLqDay7DZ.WiQOWe2oX05q2', 'Eduardo Avila', 'eavila@empresa.com', 3, 'dark');

-- Verificar que se crearon
SELECT u.user_id, u.username, u.name, g.name as grupo 
FROM users u 
LEFT JOIN groups g ON u.group_id = g.group_id 
WHERE u.username IN ('pavelino', 'gflores', 'mcabrera', 'eavila');
```

¡El problema es solo cambiar las letras por números! 🚀
