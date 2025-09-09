import pool from '../db.js';

try {
  console.log('🔍 Verificando permisos para módulo solicitudes...');
  
  const [permisos] = await pool.query('SELECT * FROM permissions WHERE module = "solicitudes"');
  console.log('📋 Permisos existentes para solicitudes:');
  console.table(permisos);
  
  if (permisos.length === 0) {
    console.log('⚠️ No hay permisos para solicitudes. Creando...');
    await pool.query(`
      INSERT INTO permissions (name, description, module) VALUES
      ('ver_solicitudes', 'Ver solicitudes', 'solicitudes'),
      ('crear_solicitudes', 'Crear solicitudes', 'solicitudes'),
      ('editar_solicitudes', 'Editar solicitudes', 'solicitudes'),
      ('autorizar_solicitudes', 'Autorizar solicitudes', 'solicitudes')
    `);
    console.log('✅ Permisos creados para módulo solicitudes');
  }
  
  // Verificar permisos de usuario admin
  const [userPermisos] = await pool.query(`
    SELECT p.name, p.description, rp.can_view, rp.can_create, rp.can_edit, rp.can_delete
    FROM permissions p
    LEFT JOIN role_permissions rp ON p.id = rp.permission_id
    LEFT JOIN users u ON u.role_id = rp.role_id
    WHERE p.module = 'solicitudes' AND u.username = 'mavila'
  `);
  
  console.log('👤 Permisos del usuario mavila para solicitudes:');
  console.table(userPermisos);
  
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
