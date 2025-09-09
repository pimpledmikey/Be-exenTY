import pool from '../db.js';

try {
  console.log('🔧 Asignando permisos de solicitudes al rol Administrador...');
  
  // Obtener los IDs de los permisos de solicitudes
  const [permisosSolicitudes] = await pool.query(`
    SELECT id, name FROM permissions WHERE module = 'solicitudes'
  `);
  
  console.log('📋 Permisos encontrados:');
  console.table(permisosSolicitudes);
  
  // Asignar todos los permisos de solicitudes al rol Administrador (role_id = 1)
  for (const permiso of permisosSolicitudes) {
    // Verificar si ya existe
    const [existing] = await pool.query(`
      SELECT id FROM role_permissions 
      WHERE role_id = 1 AND permission_id = ?
    `, [permiso.id]);
    
    if (existing.length === 0) {
      await pool.query(`
        INSERT INTO role_permissions (role_id, permission_id, can_view, can_create, can_edit, can_delete)
        VALUES (1, ?, 1, 1, 1, 1)
      `, [permiso.id]);
      
      console.log(`✅ Permiso asignado: ${permiso.name}`);
    } else {
      console.log(`⚠️ Permiso ya existe: ${permiso.name}`);
    }
  }
  
  // Verificar permisos finales del usuario mavila
  const [permisosUsuario] = await pool.query(`
    SELECT p.name, p.module, rp.can_view, rp.can_create, rp.can_edit, rp.can_delete
    FROM permissions p
    INNER JOIN role_permissions rp ON p.id = rp.permission_id
    INNER JOIN users u ON u.role_id = rp.role_id
    WHERE p.module = 'solicitudes' AND u.username = 'mavila'
  `);
  
  console.log('\\n👤 Permisos finales del usuario mavila para solicitudes:');
  console.table(permisosUsuario);
  
  console.log('\\n🎉 ¡Permisos asignados correctamente!');
  console.log('\\nAhora puedes:');
  console.log('✅ Ver solicitudes pendientes');
  console.log('✅ Crear solicitudes');
  console.log('✅ Editar y autorizar solicitudes');
  console.log('✅ Ver dashboard de autorización');
  
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
