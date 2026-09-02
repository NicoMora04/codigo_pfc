const pool = require('../config/db');


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