const express = require('express');

const router = express.Router();


const notificacionController =
  require('../controllers/notificacionController');


const verificarToken =
  require('../middleware/authMiddleware');


// ======================================================
// LISTAR MIS NOTIFICACIONES
// GET /api/notificaciones
// ======================================================

router.get(
  '/',

  verificarToken,

  notificacionController.listarMisNotificaciones
);


// ======================================================
// CONTAR NOTIFICACIONES NO LEÍDAS
// GET /api/notificaciones/no-leidas
// ======================================================

router.get(
  '/no-leidas',

  verificarToken,

  notificacionController.contarMisNoLeidas
);


// ======================================================
// MARCAR NOTIFICACIÓN COMO LEÍDA
// PATCH /api/notificaciones/:idNotificacion/leida
// ======================================================

router.patch(
  '/:idNotificacion/leida',

  verificarToken,

  notificacionController.marcarComoLeida
);

// ======================================================
// REGISTRAR DISPOSITIVO
// POST /api/notificaciones/dispositivos
// ======================================================

router.post(
  '/dispositivos',

  verificarToken,

  notificacionController.registrarTokenDispositivo
);


// ======================================================
// DESACTIVAR DISPOSITIVO
// DELETE /api/notificaciones/dispositivos
// ======================================================

router.delete(
  '/dispositivos',

  verificarToken,

  notificacionController.desactivarTokenDispositivo
);
// ======================================================
// EXPORTACIÓN
// ======================================================

module.exports = router;