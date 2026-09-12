import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function MapaLeaflet({
  latitud,
  longitud,
  titulo,
  zoom
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />

        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />

        <style>
          html, body, #map {
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
          }
        </style>
      </head>

      <body>
        <div id="map"></div>

        <script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        ></script>

        <script>
          const latitud = ${latitud};
          const longitud = ${longitud};

          const map = L.map('map').setView(
            [latitud, longitud],
            ${zoom}
          );

          L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
              maxZoom: 19,
              attribution: '&copy; OpenStreetMap contributors'
            }
          ).addTo(map);

          L.marker([latitud, longitud])
            .addTo(map)
            .bindPopup(${JSON.stringify(titulo)})
            .openPopup();
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled
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