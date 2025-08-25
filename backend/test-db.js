import dotenv from 'dotenv';
dotenv.config();
import pool from './db.js';

async function testDatabaseConnection() {
  try {
    console.log('🔄 Probando conexión a la base de datos...');
    console.log('📍 Host:', process.env.DB_HOST);
    console.log('📍 Database:', process.env.DB_NAME);
    console.log('📍 User:', process.env.DB_USER);
    console.log('📍 Port:', process.env.DB_PORT || 3306);
    
    const connection = await pool.getConnection();
    console.log('✅ Conexión exitosa a la base de datos');
    
    // Test query
    const [result] = await connection.query('SELECT 1 as test');
    console.log('✅ Query de prueba exitosa:', result[0]);
    
    // Verificar tablas críticas
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME IN ('users', 'articles', 'solicitudes', 'inventory_exits')
    `, [process.env.DB_NAME]);
    
    console.log('📋 Tablas encontradas:', tables.map(t => t.TABLE_NAME));
    
    connection.release();
    console.log('🎉 Test de base de datos completado exitosamente');
    
    // Cerrar pool para terminar el proceso
    await pool.end();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error de conexión a la base de datos:', error);
    console.error('📊 Detalles del error:', {
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    process.exit(1);
  }
}

testDatabaseConnection();
