// ======================================================
// FORMATEAR UBICACIÓN
// CALLE, NÚMERO, LOCALIDAD Y PROVINCIA
// ======================================================

export const formatearUbicacion = (ubicacion) => {

  if (!ubicacion) {
    return '';
  }

  const direccion = String(
    ubicacion.nombre ||
    ubicacion.direccion ||
    ''
  ).trim();

  const localidad = String(
    ubicacion.localidad || ''
  ).trim();

  const provincia = String(
    ubicacion.provincia || ''
  ).trim();


  // Evitar repetir localidad o provincia
  // cuando ya forman parte de la dirección.

  const normalizar = (texto) =>
    texto.trim().toLocaleLowerCase('es-AR');

  const componentesDireccion = direccion
    .split(',')
    .map(normalizar);


  const partes = [];

  if (direccion) {
    partes.push(direccion);
  }

  if (
    localidad &&
    !componentesDireccion.includes(
      normalizar(localidad)
    )
  ) {
    partes.push(localidad);
  }

  if (
    provincia &&
    !componentesDireccion.includes(
      normalizar(provincia)
    )
  ) {
    partes.push(provincia);
  }

  return partes.join(', ');

};