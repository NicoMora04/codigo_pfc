const express = require('express');
const router = express.Router();

const tipoActividadController =
  require('../controllers/tipoActividadController');

const perfilPublicoController =
  require('../controllers/perfilPublicoController');


// ======================================================
// TIPOS DE ACTIVIDAD
// ======================================================

router.get(
  '/tipos-actividad',
  tipoActividadController.listarTiposActividad
);


// ======================================================
// DIRECTORIO PÚBLICO DE ORGANIZACIONES
// ======================================================

router.get(
  '/organizaciones',
  perfilPublicoController.listarOrganizacionesPublicas
);


module.exports = router;