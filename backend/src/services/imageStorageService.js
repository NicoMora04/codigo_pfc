// ======================================================
// SERVICIO BASE DE IMÁGENES
// ======================================================
//
// Centraliza las reglas comunes de validación.
// La carga física de archivos se delegará posteriormente
// a un proveedor mediante ImageStorageAdapter.
// ======================================================

const TIPOS_IMAGEN_PERMITIDOS = [
  'LOGO',
  'PORTADA',
  'GALERIA'
];

const MIME_PERMITIDOS = [
  'image/jpeg',
  'image/png'
];

const TAMANO_MAXIMO_BYTES =
  5 * 1024 * 1024;


// ======================================================
// VALIDAR DATOS DE IMAGEN
// ======================================================

exports.validarImagen = ({
  tipo,
  mimeType,
  tamanoBytes
}) => {

  if (
    !TIPOS_IMAGEN_PERMITIDOS.includes(tipo)
  ) {

    const error = new Error(
      'El tipo de imagen no está permitido'
    );

    error.status = 400;

    throw error;
  }


  if (
    !MIME_PERMITIDOS.includes(mimeType)
  ) {

    const error = new Error(
      'El formato de la imagen no está permitido'
    );

    error.status = 400;

    throw error;
  }


  if (
    !Number.isInteger(tamanoBytes) ||
    tamanoBytes <= 0
  ) {

    const error = new Error(
      'El tamaño de la imagen no es válido'
    );

    error.status = 400;

    throw error;
  }


  if (
    tamanoBytes > TAMANO_MAXIMO_BYTES
  ) {

    const error = new Error(
      'La imagen supera el tamaño máximo permitido'
    );

    error.status = 413;

    throw error;
  }


  return true;
};


// ======================================================
// CONSTANTES EXPUESTAS
// ======================================================

exports.TIPOS_IMAGEN_PERMITIDOS =
  TIPOS_IMAGEN_PERMITIDOS;

exports.MIME_PERMITIDOS =
  MIME_PERMITIDOS;

exports.TAMANO_MAXIMO_BYTES =
  TAMANO_MAXIMO_BYTES;