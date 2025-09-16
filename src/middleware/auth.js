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
      message: 'Acceso denegado. No se proporcionó un token.'
    });
  }

  const token = authHeader.substring(7, authHeader.length);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, decoded.id)
      .query('SELECT * FROM Usuarios WHERE UsuarioID = @id');
      
    const usuario = result.recordset[0];

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido. El usuario no existe.'
      });
    }

    if (usuario.estado !== 'activo') {
      return res.status(401).json({
        success: false,
        message: 'La cuenta de usuario no está activa.'
      });
    }

    req.usuario = usuario; // Adjuntar usuario al request
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'El token ha expirado.' });
    }
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Token inválido.' });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};

// Middleware para verificar roles (ej. 'admin', 'moderador')
const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario || !req.usuario.rol) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. No se pudo verificar el rol del usuario.'
      });
    }

    const tienePermiso = rolesPermitidos.includes(req.usuario.rol);
    if (!tienePermiso) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(' o ')}.`
      });
    }
    next();
  };
};

module.exports = {
  verificarToken,
  verificarRol
};
