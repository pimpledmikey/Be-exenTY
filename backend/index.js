import express from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Conexión a MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend Be-exenTY funcionando');
});

// Ejemplo de endpoint que consulta la base de datos
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() as now');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor backend escuchando en puerto ${port}`);
});
