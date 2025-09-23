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

// ✅ Conexión global a la base de datos (reutilizable en Vercel)
let poolPromise;
async function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(dbConfig)
      .then(pool => {
        console.log('✅ Conectado a SQL Server');
        return pool;
      })
      .catch(err => {
        console.error('❌ Error de conexión a la base de datos:', err);
        poolPromise = null; // reset para reintento en la próxima request
        throw err;
      });
  }
  return poolPromise;
}

// Middleware para asignar pool
app.use(async (req, res, next) => {
  try {
    req.pool = await getPool();
    next();
  } catch (err) {
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
  res.send('API de Usuarios funcionando 🚀');
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

// ✅ Exportar app para Vercel (serverless)
module.exports = app;

// ✅ Solo iniciar servidor en local
if (require.main === module) {
  app.listen(port, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${port}`);
  });
}
