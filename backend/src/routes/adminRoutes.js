const express = require('express');

const router = express.Router();

const adminController = require('../controllers/adminController');

const verificarToken = require('../middleware/authMiddleware');

const verificarRol = require('../middleware/roleMiddleware');


// ======================================================
// ORGANIZACIONES PENDIENTES
// ======================================================

router.get(
  '/organizaciones/pendientes',
  verificarToken,
  verificarRol('ADMIN'),
  adminController.listarOrganizacionesPendientes
);

router.patch(
  '/organizaciones/:idOrganizacion/aprobar',
  verificarToken,
  verificarRol('ADMIN'),
  adminController.aprobarOrganizacion
);

router.patch(
  '/organizaciones/:idOrganizacion/rechazar',
  verificarToken,
  verificarRol('ADMIN'),
  adminController.rechazarOrganizacion
);

router.patch(
  '/usuarios/:idUsuario/bloquear',
  verificarToken,
  verificarRol('ADMIN'),
  adminController.bloquearUsuario
);

router.patch(
  '/usuarios/:idUsuario/rehabilitar',
  verificarToken,
  verificarRol('ADMIN'),
  adminController.rehabilitarUsuario
);


module.exports = router;