
// index.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar el pool de MySQL. Esto también inicia la conexión.
require('./src/config/database');

const authRoutes = require('./src/routes/authRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes'); // Asumiendo que aún lo necesitas

const app = express();
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
  origin: process.env.CORS_ORIGIN || '*', // Ajusta esto para producción
  credentials: true
}));

// --- Middlewares para el Body Parsing ---
// Esto reemplaza a bodyParser.json()
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
  res.send('API de Usuarios funcionando 🚀');
});

// --- Middlewares de Manejo de Errores ---
// Para rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).send({ success: false, message: 'Ruta no encontrada' });
});

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).send({ success: false, message: 'Error interno del servidor' });
});

// Exportar la app para Vercel (entorno serverless)
module.exports = app;

// Iniciar el servidor solo si se ejecuta directamente (entorno local)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${port}`);
  });
}
