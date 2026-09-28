import axios from 'axios';
import BASE_URL from '../config/api';

const authHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const obtenerOrganizacionesDonacion = async (
  token,
  filtros = {}
) => {

  const response = await axios.get(
    `${BASE_URL}/organizaciones/disponibles-donacion`,
    {
      ...authHeaders(token),
      params: filtros,
    }
  );

  return response.data;
};


export const obtenerDetalleOrganizacionDonacion =
  async (
    token,
    idOrganizacion
  ) => {

    const response =
      await axios.get(
        `${BASE_URL}/organizaciones/${idOrganizacion}/detalle-donacion`,
        authHeaders(token)
      );


    return response.data;

  };


  export const obtenerCategoriasDonacion =
  async (token) => {

    const response =
      await axios.get(
        `${BASE_URL}/donaciones/categorias`,
        authHeaders(token)
      );

    return response.data;

  };


  // ======================================================
// REGISTRAR DONACIÓN
// ======================================================

export const registrarDonacion =
  async (
    token,
    datos,
    idempotencyKey
  ) => {

    const response =
      await axios.post(
        `${BASE_URL}/donaciones`,
        datos,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,

            'Idempotency-Key':
              idempotencyKey
          }
        }
      );


    return response.data;

  };


  // ======================================================
// SUBIR IMAGEN DE UNA DONACIÓN
// ======================================================

export const subirImagenDonacion =
  async (
    token,
    idDonacion,
    imagen
  ) => {

    const formData =
      new FormData();


    const nombreArchivo =
      imagen.fileName ||
      `donacion-${Date.now()}.jpg`;


    const tipoArchivo =
      imagen.mimeType ||
      'image/jpeg';


    formData.append(
      'imagen',
      {
        uri:
          imagen.uri,

        name:
          nombreArchivo,

        type:
          tipoArchivo
      }
    );


    const response =
      await axios.patch(
        `${BASE_URL}/donaciones/${idDonacion}/imagen`,
        formData,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );


    return response.data;

  };



  // ======================================================
// OBTENER MIS DONACIONES
// ======================================================

export const obtenerMisDonaciones =
  async (
    token,
    estado = null
  ) => {

    const params = {};

    if (estado) {
      params.estado =
        estado;
    }


    const response =
      await axios.get(
        `${BASE_URL}/donaciones/mias`,
        {
          ...authHeaders(token),
          params
        }
      );


    return response.data;

  };


// ======================================================
// OBTENER DETALLE DE UNA DONACIÓN
// ======================================================

export const obtenerDetalleDonacion =
  async (
    token,
    idDonacion
  ) => {

    const response =
      await axios.get(
        `${BASE_URL}/donaciones/${idDonacion}`,
        authHeaders(token)
      );


    return response.data;

  };