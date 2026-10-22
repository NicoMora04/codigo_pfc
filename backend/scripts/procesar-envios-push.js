// ======================================================
// EJECUTAR PROCESADOR PUSH
// ACTIVIDAD 3.3.1
// ======================================================

const pool =
  require('../src/config/db');

const envioPushWorker =
  require('../src/services/envioPushWorker');


const ejecutar = async () => {

  console.log(
    '\nINICIANDO PROCESADOR DE NOTIFICACIONES PUSH\n'
  );

  const resultado =
    await envioPushWorker.procesarLote();


  console.log(
    '\nRESULTADO DEL PROCESAMIENTO\n'
  );

  console.log(resultado);

};


ejecutar()
  .catch(error => {

    console.error(
      'Error en el procesador:',
      error
    );

    process.exitCode = 1;

  })
  .finally(async () => {

    await pool.end();

  });