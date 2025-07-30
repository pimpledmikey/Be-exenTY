import bcrypt from 'bcrypt';

// Script para generar contraseñas hasheadas y queries SQL para Hostinger
async function generateUserQueries() {
  const password = '123456';
  const saltRounds = 10;
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('🔐 Contraseña hasheada para "123456":');
    console.log(hash);
    console.log('');
    
    console.log('📋 QUERIES PARA TU BASE DE DATOS EN HOSTINGER:');
    console.log('=============================================');
    console.log('');
    
    // Primero, verificar qué grupos tienes disponibles
    console.log('-- 1. PRIMERO ejecuta esta query para ver tus grupos disponibles:');
    console.log('SELECT group_id, name FROM groups;');
    console.log('');
    
    console.log('-- 2. LUEGO ejecuta estas queries para crear los usuarios:');
    console.log('-- (Ajusta los group_id según lo que veas en el paso 1)');
    console.log('');
    
    // Usuarios a crear
    const users = [
      { username: 'pavelino', name: 'Pavel Administrador', email: 'pavelino@empresa.com', group: 'admin', group_id_comment: '-- Cambiar X por el group_id de admin' },
      { username: 'gflores', name: 'Gabriel Flores', email: 'gflores@empresa.com', group: 'compras', group_id_comment: '-- Cambiar Y por el group_id de compras' },
      { username: 'mcabrera', name: 'Miguel Cabrera', email: 'mcabrera@empresa.com', group: 'supervisor', group_id_comment: '-- Cambiar Z por el group_id de supervisor' },
      { username: 'eavila', name: 'Eduardo Avila', email: 'eavila@empresa.com', group: 'supervisor', group_id_comment: '-- Cambiar Z por el group_id de supervisor' }
    ];
    
    users.forEach((user, index) => {
      const groupVariable = index === 0 ? 'X' : index === 1 ? 'Y' : 'Z';
      console.log(`-- Usuario: ${user.username} (${user.group})`);
      console.log(`INSERT INTO users (username, password, name, email, group_id, theme)`);
      console.log(`VALUES ('${user.username}', '${hash}', '${user.name}', '${user.email}', ${groupVariable}, 'dark');`);
      console.log(`${user.group_id_comment}`);
      console.log('');
    });
    
    console.log('-- 3. VERIFICAR que los usuarios se crearon correctamente:');
    console.log('SELECT u.user_id, u.username, u.name, g.name as grupo FROM users u LEFT JOIN groups g ON u.group_id = g.group_id WHERE u.username IN (\'pavelino\', \'gflores\', \'mcabrera\', \'eavila\');');
    console.log('');
    
    console.log('🎯 INSTRUCCIONES:');
    console.log('1. Copia y ejecuta la query del paso 1 para ver tus grupos');
    console.log('2. Reemplaza X, Y, Z por los group_id correctos');
    console.log('3. Ejecuta las queries INSERT una por una');
    console.log('4. Verifica con la query del paso 3');
    console.log('');
    console.log('🔑 Contraseña para todos los usuarios: 123456');
    
  } catch (error) {
    console.error('❌ Error al hashear password:', error);
  }
}

generateUserQueries();
