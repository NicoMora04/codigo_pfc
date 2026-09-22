const express = require('express');
const router = express.Router();

const inscripcionController = require('../controllers/inscripcionController');
const authMiddleware = require('../middleware/authMiddleware');
const verificarRol = require('../middleware/roleMiddleware');

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

module.exports = router;