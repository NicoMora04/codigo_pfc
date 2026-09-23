const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verificarToken = require('../middleware/authMiddleware');
const verificarRol = require('../middleware/roleMiddleware');

// Mapeamos los métodos HTTP POST hacia las funciones del controlador
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post(
  '/reset-password',
  authController.resetPassword
);

router.get(
  '/perfil-protegido',
  verificarToken,
  (req, res) => {
    res.json({
      message: 'Acceso autorizado',
      usuario: req.user
    });
  }
);

router.get(
  '/mi-organizacion',
  verificarToken,
  verificarRol('ORGANIZACION'),
  authController.obtenerMiOrganizacion
);


module.exports = router;