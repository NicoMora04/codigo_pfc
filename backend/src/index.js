const express = require('express');
const cors = require('cors');
require('dotenv').config();


const envioPushWorker =
  require('./services/envioPushWorker');

const reciboPushWorker =
  require('./services/reciboPushWorker');

const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes'); // Importamos las rutas de auth
const adminRoutes = require('./routes/adminRoutes');
const organizacionRoutes = require('./routes/organizacionRoutes');
const oportunidadRoutes =require('./routes/oportunidadRoutes');
const ubicacionRoutes =require('./routes/ubicacionRoutes');
const tipoActividadRoutes =require('./routes/tipoActividadRoutes');
const inscripcionRoutes = require('./routes/inscripcionRoutes');
const publicRoutes = require('./routes/publicRoutes');
const donacionRoutes =require('./routes/donacionRoutes');
const calificacionRoutes =require('./routes/calificacionRoutes');
const notificacionRoutes =
  require('./routes/notificacionRoutes');
const path = require('path');
const voluntarioRoutes = require('./routes/voluntarioRoutes');
const estadisticaRoutes = require('./routes/estadisticaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

const corsOrigins = (
  process.env.CORS_ORIGINS ||
  'http://localhost:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {

      // Permite solicitudes sin Origin:
      // app móvil, curl, Postman, servidor a servidor.
      if (
        !origin ||
        corsOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      // Para otros orígenes no se habilita CORS.
      return callback(null, false);
    },
  })
);
app.use(express.json());
app.use(
  '/uploads',
  express.static(
    path.join(
      __dirname,
      '../uploads'
    )
  )
);
app.use('/api/ubicaciones',ubicacionRoutes);

// Enlazamos las rutas bajo el prefijo /api/auth
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/oportunidades', oportunidadRoutes);
app.use('/api/organizaciones', organizacionRoutes);
app.use('/api/tipos-actividad',tipoActividadRoutes);
app.use('/api/inscripciones', inscripcionRoutes);
app.use('/api/donaciones',donacionRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/voluntarios', voluntarioRoutes);
app.use('/api/calificaciones', calificacionRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/estadisticas', estadisticaRoutes);

// Ruta de diagnóstico (Health Check)
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'OK',
      message: 'Servidor y Base de Datos funcionando correctamente',
      timestamp: result.rows[0].now
    });
  } catch (error) {
  console.error(
    'ERROR EN HEALTH CHECK:',
    error
  );

  res.status(500).json({
    status: 'ERROR',
    message:
      'No se pudo verificar el estado del servicio'
  });
}
});

// ======================================================
// INICIO DEL SERVIDOR Y PROCESADORES PUSH
// ACTIVIDAD 3.3.1
// ======================================================

if (require.main === module) {

  // ====================================================
  // CONFIGURACIÓN DE INTERVALOS
  // ====================================================

  const INTERVALO_ENVIOS = 30 * 1000;

  const INTERVALO_RECIBOS = 60 * 1000;


  // ====================================================
  // CONTROL DE EJECUCIONES SIMULTÁNEAS
  // ====================================================

  let procesandoEnvios = false;

  let procesandoRecibos = false;


  // ====================================================
  // PROCESAR ENVÍOS PENDIENTES
  // ====================================================

  const ejecutarProcesadorEnvios = async () => {

    // Evitar ejecuciones superpuestas

    if (procesandoEnvios) {
      return;
    }

    procesandoEnvios = true;

    try {

      const resultado =
        await envioPushWorker.procesarLote();


      // Mostrar información solamente
      // cuando existen envíos procesados.

      if (resultado.total > 0) {

        console.log(
          '[PUSH] Procesamiento de envíos:',
          resultado
        );

      }

    }
    catch (error) {

      console.error(
        '[PUSH] Error al procesar envíos:',
        error
      );

    }
    finally {

      procesandoEnvios = false;

    }

  };


  // ====================================================
  // PROCESAR RECIBOS PENDIENTES
  // ====================================================

  const ejecutarProcesadorRecibos = async () => {

    // Evitar ejecuciones superpuestas

    if (procesandoRecibos) {
      return;
    }

    procesandoRecibos = true;

    try {

      const resultado =
        await reciboPushWorker.procesarRecibos();


      // Mostrar resultados relevantes

      if (
        resultado.total > 0 ||
        resultado.sinConfirmacion > 0
      ) {

        console.log(
          '[PUSH] Procesamiento de recibos:',
          resultado
        );

      }

    }
    catch (error) {

      console.error(
        '[PUSH] Error al procesar recibos:',
        error
      );

    }
    finally {

      procesandoRecibos = false;

    }

  };


  // ====================================================
  // INICIAR SERVIDOR EXPRESS
  // ====================================================

  app.listen(PORT, () => {

    console.log(
      `Servidor backend corriendo en el puerto ${PORT}`
    );


    // Ejecutar una primera revisión
    // al iniciar el backend.

    ejecutarProcesadorEnvios();

    ejecutarProcesadorRecibos();


    // ==================================================
    // PROGRAMAR EJECUCIONES PERIÓDICAS
    // ==================================================

    setInterval(
      ejecutarProcesadorEnvios,
      INTERVALO_ENVIOS
    );


    setInterval(
      ejecutarProcesadorRecibos,
      INTERVALO_RECIBOS
    );


    console.log(
      '[PUSH] Procesador de envíos iniciado (30 s)'
    );

    console.log(
      '[PUSH] Procesador de recibos iniciado (60 s)'
    );

  });

}


// ======================================================
// EXPORTAR EXPRESS PARA PRUEBAS
// ======================================================

module.exports = app;