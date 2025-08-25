import express from 'express';
import cors from 'cors';
import almacenRoutes from './routes/almacenRoutes.js';
import userRoutes from './routes/userRoutes.js';
import permisosRoutes from './routes/permisosRoutes.js';
import loginRoutes from './routes/loginRoutes.js';
import ajustesRoutes from './routes/ajustesRoutes.js';
import catalogosRoutes from './routes/catalogosRoutes.js';
import seguridadRoutes from './routes/seguridadRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import pdfRoutes from './routes/pdfRoutes.js';
import solicitudesRoutes from './routes/solicitudesRoutes.js';

const app = express();

// Configuración de CORS para aceptar peticiones del frontend en Render
app.use(cors({
  origin: [
    'https://front-lxru.onrender.com', // Dominio real de frontend en Render
    'http://localhost:5173' // Para desarrollo local
  ],
  credentials: true
}));

// Parsers con límite aumentado para PDF (evitar 413)
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

app.get('/', (req, res) => {
  res.send('Backend Be-exenTY funcionando');
});

app.use('/api/almacen', almacenRoutes);
app.use('/api/user', userRoutes);
app.use('/api/permiso-modulo', permisosRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/ajustes', ajustesRoutes);
app.use('/api/catalogos', catalogosRoutes);
app.use('/api/seguridad', seguridadRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/solicitudes', solicitudesRoutes);

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error('❌ Error global capturado:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada`
  });
});

export default app;
