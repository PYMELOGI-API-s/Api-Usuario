// src/controllers/authController.js
const Usuario = require('../models/usuario');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const generarTokens = (usuario) => {
  const accessToken = jwt.sign(
    { id: usuario.id, username: usuario.username },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  const refreshToken = jwt.sign(
    { id: usuario.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

const authController = {
  registro: async (req, res) => {
    try {
      const { nombre, correo, contrasena, username } = req.body;

      // Validaciones básicas
      if (!nombre || !correo || !contrasena || !username) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son obligatorios: nombre, correo, contrasena, username'
        });
      }

      // Verificar si el correo ya existe
      const usuarioExistentePorEmail = await Usuario.findByEmail(correo);
      if (usuarioExistentePorEmail) {
        return res.status(400).json({
          success: false,
          message: 'El correo electrónico ya está registrado'
        });
      }

      // Verificar si el username ya existe
      const usuarioExistentePorUsername = await Usuario.findByUsername(username);
      if (usuarioExistentePorUsername) {
        return res.status(400).json({
          success: false,
          message: 'El nombre de usuario ya está en uso'
        });
      }

      const nuevoUsuario = await Usuario.create({ nombre, correo, contrasena, username });
      const tokens = generarTokens(nuevoUsuario);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          usuario: nuevoUsuario.toPublicJSON(),
          tokens
        }
      });

    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al registrar usuario'
      });
    }
  },

  login: async (req, res) => {
    try {
      const { correo, contrasena, username } = req.body;

      if (!contrasena || (!correo && !username)) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere contraseña y correo o username'
        });
      }

      let usuario;
      if (correo) {
        usuario = await Usuario.findByEmail(correo);
      } else {
        usuario = await Usuario.findByUsername(username);
      }

      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      const passwordCorrecta = await usuario.comparePassword(contrasena);
      if (!passwordCorrecta) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      const tokens = generarTokens(usuario);

      res.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          usuario: usuario.toPublicJSON(),
          tokens
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al iniciar sesión'
      });
    }
  },

  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Se requiere refresh token'
        });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const usuario = await Usuario.findById(decoded.id);

      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
      }

      const tokens = generarTokens(usuario);

      res.json({
        success: true,
        message: 'Token renovado exitosamente',
        data: { tokens }
      });

    } catch (error) {
      console.error('Error en refresh token:', error);
      res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
  }
};

module.exports = authController;
