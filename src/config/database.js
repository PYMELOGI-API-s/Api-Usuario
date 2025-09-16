// src/config/database.js
const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false, // Se cambió a false porque el proveedor no es Azure
    trustServerCertificate: true // Se mantiene para compatibilidad
  }
};

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('🚀 Conectado a SQL Server');
    return pool;
  })
  .catch(err => console.error('❌ Error de conexión a la base de datos: ', err));

module.exports = {
  sql,
  poolPromise
};
