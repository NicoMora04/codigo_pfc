const express = require('express');
const router = express.Router();

const tipoActividadController =
  require('../controllers/tipoActividadController');

const verificarToken =
  require('../middleware/authMiddleware');


router.get(
  '/',
  verificarToken,
  tipoActividadController.listarTiposActividad
);


module.exports = router;