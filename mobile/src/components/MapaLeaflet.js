import React from 'react';

import {
  View,
  StyleSheet
} from 'react-native';

import {
  WebView
} from 'react-native-webview';


export default function MapaLeaflet({
  oportunidades = [],
  zoom = 13,
  onVerDetalle,
  mostrarBotonDetalle = true,
  ubicacionUsuario = null,
  tipoUbicacionUsuario = null,
  rutaCoordenadas = [],
}) {


  // =====================================================
  // OPORTUNIDADES CON COORDENADAS VÁLIDAS
  // =====================================================

  const oportunidadesValidas =
    oportunidades.filter(
      (oportunidad) => {

        const latitud =
          Number(
            oportunidad.latitud
          );

        const longitud =
          Number(
            oportunidad.longitud
          );


        return (

          oportunidad.latitud != null &&
          oportunidad.longitud != null &&

          Number.isFinite(
            latitud
          ) &&

          Number.isFinite(
            longitud
          ) &&

          latitud >= -90 &&
          latitud <= 90 &&

          longitud >= -180 &&
          longitud <= 180

        );

      }
    );


  // =====================================================
  // UBICACIÓN DEL USUARIO VÁLIDA
  // =====================================================

  const ubicacionUsuarioValida =

    ubicacionUsuario &&

    ubicacionUsuario.latitud != null &&

    ubicacionUsuario.longitud != null &&

    Number.isFinite(
      Number(
        ubicacionUsuario.latitud
      )
    ) &&

    Number.isFinite(
      Number(
        ubicacionUsuario.longitud
      )
    );


  // =====================================================
  // CENTRO INICIAL
  // =====================================================

  /*
    Siempre damos una vista inicial a Leaflet.

    Esto evita que el WebView quede gris mientras espera
    que se ejecute fitBounds().
  */

  const centroLatitud =

    ubicacionUsuarioValida

      ? Number(
          ubicacionUsuario.latitud
        )

      : oportunidadesValidas.length > 0

        ? Number(
            oportunidadesValidas[0]
              .latitud
          )

        : -31.6333;


  const centroLongitud =

    ubicacionUsuarioValida

      ? Number(
          ubicacionUsuario.longitud
        )

      : oportunidadesValidas.length > 0

        ? Number(
            oportunidadesValidas[0]
              .longitud
          )

        : -60.7000;


  // =====================================================
  // CLAVE DINÁMICA
  // =====================================================

  const claveMapa =
    JSON.stringify({

      oportunidades:
        oportunidadesValidas.map(
          (oportunidad) => ({

            id:
              oportunidad.id_oportunidad,

            latitud:
              Number(
                oportunidad.latitud
              ),

            longitud:
              Number(
                oportunidad.longitud
              ),

            radioKm:
              Number(
                oportunidad.radio_km
              ) || 0,

          })
        ),

      ubicacionUsuario:
        ubicacionUsuarioValida
          ? {

              latitud:
                Number(
                  ubicacionUsuario.latitud
                ),

              longitud:
                Number(
                  ubicacionUsuario.longitud
                ),

              tipo:
                tipoUbicacionUsuario,

            }
          : null,

      ruta:
        Array.isArray(
          rutaCoordenadas
        )
          ? rutaCoordenadas
          : [],

    });


  // =====================================================
  // BOTÓN VER DETALLE
  // =====================================================

  const crearBotonDetalle = (
    idOportunidad
  ) => {

    if (
      !mostrarBotonDetalle ||
      !idOportunidad
    ) {

      return '';

    }


    const idSeguro =
      JSON.stringify(
        String(
          idOportunidad
        )
      );


    return `
      <button
        type="button"
        onclick='verDetalle(${idSeguro})'
        style="
          margin-top: 8px;
          padding: 7px 11px;
          border: none;
          border-radius: 7px;
          background-color: #1F6F5C;
          color: white;
          font-weight: bold;
          font-size: 13px;
        "
      >
        Ver detalle
      </button>
    `;

  };


  // =====================================================
  // ZONAS APROXIMADAS
  // =====================================================

  /*
    Se dibujan normalmente, pero NO se agregan al fitBounds.

    El encuadre usa el centro de cada oportunidad.
  */

  const zonasAproximadas =

    oportunidadesValidas

      .filter(
        (oportunidad) => {

          const radioKm =
            Number(
              oportunidad.radio_km
            );


          return (

            Number.isFinite(
              radioKm
            ) &&

            radioKm > 0

          );

        }
      )

      .map(
        (
          oportunidad,
          indice
        ) => {

          const latitud =
            Number(
              oportunidad.latitud
            );


          const longitud =
            Number(
              oportunidad.longitud
            );


          const radioKm =
            Number(
              oportunidad.radio_km
            );


          const radioMetros =
            radioKm *
            1000;


          const titulo =
            oportunidad.titulo ||
            'Oportunidad';


          const organizacion =
            oportunidad.organizacion ||
            'Organización no especificada';


          const botonDetalle =
            crearBotonDetalle(
              oportunidad.id_oportunidad
            );


          const contenidoPopup = `
            <div>

              <strong>
                ${titulo}
              </strong>

              <br/>

              <span>
                ${organizacion}
              </span>

              <br/>

              <span
                style="
                  color: #D97706;
                  font-size: 12px;
                "
              >
                Ubicación aproximada
                (${radioKm} km de radio)
              </span>

              <br/>

              ${botonDetalle}

            </div>
          `;


          return `
            L.circle(
              [
                ${latitud},
                ${longitud}
              ],
              {
                radius:
                  ${radioMetros},

                color:
                  '#D97706',

                fillColor:
                  '#F59E0B',

                fillOpacity:
                  0.18,

                weight:
                  2
              }
            )
            .addTo(map)
            .bindPopup(
              ${JSON.stringify(
                contenidoPopup
              )}
            );
          `;

        }
      )

      .join('\n');


  // =====================================================
  // AGRUPAR OPORTUNIDADES
  // =====================================================

  const oportunidadesAgrupadas =
    oportunidadesValidas.reduce(
      (
        grupos,
        oportunidad
      ) => {

        const latitud =
          Number(
            oportunidad.latitud
          );


        const longitud =
          Number(
            oportunidad.longitud
          );


        const clave =
          `${latitud},${longitud}`;


        if (
          !grupos[clave]
        ) {

          grupos[clave] =
            [];

        }


        grupos[clave].push(
          oportunidad
        );


        return grupos;

      },
      {}
    );


  // =====================================================
  // MARCADORES
  // =====================================================

  const marcadores =

    Object.values(
      oportunidadesAgrupadas
    )

      .map(
        (grupo) => {

          const primera =
            grupo[0];


          const latitud =
            Number(
              primera.latitud
            );


          const longitud =
            Number(
              primera.longitud
            );


          // ===============================================
          // VARIAS OPORTUNIDADES EN EL MISMO PUNTO
          // ===============================================

          if (
            grupo.length > 1
          ) {

            const listaOportunidades =

              grupo

                .map(
                  (oportunidad) => {

                    const titulo =
                      oportunidad.titulo ||
                      'Oportunidad';


                    const organizacion =
                      oportunidad.organizacion ||
                      'Organización no especificada';


                    const radioKm =
                      Number(
                        oportunidad.radio_km
                      );


                    const esAproximada =

                      Number.isFinite(
                        radioKm
                      ) &&

                      radioKm > 0;


                    const botonDetalle =
                      crearBotonDetalle(
                        oportunidad.id_oportunidad
                      );


                    return `
                      <div
                        style="
                          margin-bottom: 14px;
                        "
                      >

                        <strong>
                          ${titulo}
                        </strong>

                        <br/>

                        <span>
                          ${organizacion}
                        </span>

                        <br/>

                        ${
                          esAproximada

                            ? `
                              <span
                                style="
                                  color: #D97706;
                                  font-size: 12px;
                                "
                              >
                                Ubicación aproximada
                                (${radioKm} km)
                              </span>
                            `

                            : `
                              <span
                                style="
                                  font-size: 12px;
                                "
                              >
                                Ubicación exacta
                              </span>
                            `
                        }

                        <br/>

                        ${botonDetalle}

                      </div>
                    `;

                  }
                )

                .join('');


            const contenidoPopup = `
              <div>

                <strong>
                  ${grupo.length}
                  oportunidades en esta ubicación
                </strong>

                <hr/>

                ${listaOportunidades}

              </div>
            `;


            const iconoAgrupado = `
              <div
                style="
                  width: 38px;
                  height: 38px;

                  border-radius: 50%;

                  background-color: #1F6F5C;

                  color: white;

                  display: flex;

                  align-items: center;

                  justify-content: center;

                  font-weight: bold;

                  font-size: 16px;

                  border: 3px solid white;

                  box-shadow:
                    0 2px 6px
                    rgba(0,0,0,0.35);
                "
              >
                ${grupo.length}
              </div>
            `;


            return `
              L.marker(
                [
                  ${latitud},
                  ${longitud}
                ],
                {
                  icon:
                    L.divIcon({

                      className:
                        '',

                      html:
                        ${JSON.stringify(
                          iconoAgrupado
                        )},

                      iconSize:
                        [38, 38],

                      iconAnchor:
                        [19, 19]

                    })
                }
              )
              .addTo(map)
              .bindPopup(
                ${JSON.stringify(
                  contenidoPopup
                )},
                {
                  maxWidth:
                    300
                }
              );
            `;

          }


          // ===============================================
          // UNA SOLA OPORTUNIDAD
          // ===============================================

          const oportunidad =
            primera;


          const titulo =
            oportunidad.titulo ||
            'Oportunidad';


          const organizacion =
            oportunidad.organizacion ||
            'Organización no especificada';


          const radioKm =
            Number(
              oportunidad.radio_km
            );


          const tieneRadio =

            Number.isFinite(
              radioKm
            ) &&

            radioKm > 0;


          const botonDetalle =
            crearBotonDetalle(
              oportunidad.id_oportunidad
            );


          const contenidoPopup = `
            <div>

              <strong>
                ${titulo}
              </strong>

              <br/>

              <span>
                ${organizacion}
              </span>

              <br/>

              ${
                tieneRadio

                  ? `
                    <span
                      style="
                        color: #D97706;
                        font-size: 12px;
                      "
                    >
                      Ubicación aproximada
                      (${radioKm} km de radio)
                    </span>
                  `

                  : `
                    <span
                      style="
                        font-size: 12px;
                      "
                    >
                      Ubicación exacta
                    </span>
                  `
              }

              <br/>

              ${botonDetalle}

            </div>
          `;


          return `
            L.marker(
              [
                ${latitud},
                ${longitud}
              ]
            )
            .addTo(map)
            .bindPopup(
              ${JSON.stringify(
                contenidoPopup
              )}
            );
          `;

        }
      )

      .join('\n');


  // =====================================================
  // MARCADOR DEL USUARIO
  // =====================================================

  const textoUbicacionUsuario =

    tipoUbicacionUsuario ===
      'MANUAL'

      ? 'Ubicación seleccionada'

      : 'Tu ubicación actual';


  const marcadorUsuario =

    ubicacionUsuarioValida

      ? `
        const iconoUsuario =
          L.divIcon({

            className:
              '',

            html:
              \`
                <div
                  style="
                    width: 14px;
                    height: 14px;

                    border-radius: 50%;

                    background-color: #2563EB;

                    border: 3px solid white;

                    box-shadow:
                      0 2px 7px
                      rgba(0,0,0,0.4);
                  "
                >
                </div>
              \`,

            iconSize:
              [14, 14],

            iconAnchor:
              [7, 7]

          });


        L.marker(
          [
            ${Number(
              ubicacionUsuario.latitud
            )},

            ${Number(
              ubicacionUsuario.longitud
            )}
          ],
          {
            icon:
              iconoUsuario,

            zIndexOffset:
              1000
          }
        )
        .addTo(map)
        .bindPopup(
          ${JSON.stringify(
            `<strong>${textoUbicacionUsuario}</strong>`
          )}
        );
      `

      : '';


  // =====================================================
  // RUTA OPENROUTESERVICE
  // =====================================================

  const rutaValida =

    Array.isArray(
      rutaCoordenadas
    ) &&

    rutaCoordenadas.length > 1;


  const rutaLeaflet =

    rutaValida

      ? rutaCoordenadas

          .filter(
            (coordenada) =>

              Array.isArray(
                coordenada
              ) &&

              coordenada.length >= 2
          )

          .map(
            (coordenada) => {

              const longitud =
                Number(
                  coordenada[0]
                );


              const latitud =
                Number(
                  coordenada[1]
                );


              return [

                latitud,

                longitud

              ];

            }
          )

          .filter(
            (
              [
                latitud,
                longitud
              ]
            ) =>

              Number.isFinite(
                latitud
              ) &&

              Number.isFinite(
                longitud
              )
          )

      : [];


  // =====================================================
  // POLYLINE
  // =====================================================

  const rutaHtml =

    rutaLeaflet.length > 1

      ? `
        L.polyline(
          ${JSON.stringify(
            rutaLeaflet
          )},
          {
            color:
              '#3388FF',

            weight:
              5,

            opacity:
              0.85
          }
        )
        .addTo(map);
      `

      : '';


  // =====================================================
  // PUNTOS PARA EL ENCUADRE
  // =====================================================

  /*
    La regla es simple:

    oportunidades
    +
    ubicación del usuario si existe
    +
    ruta si existe
  */

  const puntosEncuadre = [

    ...oportunidadesValidas.map(
      (oportunidad) => [

        Number(
          oportunidad.latitud
        ),

        Number(
          oportunidad.longitud
        )

      ]
    ),


    ...(ubicacionUsuarioValida

      ? [[

          Number(
            ubicacionUsuario.latitud
          ),

          Number(
            ubicacionUsuario.longitud
          )

        ]]

      : []),


    ...rutaLeaflet,

  ];


  const puntosEncuadreValidos =
    puntosEncuadre.filter(
      (
        [
          latitud,
          longitud
        ]
      ) =>

        Number.isFinite(
          latitud
        ) &&

        Number.isFinite(
          longitud
        )
    );


  // =====================================================
  // HTML
  // =====================================================

  const html = `
    <!DOCTYPE html>

    <html>

      <head>

        <meta
          name="viewport"
          content="
            width=device-width,
            initial-scale=1.0,
            maximum-scale=1.0,
            user-scalable=no
          "
        />


        <link
          rel="stylesheet"
          href="
            https://unpkg.com/leaflet@1.9.4/dist/leaflet.css
          "
        />


        <style>

          html,
          body,
          #map {

            height: 100%;
            width: 100%;

            margin: 0;
            padding: 0;

          }


          .leaflet-popup-content {

            min-width:
              170px;

          }


          button {

            cursor:
              pointer;

          }

        </style>

      </head>


      <body>

        <div id="map"></div>


        <script
          src="
            https://unpkg.com/leaflet@1.9.4/dist/leaflet.js
          "
        >
        </script>


        <script>

          // ==============================================
          // VER DETALLE
          // ==============================================

          function verDetalle(
            idOportunidad
          ) {

            if (
              window.ReactNativeWebView &&
              window.ReactNativeWebView
                .postMessage
            ) {

              window
                .ReactNativeWebView
                .postMessage(

                  JSON.stringify({

                    tipo:
                      'VER_DETALLE',

                    idOportunidad:
                      idOportunidad

                  })

                );

            }

          }


          // ==============================================
          // CREACIÓN DEL MAPA
          // ==============================================

          /*
            IMPORTANTE:

            Leaflet recibe una vista inicial inmediatamente.

            De esta manera los tiles ya tienen coordenadas y
            zoom válidos desde el primer render.
          */

          const map =
            L.map(
              'map',
              {

                zoomControl:
                  true,

                dragging:
                  true,

                touchZoom:
                  true,

                doubleClickZoom:
                  true

              }
            )
            .setView(
              [
                ${centroLatitud},
                ${centroLongitud}
              ],
              ${zoom}
            );


          // ==============================================
          // OPENSTREETMAP
          // ==============================================

          L.tileLayer(

            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',

            {

              maxZoom:
                19,

              attribution:
                '&copy; OpenStreetMap contributors'

            }

          )
          .addTo(
            map
          );


          // ==============================================
          // ELEMENTOS
          // ==============================================

          ${zonasAproximadas}

          ${marcadores}

          ${marcadorUsuario}

          ${rutaHtml}


          // ==============================================
          // PUNTOS DE ENCUADRE
          // ==============================================

          const puntosEncuadre =
            ${JSON.stringify(
              puntosEncuadreValidos
            )};


          // ==============================================
          // AJUSTAR VISTA
          // ==============================================

          function ajustarVista() {

            try {

              map.invalidateSize();


              if (
                puntosEncuadre.length ===
                0
              ) {

                return;

              }


              if (
                puntosEncuadre.length ===
                1
              ) {

                map.setView(
                  puntosEncuadre[0],
                  ${zoom},
                  {
                    animate:
                      false
                  }
                );


                return;

              }


              const limites =
                L.latLngBounds(
                  puntosEncuadre
                );


              if (
                limites.isValid()
              ) {

                map.fitBounds(
                  limites,
                  {

                    paddingTopLeft:
                      [35, 35],

                    paddingBottomRight:
                      [35, 35],

                    /*
                      Con oportunidades alejadas permitimos
                      que Leaflet reduzca el zoom todo lo
                      necesario.
                    */

                    animate:
                      false

                  }
                );

              }

            }
            catch (
              error
            ) {

              /*
                Si por algún motivo falla el fitBounds,
                NO dejamos el mapa sin vista.

                Conserva el setView inicial.
              */

              console.log(
                'Error ajustando vista:',
                error
              );

            }

          }


          // ==============================================
          // AJUSTE DESPUÉS DEL MONTAJE
          // ==============================================

          setTimeout(
            ajustarVista,
            250
          );


          setTimeout(
            ajustarVista,
            700
          );

        </script>

      </body>

    </html>
  `;


  // =====================================================
  // MENSAJES WEBVIEW -> REACT NATIVE
  // =====================================================

  const manejarMensajeMapa =
    (
      event
    ) => {

      try {

        const mensaje =
          JSON.parse(
            event.nativeEvent.data
          );


        console.log(
          'MENSAJE RECIBIDO DESDE MAPA:',
          mensaje
        );


        if (

          mensaje.tipo ===
            'VER_DETALLE' &&

          mensaje.idOportunidad

        ) {

          onVerDetalle?.(
            mensaje.idOportunidad
          );

        }

      }
      catch (
        error
      ) {

        console.log(
          'ERROR MENSAJE MAPA:',
          error
        );

      }

    };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <View
      style={
        styles.container
      }
    >

      <WebView

        key={
          claveMapa
        }

        originWhitelist={[
          '*'
        ]}

        source={{
          html
        }}

        javaScriptEnabled={
          true
        }

        domStorageEnabled={
          true
        }

        nestedScrollEnabled={
          true
        }

        onMessage={
          manejarMensajeMapa
        }

      />

    </View>

  );

}


// =====================================================
// ESTILOS
// =====================================================

const styles =
  StyleSheet.create({

    container: {

      width:
        '100%',

      height:
        400,

      overflow:
        'hidden',

    },

  });