// functions/api.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const serverless = require('serverless-http');

const app = express();

// Middleware de seguridad
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP cada 15 minutos
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  }
});

app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Middlewares para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para logging básico
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
const authRoutes = require('../src/routes/authRoutes');
const usuarioRoutes = require('../src/routes/usuarioRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Usuarios funcionando correctamente',
    version: process.env.API_VERSION || '1.0.0',
    database: 'SQL Server',
    endpoints: {
      auth: {
        registro: 'POST /api/auth/registro',
        login: 'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh'
      },
      usuarios: {
        perfil: 'GET /api/usuarios/perfil',
        todos: 'GET /api/usuarios',
        obtener: 'GET /api/usuarios/:id',
        actualizar: 'PUT /api/usuarios/:id',
        eliminar: 'DELETE /api/usuarios/:id'
      }
    }
  });
});

// Ruta de healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'POST /api/auth/registro',
      'POST /api/auth/login',
      'POST /api/auth/refresh',
      'GET /api/usuarios/perfil',
      'GET /api/usuarios',
      'GET /api/usuarios/:id',
      'PUT /api/usuarios/:id',
      'DELETE /api/usuarios/:id'
    ]
  });
});

// Middleware para manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  
  // Error de validación JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido en el cuerpo de la solicitud.'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Error interno del servidor.',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

module.exports.handler = serverless(app);
module.exports.app = app;
