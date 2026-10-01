const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');



// ======================================================
// 1. REGISTRO DE USUARIO (CU-001)
// ======================================================

exports.register = async (req, res) => {

  const {
    email,
    password,
    rol,
    nombre,
    apellido,
    telefono,
    razon_social,
    cuit,
    descripcion,
    ubicacion,
    tipos_actividad
  } = req.body;

  let client;

  try {

    // ==================================================
    // 1. VALIDACIONES GENERALES
    // ==================================================

    if (!email || !password || !rol) {
      return res.status(400).json({
        error: 'Email, contraseña y rol son obligatorios'
      });
    }

    if (password.length < 6) {
  return res.status(400).json({
    error: 'La contraseña debe tener al menos 6 caracteres'
  });
}

    if (!['VOLUNTARIO', 'ORGANIZACION'].includes(rol)) {
      return res.status(400).json({
        error: 'Rol no válido'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
      error: 'El formato del email no es válido'
  })};



  let tiposActividadNormalizados = [];

    // ==================================================
    // 2. VALIDACIONES SEGÚN EL ROL
    // ==================================================

    if (rol === 'VOLUNTARIO') {

      if (!nombre || !apellido) {
        return res.status(400).json({
          error:
            'Nombre y apellido son obligatorios para voluntarios'
        });
      }

       if (
      telefono &&
      !/^\d{7,15}$/.test(
        telefono.trim()
      )
    ) {
      return res.status(400).json({
        error:
          'El teléfono debe contener entre 7 y 15 dígitos numéricos'
      });
    }

    }

       


    if (rol === 'ORGANIZACION') {

      if (!razon_social || !cuit) {
        return res.status(400).json({
          error:
            'Razón social y CUIT son obligatorios para organizaciones'
        });
      }

      if (!/^\d{11}$/.test(cuit)) {
        return res.status(400).json({
        error: 'El CUIT debe contener exactamente 11 dígitos'
      });
      }

      if (!ubicacion) {
  return res.status(400).json({
    error:
      'La ubicación institucional es obligatoria para organizaciones'
  });}




    const {
      latitud,
      longitud,
      direccion,
      localidad,
      provincia
    } = ubicacion;


    if (
      typeof latitud !== 'number' ||
      !Number.isFinite(latitud) ||
      latitud < -90 ||
      latitud > 90
    ) {

      return res.status(400).json({
        error:
          'La latitud indicada no es válida'
      });

    }


    if (
      typeof longitud !== 'number' ||
      !Number.isFinite(longitud) ||
      longitud < -180 ||
      longitud > 180
    ) {

      return res.status(400).json({
        error:
          'La longitud indicada no es válida'
      });

    }


    if (
      localidad != null &&
      typeof localidad !== 'string'
    ) {

      return res.status(400).json({
        error:
          'La localidad indicada no es válida'
      });

    }


    if (
      provincia != null &&
      typeof provincia !== 'string'
    ) {

      return res.status(400).json({
        error:
          'La provincia indicada no es válida'
      });

    }


    if (
      direccion != null &&
      (
        typeof direccion !== 'string' ||
        direccion.trim().length === 0 ||
        direccion.trim().length > 255
      )
    ) {

      return res.status(400).json({
        error:
          'La dirección indicada no es válida'
      });

    }

    if (
  !Array.isArray(tipos_actividad) ||
  tipos_actividad.length === 0
) {

  return res.status(400).json({
    error:
      'La organización debe seleccionar al menos un tipo de actividad'
  });

}


 tiposActividadNormalizados =
    [
    ...new Set(
      tipos_actividad.map(
        (id) => Number(id)
      )
    )
  ];


if (
  tiposActividadNormalizados.some(
    (id) =>
      !Number.isInteger(id) ||
      id <= 0
  )
) {

  return res.status(400).json({
    error:
      'Uno o más tipos de actividad no son válidos'
  });

}

      if (
        descripcion &&
        descripcion.trim().length > 500
      ) {

        return res.status(400).json({
          error:
            'La descripción institucional no puede superar los 500 caracteres'
        });

}

    }


    // ==================================================
    // 3. OBTENER CONEXIÓN E INICIAR TRANSACCIÓN
    // ==================================================

    client = await pool.connect();

    await client.query('BEGIN');


    // ==================================================
    // 4. HASHEAR CONTRASEÑA
    // ==================================================

    const saltRounds = 10;

    const passwordHash = await bcrypt.hash(
      password,
      saltRounds
    );


    // ==================================================
    // 5. CREAR USUARIO
    // ==================================================

    const userRes = await client.query(
      `
      INSERT INTO usuario
        (
          email,
          password_hash,
          rol,
          estado_cuenta
        )
      VALUES
        ($1, $2, $3, 'ACTIVA')
      RETURNING
        id_usuario,
        email,
        rol,
        estado_cuenta
      `,
      [
        email,
        passwordHash,
        rol
      ]
    );


    const userId =
      userRes.rows[0].id_usuario;


    // ==================================================
    // 6. CREAR PERFIL SEGÚN EL ROL
    // ==================================================

    if (rol === 'VOLUNTARIO') {

      await client.query(
        `
        INSERT INTO perfil_voluntario
          (
            id_usuario,
            nombre,
            apellido,
            telefono
          )
        VALUES
          ($1, $2, $3,$4)
        `,
        [
          userId,
          nombre,
          apellido,
          telefono?.trim() || null
        ]
      );

    }


    else if (rol === 'ORGANIZACION') {

        // ==================================================
        // 6.1 OBTENER O CREAR UBICACIÓN INSTITUCIONAL
        // ==================================================

        const {
          latitud,
          longitud,
          direccion,
          localidad,
          provincia
        } = ubicacion;


        const ubicacionExistente =
          await client.query(
            `
            SELECT
              id_ubicacion,
              direccion
            FROM ubicacion
            WHERE latitud = $1
              AND longitud = $2
              AND localidad IS NOT DISTINCT FROM $3
              AND provincia IS NOT DISTINCT FROM $4
              AND es_aproximada = FALSE
            LIMIT 1
            `,
            [
              latitud,
              longitud,
              localidad?.trim() || null,
              provincia?.trim() || null
            ]
          );


        let idUbicacion;


        if (
          ubicacionExistente.rows.length > 0
        ) {

          idUbicacion =
            ubicacionExistente
              .rows[0]
              .id_ubicacion;


          // Si la ubicación ya existía pero no tenía
          // dirección, completamos el dato.
          if (
            !ubicacionExistente
              .rows[0]
              .direccion &&
            direccion?.trim()
          ) {

            await client.query(
              `
              UPDATE ubicacion
              SET direccion = $1
              WHERE id_ubicacion = $2
              `,
              [
                direccion.trim(),
                idUbicacion
              ]
            );

          }

        }
        else {

          const nuevaUbicacion =
            await client.query(
              `
              INSERT INTO ubicacion
                (
                  latitud,
                  longitud,
                  direccion,
                  localidad,
                  provincia,
                  es_aproximada
                )
              VALUES
                ($1, $2, $3, $4, $5, FALSE)
              RETURNING
                id_ubicacion
              `,
              [
                latitud,
                longitud,
                direccion?.trim() || null,
                localidad?.trim() || null,
                provincia?.trim() || null
              ]
            );


          idUbicacion =
            nuevaUbicacion
              .rows[0]
              .id_ubicacion;

        }


        // ==================================================
        // 6.2 CREAR ORGANIZACIÓN
        // ==================================================

        const organizacionResult =
          await client.query(
            `
            INSERT INTO organizacion
              (
                id_usuario,
                razon_social,
                cuit,
                descripcion,
                id_ubicacion,
                estado_verificacion
              )
            VALUES
              ($1, $2, $3, $4, $5, 'PENDIENTE')
            RETURNING
              id_organizacion
            `,
            [
              userId,
              razon_social,
              cuit,
              descripcion?.trim() || null,
              idUbicacion
            ]
          );


        const idOrganizacion =
          organizacionResult
            .rows[0]
            .id_organizacion;

        const tiposExistentes =
          await client.query(
            `
            SELECT
              id_tipo_actividad
            FROM tipo_actividad
            WHERE id_tipo_actividad =
              ANY($1::smallint[])
            `,
            [
              tiposActividadNormalizados
            ]
          );


        if (
          tiposExistentes.rows.length !==
          tiposActividadNormalizados.length
        ) {

          const error =
            new Error(
              'Uno o más tipos de actividad no existen'
            );

          error.status = 400;

          throw error;

        }


        await client.query(
          `
          INSERT INTO organizacion_tipo_actividad
            (
              id_organizacion,
              id_tipo_actividad
            )
          SELECT
            $1,
            UNNEST($2::smallint[])
          `,
          [
            idOrganizacion,
            tiposActividadNormalizados
          ]
        );

      }

    // ==================================================
    // 7. CONFIRMAR TRANSACCIÓN
    // ==================================================

    await client.query('COMMIT');


    return res.status(201).json({

      message:
        'Usuario registrado exitosamente',

      user:
        userRes.rows[0]

    });


  } catch (error) {

    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error(
          'ERROR AL HACER ROLLBACK:',
          rollbackError
        );
      }
    }


    console.error(
      'ERROR AL REGISTRAR USUARIO:',
      error
    );


    // Email o CUIT duplicado
    if (error.code === '23505') {
      return res.status(409).json({
        error:
          'Ya existe un registro con alguno de los datos ingresados'
      });
    }

    if (error.status) {

        return res.status(
          error.status
        ).json({
          error: error.message
        });

      }


    return res.status(500).json({
      error:
        'Error al registrar usuario'
    });


  } finally {

    if (client) {
      client.release();
    }

  }

};

