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