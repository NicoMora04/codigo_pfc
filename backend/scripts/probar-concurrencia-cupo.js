const {
  API_URL = 'http://localhost:3000/api',
  ORG_TOKEN,
  INSCRIPCION_1,
  INSCRIPCION_2,
} = process.env;


if (
  !ORG_TOKEN ||
  !INSCRIPCION_1 ||
  !INSCRIPCION_2
) {

  console.error(
    'Faltan ORG_TOKEN, INSCRIPCION_1 o INSCRIPCION_2'
  );

  process.exit(1);
}


const aceptar = async (
  idInscripcion
) => {

  const inicio =
    Date.now();


  const response =
    await fetch(
      `${API_URL}/inscripciones/${idInscripcion}/aceptar`,
      {
        method:
          'PATCH',

        headers: {
          Authorization:
            `Bearer ${ORG_TOKEN}`,
        },
      }
    );


  const texto =
    await response.text();


  let body;

  try {

    body =
      JSON.parse(texto);

  }
  catch {

    body =
      texto;

  }


  return {
    idInscripcion,
    status:
      response.status,
    duracionMs:
      Date.now() - inicio,
    body,
  };

};


const ejecutar =
  async () => {

    console.log(
      '\nDisparando las dos aceptaciones simultáneamente...\n'
    );


    const resultados =
      await Promise.all([
        aceptar(
          INSCRIPCION_1
        ),

        aceptar(
          INSCRIPCION_2
        ),
      ]);


    for (
      const resultado
      of resultados
    ) {

      console.log(
        '--------------------------------'
      );

      console.log(
        'Inscripción:',
        resultado.idInscripcion
      );

      console.log(
        'HTTP:',
        resultado.status
      );

      console.log(
        'Duración:',
        `${resultado.duracionMs} ms`
      );

      console.log(
        'Respuesta:',
        resultado.body
      );

    }


    const estados =
      resultados
        .map(
          resultado =>
            resultado.status
        )
        .sort(
          (a, b) =>
            a - b
        );


    console.log(
      '\nResultado final:',
      estados
    );


    if (
      estados[0] === 200 &&
      estados[1] === 409
    ) {

      console.log(
        '\nOK - Solo una inscripción obtuvo el último cupo.'
      );

      process.exit(0);

    }


    console.error(
      '\nERROR - El resultado esperado era un HTTP 200 y un HTTP 409.'
    );

    process.exit(1);

  };


ejecutar()
  .catch(
    error => {

      console.error(
        '\nError ejecutando la prueba:',
        error
      );

      process.exit(1);

    }
  );