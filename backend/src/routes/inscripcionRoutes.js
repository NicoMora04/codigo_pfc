const express = require('express');
const router = express.Router();

const inscripcionController = require('../controllers/inscripcionController');
const authMiddleware = require('../middleware/authMiddleware');
const verificarRol = require('../middleware/roleMiddleware');
const verificarOrganizacionVerificada =
  require('../middleware/organizacionVerificadaMiddleware');

// Inscribirse a una oportunidad
router.post(
  '/',
  authMiddleware,
  verificarRol('VOLUNTARIO'),
  inscripcionController.inscribirse
);

// Consultar las inscripciones del voluntario autenticado
router.get(
  '/mis-inscripciones',
  authMiddleware,
  verificarRol('VOLUNTARIO'),
  inscripcionController.listarMisInscripciones
);

// Consultar inscripciones de una oportunidad propia
router.get(
  '/oportunidad/:idOportunidad',
  authMiddleware,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  inscripcionController.listarPorOportunidadOrganizacion
);

// Aceptar una inscripción pendiente
router.patch(
  '/:idInscripcion/aceptar',
  authMiddleware,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  inscripcionController.aceptarInscripcion
);

// Rechazar una inscripción pendiente
router.patch(
  '/:idInscripcion/rechazar',
  authMiddleware,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  inscripcionController.rechazarInscripcion
);

router.patch(
  '/:idInscripcion/ocultar',
  authMiddleware,
  verificarRol('VOLUNTARIO'),
  inscripcionController.ocultarInscripcionVoluntario
);

router.patch(
  '/:idInscripcion/cancelar',
  authMiddleware,
  verificarRol('VOLUNTARIO'),
  inscripcionController.cancelarInscripcionVoluntario
);

router.patch(
  '/:idInscripcion/resultado',
  authMiddleware,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  inscripcionController.marcarResultadoParticipacion
);
module.exports = router;