// ======================================================
// 2. INICIO DE SESIÓN (CU-002)
// ======================================================

exports.login = async (req, res) => {

  const {
    email,
    password
  } = req.body;

  if (!email || !password) {
  return res.status(400).json({
    error: 'Email y contraseña son obligatorios'
  });
  }


  try {

    // Buscar usuario por correo
    const userRes = await pool.query(
      `
      SELECT *
      FROM usuario
      WHERE email = $1
      `,
      [email]
    );


    // Usuario inexistente
    if (userRes.rows.length === 0) {

      return res.status(401).json({
        error: 'Credenciales inválidas'
      });

    }


    const user = userRes.rows[0];


    // Comparar contraseña ingresada
    // con contraseña encriptada
    const validPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    // Verificar que la cuenta se encuentre activa
    if (user.estado_cuenta !== 'ACTIVA') {

      return res.status(403).json({
        error: 'La cuenta no se encuentra activa'
      });

    }


    if (!validPassword) {

      return res.status(401).json({
        error: 'Credenciales inválidas'
      });

    }


    // Generar JWT
    const token = jwt.sign(
      {
        id: user.id_usuario,
        rol: user.rol
      },

      process.env.JWT_SECRET,

      {
        expiresIn: '8h'
      }
    );


    res.json({

      message: 'Inicio de sesión exitoso',

      token,

      user: {
        id: user.id_usuario,
        email: user.email,
        rol: user.rol
      }

    });


  } catch (error) {

    console.error(
      'ERROR AL INICIAR SESIÓN:',
      error
    );


  res.status(500).json({
   error:
    'Error en el servidor al intentar loguearse'
  });

  }

};




