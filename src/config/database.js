
// src/config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración del pool de conexiones para MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10, 
  queueLimit: 0,
  // --- Agregado para compatibilidad con proveedores en la nube ---
  ssl: { 
    // No rechazar conexiones no autorizadas (necesario para muchos servicios en la nube)
    rejectUnauthorized: false 
  }
});

// Función para verificar la conexión
async function checkConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('🚀 Conectado a MySQL');
    connection.release(); // Liberar la conexión inmediatamente después de verificar
  } catch (err) {
    // Este error es el que probablemente verás en los logs de Vercel si algo falla
    console.error('❌ Error de conexión a la base de datos: ', err);
    // En un entorno serverless, es mejor lanzar el error para que falle rápido
    throw err;
  }
}

// Verificar la conexión al iniciar la aplicación
checkConnection();

module.exports = pool;
