const express = require('express');
const router = express.Router();

const tipoActividadController =
  require('../controllers/tipoActividadController');

const verificarToken =
  require('../middleware/authMiddleware');

const verificarRol =
  require('../middleware/roleMiddleware');

router.get(
  '/',
  tipoActividadController.listarTiposActividad
);

// ======================================================
// CREAR TIPO DE ACTIVIDAD - ADMIN
// ======================================================

router.post(
  '/',
  verificarToken,
  verificarRol('ADMIN'),
  tipoActividadController.crearTipoActividad
);


// ======================================================
// ACTUALIZAR TIPO DE ACTIVIDAD - ADMIN
// ======================================================

router.put(
  '/:id',
  verificarToken,
  verificarRol('ADMIN'),
  tipoActividadController.actualizarTipoActividad
);
module.exports = router;