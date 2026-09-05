const express = require('express');

const oportunidadController =
  require('../controllers/oportunidadController');

const verificarToken =
  require('../middleware/authMiddleware');

const verificarRol =
  require('../middleware/roleMiddleware');

const verificarOrganizacionVerificada =
  require('../middleware/organizacionVerificadaMiddleware');


const router = express.Router();


// ======================================================
// CREAR OPORTUNIDAD
// ======================================================

router.post(
  '/',
  verificarToken,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  oportunidadController.crearOportunidad
);

// ======================================================
// ACTUALIZAR OPORTUNIDAD
// ======================================================

router.put(
  '/:id',
  verificarToken,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  oportunidadController.actualizarOportunidad
);

// ======================================================
// CANCELAR OPORTUNIDAD
// ======================================================

router.patch(
  '/:id/cancelar',
  verificarToken,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  oportunidadController.cancelarOportunidad
);

// ======================================================
// PUBLICAR OPORTUNIDAD
// ======================================================

router.patch(
  '/:id/publicar',
  verificarToken,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  oportunidadController.publicarOportunidad
);


router.get(
  '/mias',
  verificarToken,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  oportunidadController.listarOportunidadesOrganizacion
);

router.get(
  '/mias',
  verificarToken,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  oportunidadController.listarOportunidadesOrganizacion
);

router.get(
  '/:id',
  verificarToken,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  oportunidadController.obtenerOportunidadOrganizacion
);


router.patch(
  '/:id/cerrar',
  verificarToken,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  oportunidadController.cerrarOportunidad
);

router.patch(
  '/:id/finalizar',
  verificarToken,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  oportunidadController.finalizarOportunidad
);
module.exports = router;