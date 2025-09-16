// src/controllers/usuarioController.js
const Usuario = require('../models/usuario');

const usuarioController = {
  obtenerUsuarios: async (req, res) => {
    try {
      const usuarios = await Usuario.getAll();
      const usuariosPublicos = usuarios.map(u => u.toPublicJSON());
      
      res.json({
        success: true,
        message: 'Usuarios obtenidos exitosamente',
        data: usuariosPublicos,
        total: usuariosPublicos.length
      });
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener usuarios'
      });
    }
  },

  obtenerUsuario: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        });
      }

      const usuario = await Usuario.findById(parseInt(id));
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Usuario obtenido exitosamente',
        data: usuario.toPublicJSON()
      });
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener usuario'
      });
    }
  },

  actualizarUsuario: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        });
      }

      const usuario = await Usuario.findById(parseInt(id));
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Validar que el usuario solo pueda actualizar su propio perfil
      // o ser un administrador (implementar lógica según necesidades)
      if (req.usuario && req.usuario.id !== parseInt(id)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar este usuario'
        });
      }

      // Verificar username único si se está actualizando
      if (updates.username && updates.username !== usuario.username) {
        const usuarioExistente = await Usuario.findByUsername(updates.username);
        if (usuarioExistente) {
          return res.status(400).json({
            success: false,
            message: 'El nombre de usuario ya está en uso'
          });
        }
      }

      // Verificar correo único si se está actualizando
      if (updates.correo && updates.correo !== usuario.correo) {
        const usuarioExistente = await Usuario.findByEmail(updates.correo);
        if (usuarioExistente) {
          return res.status(400).json({
            success: false,
            message: 'El correo electrónico ya está en uso'
          });
        }
      }

      await Usuario.update(parseInt(id), updates);
      
      // Obtener usuario actualizado
      const usuarioActualizado = await Usuario.findById(parseInt(id));

      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: usuarioActualizado.toPublicJSON()
      });

    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al actualizar usuario'
      });
    }
  },

  eliminarUsuario: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        });
      }

      const usuario = await Usuario.findById(parseInt(id));
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      await Usuario.delete(parseInt(id));

      res.json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al eliminar usuario'
      });
    }
  },

  obtenerPerfil: async (req, res) => {
    try {
      // El usuario viene del middleware de autenticación
      const usuario = await Usuario.findById(req.usuario.id);
      
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: usuario.toPublicJSON()
      });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener perfil'
      });
    }
  }
};

module.exports = usuarioController;