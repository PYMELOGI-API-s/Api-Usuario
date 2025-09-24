
// src/config/database.js
const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true', // Use true for Azure SQL Database, adjust as needed
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true' // Use true for local dev, not for production
  }
};

const pool = new sql.ConnectionPool(dbConfig);
const poolConnect = pool.connect();

pool.on('error', err => {
  console.error('Error en el Pool de Conexiones de SQL Server:', err);
});

async function checkConnection() {
  try {
    await poolConnect;
    console.log('🚀 Conectado a SQL Server');
  } catch (err) {
    console.error('❌ Error de conexión a la base de datos SQL Server:', err);
    // En un entorno de producción, podrías querer manejar esto de forma más robusta.
    // Por ahora, simplemente terminaremos el proceso si no se puede conectar al inicio.
    process.exit(1);
  }
}

checkConnection();

module.exports = {
  pool,
  sql
};
