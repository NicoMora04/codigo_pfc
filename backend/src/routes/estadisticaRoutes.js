const express =
  require('express');

const estadisticaController =
  require('../controllers/estadisticaController');

const verificarToken =
  require('../middleware/authMiddleware');

const verificarRol =
  require('../middleware/roleMiddleware');

const verificarOrganizacionVerificada =
  require('../middleware/organizacionVerificadaMiddleware');


const router =
  express.Router();


// ======================================================
// ESTADÍSTICAS PROPIAS DE LA ORGANIZACIÓN
// GET /api/estadisticas/organizacion
// ACTIVIDAD 3.4.1
// ======================================================

router.get(
  '/organizacion',

  verificarToken,

  verificarRol(
    'ORGANIZACION'
  ),

  verificarOrganizacionVerificada,

  estadisticaController
    .obtenerEstadisticasOrganizacion
);


module.exports =
  router;