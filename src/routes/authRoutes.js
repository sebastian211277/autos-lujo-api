const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta para Registrarse: POST /api/auth/register
router.post('/register', authController.register);

// Ruta para Login: POST /api/auth/login
router.post('/login', authController.login); // <--- ¡Asegúrate de tener esta línea!

module.exports = router;