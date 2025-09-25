// index.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Importar configuración de base de datos
require('./src/config/database');

// Importar rutas
const authRoutes = require('./src/routes/authRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');

const app = express();
app.set('trust proxy', 1);
const port = process.env.PORT || 8080;

// --- Middlewares de Seguridad ---
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  }
});
app.use(limiter);

// --- Middleware de CORS ---
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// --- Middlewares para el Body Parsing ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- Middleware para manejar favicon ---
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No Content - evita el error de favicon
});

// --- Middleware de Logging Básico ---
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// --- Rutas de la API ---
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);

// --- Ruta Raíz ---
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Usuarios funcionando 🚀',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      usuarios: '/api/usuarios'
    }
  });
});

// --- Middleware para rutas no encontradas (404) ---
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// --- Manejador global de errores ---
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Error interno del servidor' 
  });
});

// Exportar la app para Vercel (entorno serverless)
module.exports = app;

// Iniciar el servidor solo si se ejecuta directamente (entorno local)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${port}`);
  });
}