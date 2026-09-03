const express = require('express');

const router = express.Router();

const organizacionController = require('../controllers/organizacionController');

const verificarToken = require('../middleware/authMiddleware');

const verificarRol = require('../middleware/roleMiddleware');

const verificarOrganizacionVerificada =
  require('../middleware/organizacionVerificadaMiddleware');

// ======================================================
// ESTADO DE VERIFICACIÓN
// ======================================================

router.get(
  '/estado-verificacion',
  verificarToken,
  verificarRol('ORGANIZACION'),
  organizacionController.obtenerEstadoVerificacion
);


router.patch(
  '/solicitar-verificacion',
  verificarToken,
  verificarRol('ORGANIZACION'),
  organizacionController.solicitarNuevaVerificacion
);


module.exports = router;

