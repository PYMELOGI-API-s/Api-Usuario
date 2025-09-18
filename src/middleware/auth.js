// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { poolPromise, sql } = require('../config/database');
require('dotenv').config();

// Middleware para verificar token JWT
const verificarToken = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado. No se proporcionó un token válido.'
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, decoded.id)
      .query('SELECT * FROM usuario WHERE id = @id');
      
    const usuario = result.recordset[0];

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido. El usuario no existe.'
      });
    }

    req.usuario = {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      email: usuario.email,
      username: usuario.username
    };
    
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'El token ha expirado.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido.'
      });
    }
    
    console.error('Error en verificación de token:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor en la autenticación.'
    });
  }
};

// Middleware opcional para verificar token (no falla si no existe)
const verificarTokenOpcional = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // Continúa sin usuario autenticado
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, decoded.id)
      .query('SELECT * FROM usuario WHERE id = @id');
      
    const usuario = result.recordset[0];

    if (usuario) {
      req.usuario = {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        email: usuario.email,
        username: usuario.username
      };
    }
    
    next();

  } catch (error) {
    // Si hay error con el token opcional, simplemente continúa
    next();
  }
};

// Middleware para validar datos de entrada
const validarRegistro = (req, res, next) => {
  const { nombre, correo, contrasena, username } = req.body;
  const errores = [];

  if (!nombre || nombre.trim().length < 2) {
    errores.push('El nombre debe tener al menos 2 caracteres');
  }

  if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    errores.push('El correo electrónico no es válido');
  }

  if (!contrasena || contrasena.length < 6) {
    errores.push('La contraseña debe tener al menos 6 caracteres');
  }

  if (!username || username.trim().length < 3) {
    errores.push('El nombre de usuario debe tener al menos 3 caracteres');
  }

  if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
    errores.push('El nombre de usuario solo puede contener letras, números y guiones bajos');
  }

  if (errores.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errores
    });
  }

  next();
};

// Middleware para validar login
const validarLogin = (req, res, next) => {
  const { correo, contrasena, username } = req.body;
  const errores = [];

  if (!contrasena) {
    errores.push('La contraseña es obligatoria');
  }

  if (!correo && !username) {
    errores.push('Se requiere correo electrónico o nombre de usuario');
  }

  if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    errores.push('El correo electrónico no es válido');
  }

  if (errores.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errores
    });
  }

  next();
};

module.exports = {
  verificarToken,
  verificarTokenOpcional,
  validarRegistro,
  validarLogin
};