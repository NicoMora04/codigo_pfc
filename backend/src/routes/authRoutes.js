const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Mapeamos los métodos HTTP POST hacia las funciones del controlador
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;