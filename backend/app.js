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

// Configuración de CORS mejorada para Render
app.use(cors({
  origin: function(origin, callback) {
    console.log('CORS Origin:', origin);
    
    // Permitir solicitudes sin origen (como curl, aplicaciones móviles, o requests internos)
    if (!origin) return callback(null, true);
    
    // Dominios permitidos
    const allowedOrigins = [
      'https://front-lxru.onrender.com',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    
    // En desarrollo, permitir todos los orígenes
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('Origen no permitido por CORS:', origin);
      callback(null, true); // Temporalmente permitir todos para debugging
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Authorization', 
    'Content-Type', 
    'Accept', 
    'Origin', 
    'X-Requested-With',
    'Access-Control-Allow-Headers',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Middleware de debugging para peticiones
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('Origin')} - User-Agent: ${req.get('User-Agent')?.substring(0, 50)}`);
  next();
});

// Middleware para manejar preflight OPTIONS
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept, Origin, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.status(204).end();
  }
  next();
});

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

// Middleware adicional para asegurar headers CORS en todas las respuestas
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.get('Origin') || 'https://front-lxru.onrender.com');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept, Origin, X-Requested-With');
  next();
});

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
