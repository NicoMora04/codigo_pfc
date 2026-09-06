const express = require('express');
const router = express.Router();

const ubicacionController =
  require('../controllers/ubicacionController');

const verificarToken =
  require('../middleware/authMiddleware');

const verificarRol =
  require('../middleware/roleMiddleware');

const verificarOrganizacionVerificada =
  require('../middleware/organizacionVerificadaMiddleware');


router.post(
  '/',
  verificarToken,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  ubicacionController.obtenerOCrearUbicacion
);

router.get(
  '/buscar',
  verificarToken,
  ubicacionController.buscarDirecciones
);

module.exports = router;