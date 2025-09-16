// src/routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarToken } = require('../middleware/auth');

// Rutas que requieren autenticación
router.use(verificarToken);

// Ruta para obtener el perfil del usuario autenticado
router.get('/perfil', usuarioController.obtenerPerfil);

// Rutas de administración de usuarios
router.get('/', usuarioController.obtenerUsuarios);
router.get('/:id', usuarioController.obtenerUsuario);
router.put('/:id', usuarioController.actualizarUsuario);
router.delete('/:id', usuarioController.eliminarUsuario);

module.exports = router;