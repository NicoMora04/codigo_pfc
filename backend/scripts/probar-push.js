// ======================================================
// PRUEBA DE ENVÍO PUSH
// ACTIVIDAD 3.3.1
// ======================================================

const pool =
  require('../src/config/db');

const expoPushService =
  require('../src/services/expoPushService');


// ======================================================
// EJECUTAR PRUEBA
// ======================================================

const probarPush = async () => {

  // 1. Obtener UUID del usuario

  const idUsuario =
    process.argv[2];


  if (!idUsuario) {

    throw new Error(
      'Debés indicar el UUID del voluntario'
    );

  }


  // 2. Preparar mensaje de prueba

  const titulo =
    'Voluntariado Geolocalizado';

  const mensaje =
    '¡Las notificaciones push están funcionando!';


  // 3. Enviar notificación

  const resultado =
    await expoPushService.enviarPushAUsuario({

      idUsuario,

      titulo,

      mensaje,

      data: {
        tipo: 'PRUEBA_PUSH'
      }

    });


  // 4. Mostrar resultado

  console.log(
    '\nRESULTADO DE LA PRUEBA PUSH'
  );

  console.log(
    'Dispositivos encontrados:',
    resultado.dispositivos
  );

  console.log(
    'Mensajes aceptados por Expo:',
    resultado.aceptados
  );

  console.log(
    'Mensajes rechazados:',
    resultado.rechazados
  );

  console.log(
    'IDs para consultar recibos:',
    resultado.idsRecibos
  );

};


// ======================================================
// EJECUCIÓN
// ======================================================

probarPush()
  .catch((error) => {

    console.error(
      'Error al probar push:',
      error.message
    );

    process.exitCode = 1;

  })
  .finally(async () => {

    await pool.end();

  });