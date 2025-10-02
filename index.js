const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const { verificarToken } = require('./src/middleware/auth');

const app = express();
const port = process.env.PORT || 3000;

// --- Configuración de Middleware Esencial ---

// Habilitar CORS para permitir peticiones desde cualquier origen
// En producción, deberías restringirlo a dominios específicos.
app.use(cors());

// Establecer cabeceras HTTP seguras
app.use(helmet());

// Limitar la tasa de peticiones para prevenir ataques de fuerza bruta
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por IP en la ventana de tiempo
  standardHeaders: true, // Devolver información del límite en las cabeceras `RateLimit-*`
  legacyHeaders: false, // Deshabilitar las cabeceras `X-RateLimit-*`
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo en 15 minutos'
  }
});
app.use(limiter);

// Middleware para parsear el cuerpo de las peticiones en formato JSON
app.use(express.json());

// --- Rutas Principales ---
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', verificarToken, usuarioRoutes);

// --- Rutas de diagnóstico y estado ---
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API en funcionamiento. ¡Bienvenido!',
    version: '1.0.0',
    documentation: 'Consulta el archivo README.md para más detalles sobre los endpoints disponibles.'
  });
});

app.get('/health', (req, res) => {
  // Puedes expandir esto para verificar la conexión a la base de datos, etc.
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
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
