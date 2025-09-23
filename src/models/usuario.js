
// src/models/usuario.js
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const Usuario = {
  // Crear un nuevo usuario
  create: async ({ nombre, correo, contrasena, username }) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);
    
    const sql = 'INSERT INTO Usuarios (nombre, correo, contrasena, username) VALUES (?, ?, ?, ?)';
    
    const [result] = await pool.execute(sql, [nombre, correo, hashedPassword, username]);
    
    // Devolvemos el usuario recién creado, excluyendo la contraseña
    return { id: result.insertId, nombre, correo, username };
  },

  // Encontrar un usuario por su correo electrónico
  findByEmail: async (correo) => {
    const sql = 'SELECT * FROM Usuarios WHERE correo = ?';
    const [rows] = await pool.execute(sql, [correo]);
    if (rows.length === 0) {
      return null;
    }
    // Creamos una instancia que incluye el método para comparar contraseñas
    return { ...rows[0], comparePassword: async function(candidatePassword) { return bcrypt.compare(candidatePassword, this.contrasena); } };
  },

  // Encontrar un usuario por su nombre de usuario
  findByUsername: async (username) => {
    const sql = 'SELECT * FROM Usuarios WHERE username = ?';
    const [rows] = await pool.execute(sql, [username]);
    if (rows.length === 0) {
      return null;
    }
    return { ...rows[0], comparePassword: async function(candidatePassword) { return bcrypt.compare(candidatePassword, this.contrasena); } };
  },

  // Encontrar un usuario por su ID
  findById: async (id) => {
    const sql = 'SELECT * FROM Usuarios WHERE id = ?';
    const [rows] = await pool.execute(sql, [id]);
    if (rows.length === 0) {
      return null;
    }
    // Devolvemos solo la información pública
    const { contrasena, ...userPublic } = rows[0];
    return userPublic;
  }
};

module.exports = Usuario;
