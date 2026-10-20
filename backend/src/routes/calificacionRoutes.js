const express = require('express');
const router = express.Router();

const calificacionController =
  require('../controllers/calificacionController');

const authMiddleware =
  require('../middleware/authMiddleware');

const verificarRol =
  require('../middleware/roleMiddleware');

const verificarOrganizacionVerificada =
  require('../middleware/organizacionVerificadaMiddleware');


// ======================================================
// CALIFICAR VOLUNTARIO POR ORGANIZACIÓN
// ACTIVIDAD 3.2.1
// ======================================================

router.post(
  '/voluntario/:idInscripcion',

  authMiddleware,

  verificarRol('ORGANIZACION'),

  verificarOrganizacionVerificada,

  calificacionController.calificarVoluntario
);

// ======================================================
// CONSULTAR MI REPUTACIÓN COMO VOLUNTARIO
// ACTIVIDAD 3.2.1
// ======================================================

router.get(
  '/mi-reputacion',

  authMiddleware,

  verificarRol('VOLUNTARIO'),

  calificacionController.obtenerMiReputacionVoluntario
);


// ======================================================
// CALIFICAR ORGANIZACIÓN COMO VOLUNTARIO
// ACTIVIDAD 3.2.2
// ======================================================

router.post(
  '/organizacion/:idInscripcion',

  authMiddleware,

  verificarRol('VOLUNTARIO'),

  calificacionController.calificarOrganizacion
);

// ======================================================
// CONSULTAR MI REPUTACIÓN COMO ORGANIZACIÓN
// ACTIVIDAD 3.2.2
// ======================================================

router.get(
  '/mi-reputacion-organizacion',

  authMiddleware,

  verificarRol('ORGANIZACION'),

  calificacionController.obtenerMiReputacionOrganizacion
);
module.exports = router;