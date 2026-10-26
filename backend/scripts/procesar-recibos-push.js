// ======================================================
// EJECUTAR PROCESADOR DE RECIBOS PUSH
// ACTIVIDAD 3.3.1
// ======================================================

const pool =
  require('../src/config/db');

const reciboPushWorker =
  require('../src/services/reciboPushWorker');


// ======================================================
// EJECUCIÓN
// ======================================================

const ejecutar = async () => {

  console.log(
    '\nINICIANDO PROCESADOR DE RECIBOS PUSH\n'
  );


  const resultado =
    await reciboPushWorker.procesarRecibos();


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