// ======================================================
// CONSULTAR RECIBOS DE NOTIFICACIONES PUSH
// ACTIVIDAD 3.3.1
// ======================================================

const expoPushService =
  require('../src/services/expoPushService');


// ======================================================
// EJECUTAR CONSULTA
// ======================================================

const consultar = async () => {

  // Obtener identificadores desde la terminal

  const idsRecibos =
    process.argv.slice(2);


  if (idsRecibos.length === 0) {

    throw new Error(
      'Debés proporcionar al menos un ID de recibo'
    );

  }


  // Consultar Expo

  const recibos =
    await expoPushService.consultarRecibos(
      idsRecibos
    );


  console.log(
    '\nRESULTADOS DE ENTREGA PUSH\n'
  );


  // Mostrar resultado por notificación

  for (const id of idsRecibos) {

    const recibo = recibos[id];


    if (!recibo) {

      console.log(
        `Recibo ${id}: todavía no disponible`
      );

      continue;

    }


    if (recibo.status === 'ok') {

      console.log(
        `Recibo ${id}: ACEPTADO POR FCM/APNS`
      );

    }
    else {

      console.error(
        `Recibo ${id}: ERROR`
      );

      console.error(
        'Motivo:',
        recibo.message
      );

      console.error(
        'Código:',
        recibo.details?.error || 'Sin código'
      );

    }

  }

};


// ======================================================
// EJECUCIÓN
// ======================================================

consultar()
  .catch(error => {

    console.error(
      'Error al consultar recibos:',
      error.message
    );

    process.exitCode = 1;

  });