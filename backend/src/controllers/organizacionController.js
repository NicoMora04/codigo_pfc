const pool = require('../config/db');
const organizacionService =
  require('../services/organizacionService');

// ======================================================
// 1. CONSULTAR ESTADO DE VERIFICACIÓN
// ======================================================

exports.obtenerEstadoVerificacion = async (req, res) => {

  const idUsuario = req.user.id;

  try {

    const result = await pool.query(
      `
      SELECT
        id_organizacion,
        razon_social,
        estado_verificacion
      FROM organizacion
      WHERE id_usuario = $1
      `,
      [idUsuario]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        error: 'Organización no encontrada'
      });

    }

    return res.status(200).json({
      organizacion: result.rows[0]
    });

  } catch (error) {

    console.error(
      'ERROR AL CONSULTAR ESTADO DE VERIFICACIÓN:',
      error
    );

    return res.status(500).json({
      error: 'No se pudo consultar el estado de verificación'
    });

  }

};


// ======================================================
// 2. VOLVER A SOLICITAR VERIFICACIÓN
// ======================================================

exports.solicitarNuevaVerificacion = async (req, res) => {

  const idUsuario = req.user.id;

  try {

    const organizacion =
      await organizacionService.solicitarNuevaVerificacion(
        idUsuario
      );

    return res.status(200).json({
      message:
        'La organización volvió a ser enviada a revisión',
      organizacion
    });

  } catch (error) {

    console.error(
      'ERROR AL SOLICITAR NUEVA VERIFICACIÓN:',
      error
    );

    return res.status(error.status || 500).json({
      error:
        error.status
          ? error.message
          : 'No se pudo solicitar una nueva verificación'
    });

  }

};