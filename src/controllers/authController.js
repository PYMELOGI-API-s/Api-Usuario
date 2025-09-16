// src/controllers/authController.js
const Usuario = require('../models/usuario');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const generarTokens = (usuario) => {
  const accessToken = jwt.sign(
    { id: usuario.UsuarioID, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: usuario.UsuarioID },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

const authController = {
  registro: async (req, res) => {
    try {
      const { email } = req.body;

      const usuarioExistente = await Usuario.findByEmail(email);
      if (usuarioExistente) {
        return res.status(400).json({ success: false, message: 'El correo electrónico ya está registrado' });
      }

      const nuevoUsuario = await Usuario.create(req.body);
      const tokens = generarTokens(nuevoUsuario);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          usuario: {
            id: nuevoUsuario.UsuarioID,
            nombre: nuevoUsuario.nombre,
            apellido: nuevoUsuario.apellido,
            email: nuevoUsuario.email,
            rol: nuevoUsuario.rol
          },
          tokens
        }
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al registrar usuario' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const usuario = await Usuario.findByEmail(email);
      if (!usuario) {
        return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
      }

      const passwordCorrecta = await usuario.comparePassword(password);
      if (!passwordCorrecta) {
        return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
      }

      const tokens = generarTokens(usuario);

      res.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          usuario: {
            id: usuario.UsuarioID,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
          },
          tokens
        }
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al iniciar sesión' });
    }
  }
};

module.exports = authController;
