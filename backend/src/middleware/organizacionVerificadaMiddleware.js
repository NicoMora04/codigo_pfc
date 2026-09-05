const pool = require('../config/db');

const verificarOrganizacionVerificada = async (req, res, next) => {

  try {

    const idUsuario = req.user.id;

    const result = await pool.query(
    `
    SELECT
      id_organizacion,
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

    const estado = result.rows[0].estado_verificacion;

    if (estado !== 'VERIFICADA') {

      return res.status(403).json({
        error: 'La organización debe estar verificada para realizar esta acción'
      });

    }
    req.organizacion = result.rows[0];
    next();

  } catch (error) {

    console.error(
      'ERROR AL VERIFICAR ORGANIZACIÓN:',
      error
    );

    return res.status(500).json({
      error: 'No se pudo verificar el estado de la organización'
    });

  }

};

module.exports = verificarOrganizacionVerificada;