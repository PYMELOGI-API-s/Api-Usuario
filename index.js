const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const dbConfig = require('./src/config/dbConfig');
const authRoutes = require('./src/routes/authRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');

const app = express();

const port = process.env.PORT || 8080;

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

// Middleware para conectar a la base de datos
app.use(async (req, res, next) => {
  try {
    if (!req.pool) {
      const pool = await sql.connect(dbConfig);
      req.pool = pool;
    }
    next();
  } catch (err) {
    console.error('Error de conexión a la base de datos:', err);
    res.status(500).send({ success: false, message: 'Error de conexión a la base de datos' });
  }
});

// Middleware para logging básico
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.send('API de Usuarios funcionando');
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).send({ success: false, message: 'Ruta no encontrada' });
});

// Middleware para manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).send({ success: false, message: 'Error interno del servidor' });
});

app.listen(port, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${port}`);
});
