const express = require('express');

const router = express.Router();

const organizacionController = require('../controllers/organizacionController');

const verificarToken = require('../middleware/authMiddleware');

const verificarRol = require('../middleware/roleMiddleware');

const verificarOrganizacionVerificada = require('../middleware/organizacionVerificadaMiddleware');

const perfilPublicoController = require('../controllers/perfilPublicoController');

const multer = require('multer');

const uploadPerfilImagen = require('../middleware/perfilImagenMiddleware');

// ======================================================
// PROCESAR IMAGEN DE PERFIL
// ACTIVIDAD 3.6.3
// ======================================================

const procesarImagenPerfil =
  (
    req,
    res,
    next
  ) => {

    uploadPerfilImagen
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
// ESTADO DE VERIFICACIÓN
// ======================================================

router.get(
  '/estado-verificacion',
  verificarToken,
  verificarRol('ORGANIZACION'),
  organizacionController.obtenerEstadoVerificacion
);


router.patch(
  '/solicitar-verificacion',
  verificarToken,
  verificarRol('ORGANIZACION'),
  organizacionController.solicitarNuevaVerificacion
);

// ======================================================
// PERFIL PÚBLICO PROPIO
// ======================================================

router.get(
  '/mi-perfil',
  verificarToken,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  perfilPublicoController.obtenerPerfilPropio
);

// ======================================================
// ACTUALIZAR PERFIL PÚBLICO PROPIO
// ACTIVIDAD 3.6.2
// ======================================================

router.patch(
  '/mi-perfil',
  verificarToken,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  perfilPublicoController.actualizarPerfilPropio
);

// ======================================================
// CREAR PERFIL PÚBLICO PROPIO
// ACTIVIDAD 3.6.2
// ======================================================

router.post(
  '/mi-perfil',
  verificarToken,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  perfilPublicoController.crearPerfilPropio
);

// ======================================================
// PLANTILLAS DE PERFIL
// ACTIVIDAD 3.6.3
// ======================================================

router.get(
  '/plantillas-perfil',
  verificarToken,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  perfilPublicoController.listarPlantillasActivas
);

// ======================================================
// ACTUALIZAR PLANTILLA DEL PERFIL
// ACTIVIDAD 3.6.3
// ======================================================

router.patch(
  '/mi-perfil/plantilla',
  verificarToken,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  perfilPublicoController.actualizarPlantillaPerfilPropio
);

// ======================================================
// ELIMINAR IMAGEN DE GALERÍA DEL PERFIL
// ACTIVIDAD 3.6.3
// ======================================================
router.delete(
  '/mi-perfil/imagenes/galeria/:idImagen',
  verificarToken,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  perfilPublicoController
    .eliminarImagenGaleria
)

// ======================================================
// SECCIONES CONFIGURABLES DEL PERFIL
// ACTIVIDAD 3.6.3
// ======================================================

router.patch(
  '/mi-perfil/orden-secciones',
  verificarToken,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  perfilPublicoController.actualizarOrdenSecciones
);


router.patch(
  '/mi-perfil/secciones/:tipo',
  verificarToken,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  perfilPublicoController.guardarSeccionPerfil
);

// ======================================================
// PUBLICACIÓN DEL PERFIL
// ACTIVIDAD 3.6.4
// ======================================================

router.patch(
  '/mi-perfil/publicar',
  verificarToken,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  perfilPublicoController
    .publicarPerfilPropio
)


router.patch(
  '/mi-perfil/retirar',
  verificarToken,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  perfilPublicoController
    .retirarPerfilPropio
)

router.patch(
  '/mi-perfil/tipos-actividad',
  verificarToken,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  perfilPublicoController.actualizarTiposActividad
);

router.patch(
  '/mi-perfil/ubicacion',
  verificarToken,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  perfilPublicoController.actualizarUbicacion
);

// ======================================================
// ORGANIZACIONES DISPONIBLES PARA DONACIÓN
// ======================================================

router.get(
  '/disponibles-donacion',
  verificarToken,
  verificarRol('VOLUNTARIO'),
  organizacionController
    .listarDisponiblesParaDonacion
);


// ======================================================
// DETALLE DE ORGANIZACIÓN PARA DONACIÓN
// ======================================================

router.get(
  '/:id/detalle-donacion',
  verificarToken,
  verificarRol('VOLUNTARIO'),
  organizacionController
    .obtenerDetalleDisponibleDonacion
);

// ======================================================
// IMÁGENES DEL PERFIL
// ACTIVIDAD 3.6.3
// ======================================================

router.patch(
  '/mi-perfil/imagenes/logo',
  verificarToken,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  procesarImagenPerfil,
  (
    req,
    res,
    next
  ) => {

    req.params.tipo =
      'LOGO';

    next();

  },
  perfilPublicoController
    .guardarImagenPerfil
);


router.patch(
  '/mi-perfil/imagenes/portada',
  verificarToken,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  procesarImagenPerfil,
  (
    req,
    res,
    next
  ) => {

    req.params.tipo =
      'PORTADA';

    next();

  },
  perfilPublicoController
    .guardarImagenPerfil
);


router.post(
  '/mi-perfil/imagenes/galeria',
  verificarToken,
  verificarRol('ORGANIZACION'),
  verificarOrganizacionVerificada,
  procesarImagenPerfil,
  (
    req,
    res,
    next
  ) => {

    req.params.tipo =
      'GALERIA';

    next();

  },
  perfilPublicoController
    .guardarImagenPerfil
);

module.exports = router;

