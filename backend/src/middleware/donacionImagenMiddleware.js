const multer = require('multer');
const path = require('path');
const fs = require('fs');


// ======================================================
// DIRECTORIO DE ALMACENAMIENTO
// ======================================================

const directorioImagenes =
  path.join(
    __dirname,
    '../../uploads/donaciones'
  );


if (
  !fs.existsSync(
    directorioImagenes
  )
) {

  fs.mkdirSync(
    directorioImagenes,
    {
      recursive: true
    }
  );

}


// ======================================================
// TIPOS Y EXTENSIONES PERMITIDAS
// ======================================================

const tiposPermitidos =
  [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];


const extensionesPermitidas =
  [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp'
  ];


// ======================================================
// DETECTAR TIPO REAL POR FIRMA DEL ARCHIVO
// ======================================================

const detectarTipoReal =
  (buffer) => {

    if (
      !buffer ||
      buffer.length < 3
    ) {

      return null;

    }


    // JPEG:
    // FF D8 FF

    if (
      buffer[0] === 0xFF &&
      buffer[1] === 0xD8 &&
      buffer[2] === 0xFF
    ) {

      return {

        mimetype:
          'image/jpeg',

        extensiones:
          [
            '.jpg',
            '.jpeg'
          ]

      };

    }


    // PNG:
    // 89 50 4E 47 0D 0A 1A 0A

    if (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4E &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0D &&
      buffer[5] === 0x0A &&
      buffer[6] === 0x1A &&
      buffer[7] === 0x0A
    ) {

      return {

        mimetype:
          'image/png',

        extensiones:
          [
            '.png'
          ]

      };

    }


    // WEBP:
    // RIFF .... WEBP

    if (
      buffer.length >= 12 &&
      buffer
        .toString(
          'ascii',
          0,
          4
        ) === 'RIFF' &&
      buffer
        .toString(
          'ascii',
          8,
          12
        ) === 'WEBP'
    ) {

      return {

        mimetype:
          'image/webp',

        extensiones:
          [
            '.webp'
          ]

      };

    }


    return null;

  };


// ======================================================
// VALIDACIÓN INICIAL DE MIME Y EXTENSIÓN
// ======================================================

const fileFilter =
  (
    req,
    file,
    cb
  ) => {

    const extension =
      path
        .extname(
          file.originalname
        )
        .toLowerCase();


    const tipoValido =
      tiposPermitidos.includes(
        file.mimetype
      );


    const extensionValida =
      extensionesPermitidas.includes(
        extension
      );


    if (
      !tipoValido ||
      !extensionValida
    ) {

      const error =
        new Error(
          'La imagen debe ser JPG, PNG o WEBP'
        );


      error.status =
        400;


      return cb(
        error,
        false
      );

    }


    cb(
      null,
      true
    );

  };


// ======================================================
// ALMACENAMIENTO CON VALIDACIÓN DEL CONTENIDO REAL
// ======================================================

const storage = {

  _handleFile(
    req,
    file,
    cb
  ) {

    const extension =
      path
        .extname(
          file.originalname
        )
        .toLowerCase();


    const nombreArchivo =
      `donacion-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${extension}`;


    const rutaArchivo =
      path.join(
        directorioImagenes,
        nombreArchivo
      );


    const salida =
      fs.createWriteStream(
        rutaArchivo
      );


    let cabecera =
      Buffer.alloc(0);


    let finalizado =
      false;


    const finalizarConError =
      (
        error
      ) => {

        if (finalizado) {
          return;
        }


        finalizado =
          true;


        fs.unlink(
          rutaArchivo,
          () => {

            cb(
              error
            );

          }
        );

      };


    file.stream.on(
      'data',
      (chunk) => {

        if (
          cabecera.length >=
          12
        ) {

          return;

        }


        const faltantes =
          12 -
          cabecera.length;


        cabecera =
          Buffer.concat([
            cabecera,
            chunk.subarray(
              0,
              faltantes
            )
          ]);

      }
    );


    file.stream.on(
      'error',
      (error) => {

        finalizarConError(
          error
        );

      }
    );


    salida.on(
      'error',
      (error) => {

        finalizarConError(
          error
        );

      }
    );


    salida.on(
      'finish',
      () => {

        if (finalizado) {
          return;
        }


        const tipoReal =
          detectarTipoReal(
            cabecera
          );


        const contenidoValido =
          tipoReal &&
          tipoReal.mimetype ===
            file.mimetype &&
          tipoReal.extensiones
            .includes(
              extension
            );


        if (
          !contenidoValido
        ) {

          const error =
            new Error(
              'El contenido del archivo no corresponde a una imagen JPG, PNG o WEBP válida'
            );


          error.status =
            400;


          return finalizarConError(
            error
          );

        }


        finalizado =
          true;


        cb(
          null,
          {

            destination:
              directorioImagenes,

            filename:
              nombreArchivo,

            path:
              rutaArchivo,

            size:
              salida.bytesWritten

          }
        );

      }
    );


    file.stream.pipe(
      salida
    );

  },


  _removeFile(
    req,
    file,
    cb
  ) {

    const rutaArchivo =
      file.path;


    delete file.destination;
    delete file.filename;
    delete file.path;


    if (!rutaArchivo) {

      return cb(
        null
      );

    }


    fs.unlink(
      rutaArchivo,
      (error) => {

        if (
          error &&
          error.code !==
            'ENOENT'
        ) {

          return cb(
            error
          );

        }


        cb(
          null
        );

      }
    );

  }

};


// ======================================================
// CONFIGURACIÓN MULTER
// ======================================================

const uploadDonacionImagen =
  multer({

    storage,

    limits: {

      fileSize:
        5 * 1024 * 1024

    },

    fileFilter

  });


module.exports =
  uploadDonacionImagen;