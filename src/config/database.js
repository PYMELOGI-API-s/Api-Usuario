// src/config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración del pool de conexiones para MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST, // Cambiado de DB_SERVER a DB_HOST
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Función para verificar la conexión
async function checkConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('🚀 Conectado a MySQL');
    connection.release();
  } catch (err) {
    console.error('❌ Error de conexión a la base de datos: ', err);
  }
}

// Verificar la conexión al iniciar la aplicación
checkConnection();

module.exports = pool;
