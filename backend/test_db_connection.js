import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2';

// Forzar la carga del .env usando la ruta absoluta
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Crear conexión
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.PORT
});

// Probar conexión y crear grupos/usuarios de ejemplo
connection.connect((err) => {
  if (err) {
    console.error('Error de conexión:', err);
    process.exit(1);
  }
  console.log('Conexión exitosa a MySQL');

  // Insertar dos grupos si no existen
  const grupos = ['admin', 'compras'];
  grupos.forEach((grupo) => {
    connection.query(
      'INSERT IGNORE INTO groups (name) VALUES (?)',
      [grupo],
      (err) => {
        if (err) console.error('Error insertando grupo', grupo, err);
      }
    );
  });

  // Insertar dos usuarios de ejemplo
  const usuarios = [
    { username: 'mavila', password: 'mavila', group: 'admin' },
    { username: 'comprador', password: 'comprador', group: 'compras' }
  ];

  usuarios.forEach((user) => {
    connection.query(
      'SELECT group_id FROM groups WHERE name = ?',
      [user.group],
      (err, results) => {
        if (err || results.length === 0) return console.error('Error obteniendo grupo', user.group, err);
        const group_id = results[0].group_id;
        connection.query(
          'INSERT IGNORE INTO users (username, password, group_id) VALUES (?, ?, ?)',
          [user.username, user.password, group_id],
          (err) => {
            if (err) console.error('Error insertando usuario', user.username, err);
          }
        );
      }
    );
  });

  setTimeout(() => {
    console.log('Grupos y usuarios de ejemplo insertados.');
    connection.end();
  }, 2000);
});
