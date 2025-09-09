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
import debugRoutes from './routes/debugRoutes.js';

const app = express();

// Configuración de CORS para aceptar peticiones del frontend en Render
app.use(cors({
  origin: function(origin, callback) {
    // Permitir solicitudes sin origen (como curl o aplicaciones móviles)
    if (!origin) return callback(null, true);
    
    // Dominios permitidos
    const allowedOrigins = [
      'https://front-lxru.onrender.com',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ];
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Origen no permitido por política CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type']
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
app.use('/api/auth', loginRoutes); // Alias para compatibilidad
app.use('/api/ajustes', ajustesRoutes);
app.use('/api/catalogos', catalogosRoutes);
app.use('/api/seguridad', seguridadRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/debug', debugRoutes); // Rutas temporales para debug

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
