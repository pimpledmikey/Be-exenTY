import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'be_exen_db',
  port: process.env.DB_PORT || 3306
};

async function updatePasswords() {
  let connection;
  
  try {
    console.log('🔗 Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    
    // Generar hash para la contraseña "123456"
    const password = '123456';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    console.log('🔐 Hash generado para "123456":', hashedPassword);
    
    // Verificar qué usuarios existen
    const [existingUsers] = await connection.execute(
      'SELECT user_id, username, name FROM users WHERE username IN (?, ?, ?, ?)',
      ['pavelino', 'gflores', 'mcabrera', 'eavila']
    );
    
    console.log('\n👥 Usuarios encontrados:', existingUsers.length);
    existingUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.name || 'Sin nombre'})`);
    });
    
    // Actualizar contraseñas de usuarios existentes
    if (existingUsers.length > 0) {
      const [result] = await connection.execute(
        'UPDATE users SET password = ? WHERE username IN (?, ?, ?, ?)',
        [hashedPassword, 'pavelino', 'gflores', 'mcabrera', 'eavila']
      );
      
      console.log(`\n✅ Contraseñas actualizadas para ${result.affectedRows} usuarios`);
    }
    
    // Crear usuarios que no existen (solo si hay grupos disponibles)
    const [groups] = await connection.execute('SELECT * FROM groups ORDER BY group_id');
    console.log('\n📋 Grupos disponibles:', groups.length);
    
    if (groups.length > 0) {
      const usersToCreate = [
        { username: 'pavelino', name: 'Pavel Administrador', email: 'pavelino@empresa.com', groupName: 'admin' },
        { username: 'gflores', name: 'Gabriel Flores', email: 'gflores@empresa.com', groupName: 'compras' },
        { username: 'mcabrera', name: 'Miguel Cabrera', email: 'mcabrera@empresa.com', groupName: 'supervisor' },
        { username: 'eavila', name: 'Eduardo Avila', email: 'eavila@empresa.com', groupName: 'supervisor' }
      ];
      
      for (const user of usersToCreate) {
        // Verificar si el usuario ya existe
        const [existing] = await connection.execute(
          'SELECT user_id FROM users WHERE username = ?',
          [user.username]
        );
        
        if (existing.length === 0) {
          // Buscar el grupo correspondiente
          const [group] = await connection.execute(
            'SELECT group_id FROM groups WHERE name = ?',
            [user.groupName]
          );
          
          if (group.length > 0) {
            await connection.execute(
              'INSERT INTO users (username, password, name, email, group_id) VALUES (?, ?, ?, ?, ?)',
              [user.username, hashedPassword, user.name, user.email, group[0].group_id]
            );
            console.log(`✅ Usuario creado: ${user.username}`);
          } else {
            console.log(`⚠️  Grupo '${user.groupName}' no encontrado para ${user.username}`);
          }
        }
      }
    }
    
    // Mostrar resumen final
    const [finalUsers] = await connection.execute(
      `SELECT u.username, u.name, g.name as group_name 
       FROM users u 
       LEFT JOIN groups g ON u.group_id = g.group_id 
       ORDER BY u.username`
    );
    
    console.log('\n📊 Resumen final de usuarios:');
    console.log('===============================');
    finalUsers.forEach(user => {
      console.log(`👤 ${user.username} - ${user.name || 'Sin nombre'} (${user.group_name || 'Sin grupo'})`);
    });
    
    console.log('\n🎉 ¡Proceso completado exitosamente!');
    console.log('💡 Todos los usuarios tienen la contraseña: 123456');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Verifica que la base de datos esté ejecutándose y la configuración sea correcta');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 Conexión cerrada');
    }
  }
}

// Función para mostrar la configuración (sin contraseñas)
function showConfig() {
  console.log('🔧 Configuración de base de datos:');
  console.log(`   Host: ${dbConfig.host}`);
  console.log(`   Puerto: ${dbConfig.port}`);
  console.log(`   Usuario: ${dbConfig.user}`);
  console.log(`   Base de datos: ${dbConfig.database}`);
  console.log('   Contraseña: [OCULTA]\n');
}

// Ejecutar el script
console.log('🚀 Iniciando actualización de contraseñas...\n');
showConfig();
updatePasswords();
