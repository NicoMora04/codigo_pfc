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
    razon_social,
    cuit
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
            apellido
          )
        VALUES
          ($1, $2, $3)
        `,
        [
          userId,
          nombre,
          apellido
        ]
      );

    }


    else if (rol === 'ORGANIZACION') {

      await client.query(
        `
        INSERT INTO organizacion
          (
            id_usuario,
            razon_social,
            cuit,
            estado_verificacion
          )
        VALUES
          ($1, $2, $3, 'PENDIENTE')
        `,
        [
          userId,
          razon_social,
          cuit
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
        'Error en el servidor al intentar loguearse',

      details: error.message

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
    console.log(resetToken)
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
      `http://localhost:3000/api/auth/reset-password?token=${resetToken}`;


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