// functions/api.js
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Middleware de seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP cada 15 minutos
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  }
});
app.use(limiter);


// Rutas
const authRoutes = require('../../src/routes/authRoutes');
const usuarioRoutes = require('../../src/routes/usuarioRoutes');
const apiRouter = express.Router();

apiRouter.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Usuarios funcionando correctamente en Netlify',
    version: process.env.API_VERSION || '1.0.0',
  });
});
apiRouter.use('/auth', authRoutes);
apiRouter.use('/usuarios', usuarioRoutes);

app.use('/', apiRouter); // Mount the router

// Middleware para rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// Middleware para manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor.',
  });
});


module.exports.handler = serverless(app);