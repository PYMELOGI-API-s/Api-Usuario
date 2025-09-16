// src/routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarToken, verificarRol } = require('../middleware/auth');

// Todas las rutas de usuarios requieren un token válido
router.use(verificarToken);

// Rutas de administración (solo para administradores)
router.get('/', verificarRol('admin'), usuarioController.obtenerUsuarios);
router.delete('/:id', verificarRol('admin'), usuarioController.eliminarUsuario);

// Rutas de usuario general
router.get('/:id', usuarioController.obtenerUsuario);
router.put('/:id', usuarioController.actualizarUsuario);

module.exports = router;
