// src/controllers/usuarioController.js
const Usuario = require('../models/usuario');

const usuarioController = {
  obtenerUsuarios: async (req, res) => {
    try {
      const usuarios = await Usuario.getAll();
      res.json({ success: true, data: usuarios });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
    }
  },

  obtenerUsuario: async (req, res) => {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findById(id);
      if (!usuario) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }
      res.json({ success: true, data: usuario });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al obtener usuario' });
    }
  },

  actualizarUsuario: async (req, res) => {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findById(id);

      if (!usuario) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      await Usuario.update(id, req.body);
      res.json({ success: true, message: 'Usuario actualizado exitosamente' });

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al actualizar usuario' });
    }
  },

  eliminarUsuario: async (req, res) => {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findById(id);

      if (!usuario) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      await Usuario.delete(id);
      res.json({ success: true, message: 'Usuario eliminado exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al eliminar usuario' });
    }
  }
};

module.exports = usuarioController;
