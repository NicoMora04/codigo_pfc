const tipoActividadRepository =
  require('../repositories/tipoActividadRepository');

exports.listarTiposActividad = async () => {

  const tiposActividad =
    await tipoActividadRepository.listarTiposActividad();

  return tiposActividad;
};