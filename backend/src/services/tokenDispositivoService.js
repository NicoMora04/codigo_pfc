const tokenDispositivoRepository =
  require('../repositories/tokenDispositivoRepository');


// ======================================================
// VALIDACIONES
// ======================================================

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


const expoTokenRegex =
  /^Expo(?:nent)?PushToken\[[^\]\s]{8,}\]$/;


const crearError = (
  mensaje,
  status
) => {

  const error = new Error(mensaje);

  error.status = status;

  return error;

};


// ======================================================
// VALIDAR TOKEN
// ======================================================

const validarToken = (
  token
) => {

  if (
    typeof token !== 'string' ||
    token.length > 512 ||
    !expoTokenRegex.test(token)
  ) {

    throw crearError(
      'El token de dispositivo no es válido',
      400
    );

  }

};


// ======================================================
// REGISTRAR TOKEN
// ======================================================

const registrarToken = async ({
  idUsuario,
  token,
  plataforma
}) => {

  // Validar usuario

  if (
    typeof idUsuario !== 'string' ||
    !uuidRegex.test(idUsuario)
  ) {

    throw crearError(
      'El identificador de usuario no es válido',
      400
    );

  }


  // Validar token

  validarToken(token);


  // Validar plataforma

  if (
    typeof plataforma !== 'string'
  ) {

    throw crearError(
      'La plataforma no es válida',
      400
    );

  }

  const plataformaNormalizada =
    plataforma.trim().toUpperCase();

  if (
    !['ANDROID', 'IOS'].includes(
      plataformaNormalizada
    )
  ) {

    throw crearError(
      'La plataforma debe ser ANDROID o IOS',
      400
    );

  }


  // Registrar dispositivo

  const dispositivo =
    await tokenDispositivoRepository.registrar(
      idUsuario,
      token,
      plataformaNormalizada
    );


  // No reasignar tokens activos de otras cuentas

  if (!dispositivo) {

    throw crearError(
      'El dispositivo está asociado a otra sesión activa',
      409
    );

  }


  return dispositivo;

};


// ======================================================
// DESACTIVAR TOKEN
// ======================================================

const desactivarToken = async ({
  idUsuario,
  token
}) => {

  if (
    typeof idUsuario !== 'string' ||
    !uuidRegex.test(idUsuario)
  ) {

    throw crearError(
      'El identificador de usuario no es válido',
      400
    );

  }

  validarToken(token);

  return await tokenDispositivoRepository.desactivar(
    idUsuario,
    token
  );

};


// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  registrarToken,
  desactivarToken
};