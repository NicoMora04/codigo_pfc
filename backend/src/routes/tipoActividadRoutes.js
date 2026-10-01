const express = require('express');
const router = express.Router();

const tipoActividadController =
  require('../controllers/tipoActividadController');



router.get(
  '/',
  tipoActividadController.listarTiposActividad
);


module.exports = router;