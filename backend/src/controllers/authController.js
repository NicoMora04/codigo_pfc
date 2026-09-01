const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// ======================================================
// 1. REGISTRO DE USUARIO (CU-001)
// ======================================================

exports.register = async (req, res) => {

  const {
    email,
    password,
    rol,
    nombre,
    razon_social,
    cuit,
    descripcion
  } = req.body;

  const client = await pool.connect();

  try {

    // Validar que el rol sea correcto antes de iniciar
    // la transacción
    if (!['VOLUNTARIO', 'ORGANIZACION'].includes(rol)) {
      return res.status(400).json({
        error: 'Rol no válido'
      });
    }


    // Iniciamos transacción ACID para evitar
    // registros huérfanos
    await client.query('BEGIN');


    // Encriptar contraseña
    const saltRounds = 10;

    const passwordHash = await bcrypt.hash(
      password,
      saltRounds
    );


    // Crear cuenta principal
    const userRes = await client.query(
      `
      INSERT INTO usuario
        (email, password_hash, rol, estado)
      VALUES
        ($1, $2, $3, 'ACTIVO')
      RETURNING
        id_usuario,
        email,
        rol
      `,
      [
        email,
        passwordHash,
        rol
      ]
    );


    const userId = userRes.rows[0].id_usuario;


    // ==================================================
    // CREAR PERFIL SEGÚN ROL
    // ==================================================

    if (rol === 'VOLUNTARIO') {

      await client.query(
        `
        INSERT INTO perfil_voluntario
          (id_usuario, nombre)
        VALUES
          ($1, $2)
        `,
        [
          userId,
          nombre || 'Voluntario'
        ]
      );

    }


    else if (rol === 'ORGANIZACION') {

      // Validar CUIT
      if (!cuit) {
        throw new Error(
          'El CUIT es obligatorio para organizaciones'
        );
      }


      // Validar razón social
      if (!razon_social) {
        throw new Error(
          'La razón social es obligatoria para organizaciones'
        );
      }


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


    // Confirmar la transacción
    await client.query('COMMIT');


    res.status(201).json({

      message: 'Usuario registrado exitosamente',

      user: userRes.rows[0]

    });


  } catch (error) {

    // Si algo falla se deshacen todos los cambios
    await client.query('ROLLBACK');


    // Mostrar error real en la terminal
    console.error(
      'ERROR AL REGISTRAR USUARIO:',
      error
    );


    res.status(500).json({

      error: 'Error al registrar usuario',

      details: error.message

    });


  } finally {

    // Liberar la conexión al pool
    client.release();

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

      process.env.JWT_SECRET || 'secret_key',

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