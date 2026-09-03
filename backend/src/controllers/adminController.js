const pool = require('../config/db');
const adminService =require('../services/adminService');

// ======================================================
// 1. LISTAR ORGANIZACIONES PENDIENTES
// ======================================================

exports.listarOrganizacionesPendientes = async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT
        o.id_organizacion,
        o.razon_social,
        o.cuit,
        o.telefono,
        o.descripcion,
        o.estado_verificacion,
        u.email,
        o.creado_en
      FROM organizacion o
      INNER JOIN usuario u
        ON o.id_usuario = u.id_usuario
      WHERE o.estado_verificacion = 'PENDIENTE'
      ORDER BY o.creado_en ASC
      `
    );

    return res.status(200).json({
      organizaciones: result.rows
    });

  } catch (error) {

    console.error(
      'ERROR AL LISTAR ORGANIZACIONES PENDIENTES:',
      error
    );

    return res.status(500).json({
      error: 'No se pudieron obtener las organizaciones pendientes'
    });

  }

};


// ======================================================
// 2. APROBAR ORGANIZACIÓN
// ======================================================

exports.aprobarOrganizacion = async (req, res) => {

  const { idOrganizacion } = req.params;

  try {

    const result = await pool.query(
      `
      UPDATE organizacion
      SET
        estado_verificacion = 'VERIFICADA',
        actualizado_en = CURRENT_TIMESTAMP
      WHERE id_organizacion = $1
        AND estado_verificacion = 'PENDIENTE'
      RETURNING
        id_organizacion,
        razon_social,
        cuit,
        estado_verificacion
      `,
      [idOrganizacion]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        error: 'Organización no encontrada o ya procesada'
      });

    }

    return res.status(200).json({
      message: 'Organización verificada correctamente',
      organizacion: result.rows[0]
    });

  } catch (error) {

    console.error(
      'ERROR AL APROBAR ORGANIZACIÓN:',
      error
    );

    return res.status(500).json({
      error: 'No se pudo verificar la organización'
    });

  }

};




// ======================================================
// 3. RECHAZAR ORGANIZACIÓN
// ======================================================

exports.rechazarOrganizacion = async (req, res) => {

  const { idOrganizacion } = req.params;
  const { motivo } = req.body;

  if (!motivo || !motivo.trim()) {
  return res.status(400).json({
    error: 'El motivo del rechazo es obligatorio'
  });
}

  try {

    const result = await pool.query(
      `
      UPDATE organizacion
      SET
        estado_verificacion = 'RECHAZADA',
        motivo_rechazo = $2,
        actualizado_en = CURRENT_TIMESTAMP
      WHERE id_organizacion = $1
        AND estado_verificacion = 'PENDIENTE'
      RETURNING
        id_organizacion,
        razon_social,
        cuit,
        estado_verificacion,
        motivo_rechazo
      `,
      [idOrganizacion,motivo.trim()]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        error: 'Organización no encontrada o ya procesada'
      });

    }

    return res.status(200).json({
      message: 'Organización rechazada correctamente',
      organizacion: result.rows[0]
    });

  } catch (error) {

    console.error(
      'ERROR AL RECHAZAR ORGANIZACIÓN:',
      error
    );

    return res.status(500).json({
      error: 'No se pudo rechazar la organización'
    });

  }

};


// ======================================================
// 4. BLOQUEAR USUARIO
// ======================================================

exports.bloquearUsuario = async (req, res) => {

  const { idUsuario } = req.params;
  const { motivo } = req.body;

  try {

    const usuario =
      await adminService.bloquearUsuario(idUsuario,motivo);

    return res.status(200).json({
      message: 'Usuario bloqueado correctamente',
      usuario
    });

  } catch (error) {

    console.error(
      'ERROR AL BLOQUEAR USUARIO:',
      error
    );

    return res.status(error.status || 500).json({
      error:
        error.status
          ? error.message
          : 'No se pudo bloquear el usuario'
    });

  }

};



// ======================================================
// 5. REHABILITAR USUARIO
// ======================================================

exports.rehabilitarUsuario = async (req, res) => {

  const { idUsuario } = req.params;

  try {

    const usuario =
      await adminService.rehabilitarUsuario(idUsuario);

    return res.status(200).json({
      message: 'Usuario rehabilitado correctamente',
      usuario
    });

  } catch (error) {

    console.error(
      'ERROR AL REHABILITAR USUARIO:',
      error
    );

    return res.status(error.status || 500).json({
      error:
        error.status
          ? error.message
          : 'No se pudo rehabilitar el usuario'
    });

  }

};