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

// ======================================================
// LISTAR USUARIOS
// ======================================================

router.get(
  '/usuarios',
  verificarToken,
  verificarRol('ADMIN'),
  adminController.listarUsuarios
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

// ======================================================
// ANULAR REGISTRO INVÁLIDO DE ORGANIZACIÓN
// ======================================================

router.delete(
  '/organizaciones/:idOrganizacion/anular',
  verificarToken,
  verificarRol('ADMIN'),
  adminController.anularRegistroOrganizacion
);

// ======================================================
// MODERACIÓN DE PERFILES PÚBLICOS
// ACTIVIDAD 3.6.4
// ======================================================

router.patch(
  '/perfiles/:idPerfilPublico/ocultar',
  verificarToken,
  verificarRol('ADMIN'),
  adminController
    .ocultarPerfilPublico
)


router.patch(
  '/perfiles/:idPerfilPublico/rehabilitar',
  verificarToken,
  verificarRol('ADMIN'),
  adminController
    .rehabilitarPerfilPublico
)

// ======================================================
// LISTADO DE PERFILES PARA MODERACIÓN
// ACTIVIDAD 3.6.4
// ======================================================

router.get(
  '/perfiles-publicos',
  verificarToken,
  verificarRol('ADMIN'),
  adminController
    .listarPerfilesPublicos
)

module.exports = router;