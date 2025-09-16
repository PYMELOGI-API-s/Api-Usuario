// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validarRegistro, validarLogin } = require('../middleware/auth');

// Rutas públicas de autenticación
router.post('/registro', validarRegistro, authController.registro);
router.post('/login', validarLogin, authController.login);
router.post('/refresh', authController.refreshToken);

module.exports = router;