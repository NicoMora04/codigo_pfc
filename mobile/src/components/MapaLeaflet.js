import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function MapaLeaflet({
  oportunidades = [],
  zoom = 13,
  onVerDetalle,
  mostrarBotonDetalle = true,
}) {

  // =====================================================
  // OPORTUNIDADES CON COORDENADAS VÁLIDAS
  // =====================================================

  const oportunidadesValidas = oportunidades.filter(
    (oportunidad) =>
      oportunidad.latitud != null &&
      oportunidad.longitud != null &&
      Number.isFinite(Number(oportunidad.latitud)) &&
      Number.isFinite(Number(oportunidad.longitud))
  );


  // =====================================================
  // CENTRO INICIAL DEL MAPA
  // =====================================================

  const centroLatitud =
    oportunidadesValidas.length > 0
      ? Number(oportunidadesValidas[0].latitud)
      : -31.6333;

  const centroLongitud =
    oportunidadesValidas.length > 0
      ? Number(oportunidadesValidas[0].longitud)
      : -60.7000;


  // =====================================================
  // BOTÓN VER DETALLE
  // =====================================================

const crearBotonDetalle = (idOportunidad) => {

  if (
    !mostrarBotonDetalle ||
    !idOportunidad
  ) {
    return '';
  }

  const idSeguro =
    JSON.stringify(
      String(idOportunidad)
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
  // ZONAS DE UBICACIÓN APROXIMADA
  // =====================================================

  const zonasAproximadas = oportunidadesValidas
    .filter((oportunidad) => {

      const radioKm =
        Number(oportunidad.radio_km);

      return (
        Number.isFinite(radioKm) &&
        radioKm > 0
      );
    })
    .map((oportunidad) => {

      const latitud =
        Number(oportunidad.latitud);

      const longitud =
        Number(oportunidad.longitud);

      const radioKm =
        Number(oportunidad.radio_km);

      const radioMetros =
        radioKm * 1000;

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
          <strong>${titulo}</strong>
          <br/>

          <span>${organizacion}</span>
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
          [${latitud}, ${longitud}],
          {
            radius: ${radioMetros},
            color: '#D97706',
            fillColor: '#F59E0B',
            fillOpacity: 0.18,
            weight: 2
          }
        )
        .addTo(map)
        .bindPopup(
          ${JSON.stringify(contenidoPopup)}
        );
      `;
    })
    .join('\n');


  // =====================================================
  // AGRUPAR OPORTUNIDADES CON LA MISMA COORDENADA
  // =====================================================

  const oportunidadesAgrupadas =
    oportunidadesValidas.reduce(
      (grupos, oportunidad) => {

        const latitud =
          Number(oportunidad.latitud);

        const longitud =
          Number(oportunidad.longitud);

        const clave =
          `${latitud},${longitud}`;

        if (!grupos[clave]) {
          grupos[clave] = [];
        }

        grupos[clave].push(
          oportunidad
        );

        return grupos;

      },
      {}
    );


  // =====================================================
  // CREAR MARCADORES
  // =====================================================

  const marcadores =
    Object.values(oportunidadesAgrupadas)
      .map((grupo) => {

        const primera =
          grupo[0];

        const latitud =
          Number(primera.latitud);

        const longitud =
          Number(primera.longitud);


        // =================================================
        // VARIAS OPORTUNIDADES EN EL MISMO PUNTO
        // =================================================

        if (grupo.length > 1) {

          const listaOportunidades =
            grupo
              .map((oportunidad) => {

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
                  Number.isFinite(radioKm) &&
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
              })
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
                  0 2px 6px rgba(0,0,0,0.35);
              "
            >
              ${grupo.length}
            </div>
          `;


          return `
            L.marker(
              [${latitud}, ${longitud}],
              {
                icon: L.divIcon({
                  className: '',
                  html:
                    ${JSON.stringify(iconoAgrupado)},
                  iconSize: [38, 38],
                  iconAnchor: [19, 19]
                })
              }
            )
            .addTo(map)
            .bindPopup(
              ${JSON.stringify(contenidoPopup)},
              {
                maxWidth: 300
              }
            );
          `;
        }


        // =================================================
        // UNA SOLA OPORTUNIDAD
        // =================================================

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
          Number.isFinite(radioKm) &&
          radioKm > 0;

        const botonDetalle =
          crearBotonDetalle(
            oportunidad.id_oportunidad
          );


        // =================================================
        // UBICACIÓN APROXIMADA
        // =================================================

        if (tieneRadio) {

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
            L.marker(
              [${latitud}, ${longitud}]
            )
            .addTo(map)
            .bindPopup(
              ${JSON.stringify(contenidoPopup)}
            );
          `;
        }


        // =================================================
        // UBICACIÓN EXACTA
        // =================================================

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
                font-size: 12px;
              "
            >
              Ubicación exacta
            </span>

            <br/>

            ${botonDetalle}

          </div>
        `;


        return `
          L.marker(
            [${latitud}, ${longitud}]
          )
          .addTo(map)
          .bindPopup(
            ${JSON.stringify(contenidoPopup)}
          );
        `;
      })
      .join('\n');


  // =====================================================
  // HTML LEAFLET
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
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
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
            min-width: 170px;
          }

          .btn-ver-detalle {
            cursor: pointer;
          }

        </style>

      </head>


      <body>

        <div id="map"></div>


        <script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        ></script>


        <script>

          function verDetalle(idOportunidad) {

            if (
              window.ReactNativeWebView &&
              window.ReactNativeWebView.postMessage
            ) {

              window.ReactNativeWebView.postMessage(
                JSON.stringify({
                  tipo: 'VER_DETALLE',
                  idOportunidad: idOportunidad
                })
              );
            }
          }

          const map = L.map('map');

          if (${oportunidadesValidas.length} === 0) {

            map.setView(
              [${centroLatitud}, ${centroLongitud}],
              ${zoom}
            );

          } else if (${oportunidadesValidas.length} === 1) {

            map.setView(
              [${centroLatitud}, ${centroLongitud}],
              ${zoom}
            );

          }


          L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
              maxZoom: 19,
              attribution:
                '&copy; OpenStreetMap contributors'
            }
          ).addTo(map);


          // ==============================================
          // ZONAS APROXIMADAS
          // ==============================================

          ${zonasAproximadas}


          // ==============================================
          // MARCADORES
          // ==============================================

          ${marcadores}


          if (${oportunidadesValidas.length} > 1) {
            const puntos = [
              ${oportunidadesValidas
                .map(
                  (oportunidad) =>
                    `[${Number(oportunidad.latitud)}, ${Number(oportunidad.longitud)}]`
                )
                .join(',')}
            ];

            const limites =
              L.latLngBounds(puntos);

            map.fitBounds(
              limites,
              {
                padding: [30, 30],
                maxZoom: 15
              }
            );
          }

        </script>

      </body>

    </html>
  `;


  // =====================================================
  // MENSAJES WEBVIEW → REACT NATIVE
  // =====================================================

  const manejarMensajeMapa = (event) => {

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
        mensaje.tipo === 'VER_DETALLE' &&
        mensaje.idOportunidad
      ) {

        console.log(
          'ABRIENDO OPORTUNIDAD:',
          mensaje.idOportunidad
        );


        if (onVerDetalle) {

          onVerDetalle(
            mensaje.idOportunidad
          );

        }

      }

    } catch (error) {

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

    <View style={styles.container}>

      <WebView
        originWhitelist={['*']}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled
        onMessage={manejarMensajeMapa}
      />

    </View>

  );
}


const styles = StyleSheet.create({

  container: {
    width: '100%',
    height: 400,
    overflow: 'hidden',
  },

});