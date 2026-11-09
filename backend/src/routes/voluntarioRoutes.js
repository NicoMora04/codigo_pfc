const express =
  require('express');

const router =
  express.Router();

const voluntarioController =
  require(
    '../controllers/voluntarioController'
  );

const verificarToken =
  require(
    '../middleware/authMiddleware'
  );

const verificarRol =
  require(
    '../middleware/roleMiddleware'
  );


// ======================================================
// INTERESES DEL VOLUNTARIO
// ======================================================

router.get(
  '/intereses',
  verificarToken,
  verificarRol('VOLUNTARIO'),
  voluntarioController
    .obtenerIntereses
);


router.put(
  '/intereses',
  verificarToken,
  verificarRol('VOLUNTARIO'),
  voluntarioController
    .actualizarIntereses
);

// ======================================================
// ACTUALIZAR DATOS PERSONALES DEL VOLUNTARIO
// ACTIVIDAD 3.5.1
// ======================================================

router.put(
  '/perfil',
  verificarToken,
  verificarRol('VOLUNTARIO'),
  voluntarioController.actualizarDatosPersonales
);

// ======================================================
// RECOMENDACIONES DEL VOLUNTARIO
// ======================================================

router.get(
  '/recomendaciones',
  verificarToken,
  verificarRol('VOLUNTARIO'),
  voluntarioController
    .obtenerRecomendaciones
);


module.exports =
  router;