// Configuración del transportador SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


// ======================================================
// 3. RECUPERAR CONTRASEÑA (CU-003 / A02)
// ======================================================


exports.forgotPassword = async (req, res) => {

  const { email } = req.body;

  // Siempre devolveremos el mismo mensaje
  const genericMessage =
    'Si existe una cuenta asociada al correo, recibirás las instrucciones para recuperar el acceso.';

  try {

    // ==================================================
    // 1. VALIDAR ENTRADA
    // ==================================================

    if (!email) {
      return res.status(400).json({
        error: 'El correo electrónico es obligatorio'
      });
    }


    // ==================================================
    // 2. BUSCAR EL USUARIO
    // ==================================================
  
    const userRes = await pool.query(
      `
      SELECT id_usuario, email
      FROM usuario
      WHERE email = $1
      `,
      [email]
    );


    // Si no existe, respondemos exactamente igual.
    // Así no revelamos si una dirección está registrada.
    if (userRes.rows.length === 0) {
      return res.json({
        message: genericMessage
      });
    }


    const user = userRes.rows[0];


    // ==================================================
    // 3. GENERAR TOKEN ORIGINAL
    // ==================================================

    const resetToken = crypto
      .randomBytes(32)
      .toString('hex');


    // ==================================================
    // 4. CALCULAR HASH SHA-256
    // ==================================================
    const tokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');


    // ==================================================
    // 5. DEFINIR VENCIMIENTO
    // ==================================================

    const expirationMinutes = 15;

    const expiresAt = new Date(
      Date.now() + expirationMinutes * 60 * 1000
    );


    // ==================================================
    // 6. GUARDAR SOLAMENTE EL HASH
    // ==================================================
      
    await pool.query(
  `
  INSERT INTO token_recuperacion_contrasena
    (
      id_usuario,
      token_hash,
      expira_en
    )
  VALUES
    ($1, $2, $3)
  `,
  [
    user.id_usuario,
    tokenHash,
    expiresAt
  ]
);


    // 7. CREAR ENLACE DE RECUPERACIÓN
    // ==================================================

   const resetLink =
  `${process.env.WEB_URL}/restablecer-contrasena?token=${resetToken}`;


    // ==================================================
    // 8. ENVIAR EMAIL
    // ==================================================

    await transporter.sendMail({

      from:
        `"Voluntariado PFC" <${process.env.SMTP_USER}>`,

      to: user.email,

      subject:
        'Restablecer contraseña - App Voluntariado',

      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">

          <h2>
            Recuperación de contraseña
          </h2>

          <p>
            Recibimos una solicitud para cambiar
            la contraseña de tu cuenta.
          </p>

          <p>
            El siguiente enlace será válido durante
            ${expirationMinutes} minutos:
          </p>

          <a href="${resetLink}">
            Restablecer contraseña
          </a>

          <p>
            Si no solicitaste este cambio,
            podés ignorar este mensaje.
          </p>

        </div>
      `
    });


    // ==================================================
    // 9. RESPUESTA
    // ==================================================

    return res.json({
      message: genericMessage
    });


  } catch (error) {

    console.error(
      'ERROR EN RECUPERACIÓN DE CONTRASEÑA:',
      error
    );

    return res.status(500).json({
      error:
        'Error al procesar la solicitud de recuperación'
    });

  }

};

// ======================================================
// 4. RESTABLECER CONTRASEÑA (CU-003 / A03)
// ======================================================

exports.resetPassword = async (req, res) => {


  const { token, nuevaPassword } = req.body;

  let client;

  try {

    if (!token || !nuevaPassword) {
      return res.status(400).json({
        error: 'El token y la nueva contraseña son obligatorios'
      });
    }

  if (nuevaPassword.length < 6) {
  return res.status(400).json({
    error: 'La contraseña debe tener al menos 6 caracteres'
  });
}

    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');


    // ==================================================
    // 3. OBTENER UNA CONEXIÓN DE POSTGRESQL
    // ==================================================

    client = await pool.connect();


    // ==================================================
    // 4. INICIAR TRANSACCIÓN
    // ==================================================

    await client.query('BEGIN');


    // ==================================================
    // 5. BUSCAR UN TOKEN VÁLIDO
    // ==================================================

    const tokenResult = await client.query(
      `
      SELECT
        id_token,
        id_usuario,
        expira_en,
        usado_en
      FROM token_recuperacion_contrasena
      WHERE token_hash = $1
        AND usado_en IS NULL
        AND expira_en > CURRENT_TIMESTAMP
      FOR UPDATE
      `,
      [tokenHash]
    );


    if (tokenResult.rows.length === 0) {

      await client.query('ROLLBACK');

      return res.status(400).json({
        error: 'El enlace de recuperación es inválido o ha expirado'
      });
    }


    const recoveryToken = tokenResult.rows[0];


    // ==================================================
    // 6. HASHEAR LA NUEVA CONTRASEÑA
    // ==================================================

    const saltRounds = 10;

    const passwordHash = await bcrypt.hash(
      nuevaPassword,
      saltRounds
    );


    // ==================================================
    // 7. ACTUALIZAR LA CONTRASEÑA DEL USUARIO
    // ==================================================

    await client.query(
      `
      UPDATE usuario
      SET
        password_hash = $1,
        actualizado_en = CURRENT_TIMESTAMP
      WHERE id_usuario = $2
      `,
      [
        passwordHash,
        recoveryToken.id_usuario
      ]
    );


    // ==================================================
    // 8. MARCAR EL TOKEN COMO UTILIZADO
    // ==================================================

    await client.query(
      `
      UPDATE token_recuperacion_contrasena
      SET usado_en = CURRENT_TIMESTAMP
      WHERE id_token = $1
      `,
      [recoveryToken.id_token]
    );


    // ==================================================
    // 9. CONFIRMAR TRANSACCIÓN
    // ==================================================

    await client.query('COMMIT');


    return res.json({
      message: 'Contraseña actualizada correctamente'
    });


  } catch (error) {

    // Si ya obtuvimos una conexión,
    // intentamos deshacer la transacción.
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error(
          'ERROR AL HACER ROLLBACK:',
          rollbackError
        );
      }
    }

    console.error(
      'ERROR AL RESTABLECER CONTRASEÑA:',
      error
    );

    return res.status(500).json({
      error: 'Error al restablecer la contraseña'
    });

  } finally {

    // Devolvemos la conexión al pool.
    if (client) {
      client.release();
    }

  }
}

// ======================================================
// 8. OBTENER MI ORGANIZACIÓN
// ======================================================

    exports.obtenerMiOrganizacion = async (
      req,
      res
    ) => {

      try {

        const idUsuario =
          req.user.id;


        const resultado =
          await pool.query(
            `
            SELECT
              u.id_usuario,
              u.email,
              u.estado_cuenta,
              o.razon_social,
              o.cuit,
              o.estado_verificacion
            FROM usuario u
            INNER JOIN organizacion o
              ON o.id_usuario = u.id_usuario
            WHERE u.id_usuario = $1
            `,
            [
              idUsuario
            ]
          );


        if (
          resultado.rows.length === 0
        ) {

          return res.status(404).json({
            error:
              'No se encontró la organización asociada al usuario'
          });

        }


        return res.json({
          organizacion:
            resultado.rows[0]
        });

      }
      catch (error) {

        console.error(
          'ERROR AL OBTENER ORGANIZACIÓN:',
          error
        );


        return res.status(500).json({
          error:
            'No se pudo obtener la información de la organización'
        });

      }

    };