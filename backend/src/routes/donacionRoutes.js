const express =
  require('express');

const router =
  express.Router();


const donacionController =
  require(
    '../controllers/donacionController'
  );


const verificarToken =
  require(
    '../middleware/authMiddleware'
  );


const verificarRol =
  require(
    '../middleware/roleMiddleware'
  );

  const multer =
  require('multer');

const uploadDonacionImagen =
  require(
    '../middleware/donacionImagenMiddleware'
  );

const verificarDonacionPropia =
  require(
    '../middleware/donacionPropiaMiddleware'
  );



  // ======================================================
// PROCESAR IMAGEN DE DONACIÓN
// ======================================================

const procesarImagenDonacion =
  (
    req,
    res,
    next
  ) => {

    uploadDonacionImagen
      .single('imagen')(
        req,
        res,
        (error) => {

          if (!error) {

            return next();

          }


          if (
            error instanceof
              multer.MulterError &&
            error.code ===
              'LIMIT_FILE_SIZE'
          ) {

            return res
              .status(400)
              .json({
                error:
                  'La imagen no puede superar los 5 MB'
              });

          }


          return res
            .status(
              error.status ||
              400
            )
            .json({
              error:
                error.message ||
                'No se pudo procesar la imagen'
            });

        }
      );

  };

// ======================================================
// CATEGORÍAS DE DONACIÓN
// ======================================================



router.get(
  '/categorias',
  verificarToken,
  verificarRol(
    'VOLUNTARIO'
  ),
  donacionController
    .listarCategorias
);

// ======================================================
// MIS DONACIONES
// ======================================================

router.get(
  '/mias',
  verificarToken,
  verificarRol(
    'VOLUNTARIO'
  ),
  donacionController
    .listarDonacionesPropias
);


// ======================================================
// DETALLE DE DONACIÓN PROPIA
// ======================================================

router.get(
  '/:id',
  verificarToken,
  verificarRol(
    'VOLUNTARIO'
  ),
  donacionController
    .obtenerDetalleDonacionPropia
);

// ======================================================
// REGISTRAR DONACIÓN
// ======================================================

router.post(
  '/',
  verificarToken,
  verificarRol(
    'VOLUNTARIO'
  ),
  donacionController
    .crearDonacion
);


// ======================================================
// IMAGEN DE DONACIÓN
// ======================================================

router.patch(
  '/:id/imagen',
  verificarToken,
  verificarRol(
    'VOLUNTARIO'
  ),
  verificarDonacionPropia,
  procesarImagenDonacion,
  donacionController
    .actualizarImagenDonacion
);
module.exports =
  router;