import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import pool from './db.js';

const port = process.env.PORT || 3001;

// Función para probar la conexión a la base de datos al inicio
async function testDatabaseConnection() {
  try {
    console.log('🔄 Probando conexión a la base de datos...');
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    console.log('✅ Conexión a la base de datos exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a la base de datos:', error.message);
    return false;
  }
}

// Iniciar servidor
async function startServer() {
  try {
    // Probar conexión a DB
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      console.error('🚨 No se puede iniciar el servidor sin conexión a la base de datos');
      process.exit(1);
    }

    // Iniciar servidor
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Servidor backend iniciado exitosamente`);
      console.log(`📍 Puerto: ${port}`);
      console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Base de datos: ${process.env.DB_NAME || 'no configurada'}`);
    });

    // Manejo de errores del servidor
    server.on('error', (error) => {
      console.error('❌ Error del servidor:', error);
      process.exit(1);
    });

    // Manejo de cierre graceful
    process.on('SIGTERM', () => {
      console.log('🔄 Recibida señal SIGTERM, cerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor cerrado exitosamente');
        pool.end();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('🚨 Error fatal al iniciar servidor:', error);
    process.exit(1);
  }
}

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('🚨 Excepción no capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Promesa rechazada no manejada:', reason);
  process.exit(1);
});

startServer();
