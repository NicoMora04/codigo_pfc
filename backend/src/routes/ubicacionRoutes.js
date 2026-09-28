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


const verificarOrganizacionSiCorresponde =
  (req, res, next) => {

    if (
      req.user?.rol !== 'ORGANIZACION'
    ) {

      return next();

    }

    return verificarOrganizacionVerificada(
      req,
      res,
      next
    );

  };


router.post(
  '/',
  verificarToken,
  verificarRol(
    'ORGANIZACION',
    'VOLUNTARIO'
  ),
  verificarOrganizacionSiCorresponde,
  ubicacionController.obtenerOCrearUbicacion
);

router.get(
  '/buscar',
  verificarToken,
  ubicacionController.buscarDirecciones
);

module.exports = router;