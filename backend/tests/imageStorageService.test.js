const imageStorageService =
  require('../src/services/imageStorageService');


describe(
  'imageStorageService',
  () => {

    test(
      'acepta una imagen JPEG válida',
      () => {

        expect(
          imageStorageService.validarImagen({
            tipo: 'GALERIA',
            mimeType: 'image/jpeg',
            tamanoBytes: 1000000
          })
        ).toBe(true);

      }
    );


    test(
      'acepta una imagen PNG válida',
      () => {

        expect(
          imageStorageService.validarImagen({
            tipo: 'LOGO',
            mimeType: 'image/png',
            tamanoBytes: 500000
          })
        ).toBe(true);

      }
    );


    test(
      'rechaza un formato no permitido',
      () => {

        expect(() => {

          imageStorageService.validarImagen({
            tipo: 'GALERIA',
            mimeType: 'image/webp',
            tamanoBytes: 1000000
          });

        }).toThrow(
          'El formato de la imagen no está permitido'
        );

      }
    );


    test(
      'rechaza una imagen mayor a 5 MiB',
      () => {

        try {

          imageStorageService.validarImagen({
            tipo: 'PORTADA',
            mimeType: 'image/jpeg',
            tamanoBytes: 6 * 1024 * 1024
          });

          throw new Error(
            'La validación debía rechazar la imagen'
          );

        }
        catch (error) {

          expect(
            error.status
          ).toBe(413);

          expect(
            error.message
          ).toBe(
            'La imagen supera el tamaño máximo permitido'
          );

        }

      }
    );


    test(
      'rechaza un tipo de imagen no permitido',
      () => {

        expect(() => {

          imageStorageService.validarImagen({
            tipo: 'AVATAR',
            mimeType: 'image/jpeg',
            tamanoBytes: 100000
          });

        }).toThrow(
          'El tipo de imagen no está permitido'
        );

      }
    );

  }
);