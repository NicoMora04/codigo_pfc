const express = require('express');

const router = express.Router();

const organizacionController = require('../controllers/organizacionController');

const verificarToken = require('../middleware/authMiddleware');

const verificarRol = require('../middleware/roleMiddleware');

const verificarOrganizacionVerificada =
  require('../middleware/organizacionVerificadaMiddleware');

const perfilPublicoController =
  require('../controllers/perfilPublicoController');

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

// ======================================================
// PERFIL PÚBLICO PROPIO
// ======================================================

router.get(
  '/mi-perfil',
  verificarToken,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  perfilPublicoController.obtenerPerfilPropio
);

module.exports = router;

