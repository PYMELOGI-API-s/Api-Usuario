console.log('Cargando src/app.js...'); // Log de diagnóstico
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Middleware de seguridad
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  }
});
app.use(limiter);

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
  console.log(`Petición recibida en Express: ${req.method} ${req.path}`); // Log de diagnóstico
  next();
});

// Rutas (sin el prefijo /api, ya que lo maneja Netlify)
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

app.use('/auth', authRoutes);
app.use('/usuarios', usuarioRoutes);

// Ruta raíz de la API
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Usuarios funcionando correctamente desde Netlify',
    version: process.env.API_VERSION || '1.0.0',
  });
});

// Middleware para rutas no encontradas dentro de la API
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada en la API: ${req.method} ${req.originalUrl}`,
  });
});

// Middleware para manejo global de errores
app.use((err, req, res, next) => {
  console.error('--- ERROR GLOBAL CAPTURADO ---', err); // Log de diagnóstico
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor.',
  });
});

module.exports = app;
