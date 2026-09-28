import React, {
  useState
} from 'react';

import DateTimePicker
  from '@react-native-community/datetimepicker';

import ConfirmModal
  from '../components/ConfirmModal';

 import * as Location
  from 'expo-location'; 

import {
  obtenerToken
} from '../services/authStorage';

import * as ImagePicker
  from 'expo-image-picker';

import {
  buscarUbicacionesPorTexto,
  registrarUbicacion
} from '../services/ubicacionService';  

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image
} from 'react-native';


export default function RegistrarDonacionScreen({
  organizacion,
  categorias,
  loadingCategorias,
  onVolver,
  onRegistrar,
  loadingRegistro,
  showAlert
}) {

  const [
    idCategoria,
    setIdCategoria
  ] = useState(null);

  const [
    descripcion,
    setDescripcion
  ] = useState('');

  const [
    cantidad,
    setCantidad
  ] = useState('');

  const [
    unidad,
    setUnidad
  ] = useState('');

  const [
    condicionBien,
    setCondicionBien
  ] = useState('');

const [
  disponibleDesde,
  setDisponibleDesde
] = useState(null);

const [
  mostrarFechaDisponible,
  setMostrarFechaDisponible
] = useState(false);

const [
  confirmacionVisible,
  setConfirmacionVisible
] = useState(false);

const [
  busquedaUbicacion,
  setBusquedaUbicacion
] = useState('');

const [
  resultadosUbicacion,
  setResultadosUbicacion
] = useState([]);

const [
  ubicacionSeleccionada,
  setUbicacionSeleccionada
] = useState(null);

const [
  buscandoUbicacion,
  setBuscandoUbicacion
] = useState(false);


const [
  modoUbicacion,
  setModoUbicacion
] = useState(null);


const [
  ubicacionActual,
  setUbicacionActual
] = useState(null);


const [
  direccionActual,
  setDireccionActual
] = useState('');


const [
  obteniendoUbicacion,
  setObteniendoUbicacion
] = useState(false);

const [
  imagenSeleccionada,
  setImagenSeleccionada
] = useState(null);


const generarUuid =
  () => {

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
      .replace(
        /[xy]/g,
        (caracter) => {

          const random =
            Math.random() * 16 | 0;

          const valor =
            caracter === 'x'
              ? random
              : (
                  random & 0x3 |
                  0x8
                );


          return valor.toString(
            16
          );

        }
      );

  };

  const idempotencyKey =
  React.useRef(
    generarUuid()
  );

  const nombreOrganizacion =
    organizacion?.nombre_visible ||
    organizacion?.razon_social ||
    'Organización';


const buscarUbicacion =
  async (texto) => {

    const busqueda =
      texto.trim();

    if (
      busqueda.length < 3
    ) {

      setResultadosUbicacion(
        []
      );

      return;

    }


    try {

      setBuscandoUbicacion(
        true
      );


      const token =
        await obtenerToken();


      const data =
        await buscarUbicacionesPorTexto(
          token,
          busqueda
        );


      setResultadosUbicacion(
        data.resultados || []
      );

    }
    catch (error) {

      console.log(
        'Error buscando ubicación:',
        error.response?.data ||
        error.message
      );


      setResultadosUbicacion(
        []
      );

    }
    finally {

      setBuscandoUbicacion(
        false
      );

    }

  };    

React.useEffect(
  () => {

    if (
      busquedaUbicacion
        .trim()
        .length < 3
    ) {

      setResultadosUbicacion(
        []
      );

      return;

    }


    if (
      ubicacionSeleccionada
    ) {

      return;

    }


    const temporizador =
      setTimeout(
        () => {

          buscarUbicacion(
            busquedaUbicacion
          );

        },
        600
      );


    return () => {

      clearTimeout(
        temporizador
      );

    };

  },
  [
    busquedaUbicacion,
    ubicacionSeleccionada
  ]
);


const obtenerIdUbicacion =
  async () => {

    const ubicacion =

      modoUbicacion === 'GPS'
        ? ubicacionActual

        : modoUbicacion === 'MANUAL'
          ? ubicacionSeleccionada

          : null;


    if (
      !ubicacion
    ) {

      return null;

    }


    const token =
      await obtenerToken();


    const data =
      await registrarUbicacion(
        token,
        {

          latitud:
            ubicacion.latitud,

          longitud:
            ubicacion.longitud,

          localidad:
            ubicacion.localidad ||
            null,

          provincia:
            ubicacion.provincia ||
            null,

          esAproximada:
            true,

          direccion:
            ubicacion.nombre ||
            direccionActual ||
            null

        }
      );


    return data
      .ubicacion
      .id_ubicacion;

  };


const obtenerUbicacionActual =
  async () => {

    try {

      setObteniendoUbicacion(
        true
      );


      const {
        status
      } =
        await Location
          .requestForegroundPermissionsAsync();


      if (
        status !== 'granted'
      ) {

        showAlert(
          'error',
          'Permiso de ubicación',
          'No fue posible acceder a tu ubicación actual. Verificá el permiso de ubicación de la aplicación en la configuración del dispositivo. También podés buscar una ubicación manualmente.'
        );

        return;

      }


      const ubicacion =
        await Location
          .getCurrentPositionAsync({
            accuracy:
              Location.Accuracy.Balanced
          });


      const direcciones =
        await Location
          .reverseGeocodeAsync({

            latitude:
              ubicacion.coords.latitude,

            longitude:
              ubicacion.coords.longitude

          });


      let localidad =
        null;

      let provincia =
        null;

      let direccionTexto =
        'Ubicación actual';


      if (
        direcciones.length > 0
      ) {

        const direccion =
          direcciones[0];


        localidad =
          direccion.city ||
          direccion.subregion ||
          null;


        provincia =
          direccion.region ||
          null;


        const partes = [

          direccion.street,

          direccion.streetNumber,

          direccion.city,

          direccion.region

        ].filter(Boolean);


        if (
          partes.length > 0
        ) {

          direccionTexto =
            partes.join(', ');

        }

      }


      const coordenadas = {

        latitud:
          ubicacion.coords.latitude,

        longitud:
          ubicacion.coords.longitude,

        localidad,

        provincia,

        nombre:
          direccionTexto

      };


      setUbicacionActual(
        coordenadas
      );

      setDireccionActual(
        direccionTexto
      );

      setModoUbicacion(
        'GPS'
      );


      setUbicacionSeleccionada(
        null
      );

      setBusquedaUbicacion(
        ''
      );

      setResultadosUbicacion(
        []
      );

    }
    catch (error) {

      console.log(
        'Error obteniendo ubicación:',
        error.message
      );


      showAlert(
        'error',
        'Ubicación no disponible',
        'No se pudo obtener tu ubicación actual.'
      );

    }
    finally {

      setObteniendoUbicacion(
        false
      );

    }

  };  

// ======================================================
// SELECCIONAR IMAGEN DE LA DONACIÓN
// ======================================================

const seleccionarImagen =
  async () => {

    try {

      const permiso =
        await ImagePicker
          .requestMediaLibraryPermissionsAsync();


      if (
        !permiso.granted
      ) {

        showAlert(
          'error',
          'Permiso requerido',
          'Necesitamos permiso para acceder a tus imágenes. También podés registrar la donación sin adjuntar una imagen.'
        );

        return;

      }


      const resultado =
        await ImagePicker
          .launchImageLibraryAsync({

            mediaTypes: [
              'images'
            ],

            allowsEditing:
              false,

            quality:
              0.85

          });


      if (
        resultado.canceled
      ) {

        return;

      }


      const imagen =
        resultado.assets[0];


      // Máximo 5 MB
      if (
        imagen.fileSize &&
        imagen.fileSize >
          5 * 1024 * 1024
      ) {

        showAlert(
          'error',
          'Imagen demasiado grande',
          'La imagen no puede superar los 5 MB.'
        );

        return;

      }


      const tiposPermitidos = [
        'image/jpeg',
        'image/png',
        'image/webp'
      ];


      if (
        imagen.mimeType &&
        !tiposPermitidos.includes(
          imagen.mimeType
        )
      ) {

        showAlert(
          'error',
          'Formato no permitido',
          'La imagen debe ser JPG, PNG o WEBP.'
        );

        return;

      }


      setImagenSeleccionada(
        imagen
      );

    }
    catch (error) {

      console.error(
        'ERROR AL SELECCIONAR IMAGEN:',
        error
      );


      showAlert(
        'error',
        'No se pudo seleccionar la imagen',
        'Intentá nuevamente.'
      );

    }

  };  
  
const validarFormulario =
  () => {

    if (!idCategoria) {

      showAlert(
        'error',
        'Campo incompleto',
        'Seleccioná una categoría para la donación.'
      );

      return false;

    }


    if (!descripcion.trim()) {

      showAlert(
        'error',
        'Campo incompleto',
        'Ingresá una descripción de los bienes que querés donar.'
      );

      return false;

    }


    const cantidadNumerica =
      Number(
        cantidad
      );


    if (
      !cantidad ||
      !Number.isFinite(
        cantidadNumerica
      ) ||
      cantidadNumerica <= 0
    ) {

      showAlert(
        'error',
        'Cantidad inválida',
        'Ingresá una cantidad mayor que cero.'
      );

      return false;

    }


    if (!unidad.trim()) {

      showAlert(
        'error',
        'Campo incompleto',
        'Indicá la unidad de la donación, por ejemplo kg, unidades o cajas.'
      );

      return false;

    }


    if (!condicionBien.trim()) {

      showAlert(
        'error',
        'Campo incompleto',
        'Indicá la condición del bien.'
      );

      return false;

    }


    if (!disponibleDesde) {

      showAlert(
        'error',
        'Campo incompleto',
        'Seleccioná desde qué fecha estará disponible la donación.'
      );

      return false;

    }

    if (
       modoUbicacion === 'MANUAL' &&
      busquedaUbicacion.trim() &&
      !ubicacionSeleccionada
    ) {

      showAlert(
        'error',
        'Ubicación no seleccionada',
        'Seleccioná una ubicación de los resultados o dejá el campo vacío.'
      );

      return false;

    }


    return true;

  };


const continuar =
  () => {

    if (
      !validarFormulario()
    ) {

      return;

    }


    setConfirmacionVisible(
      true
    );

  };

const formatearFechaVisible =
  (fecha) => {

    if (!fecha) {
      return '';
    }

    const dia =
      String(
        fecha.getDate()
      ).padStart(
        2,
        '0'
      );

    const mes =
      String(
        fecha.getMonth() + 1
      ).padStart(
        2,
        '0'
      );

    const anio =
      fecha.getFullYear();


    return `${dia}/${mes}/${anio}`;

  };


const formatearFechaBackend =
  (fecha) => {

    if (!fecha) {
      return null;
    }

    const dia =
      String(
        fecha.getDate()
      ).padStart(
        2,
        '0'
      );

    const mes =
      String(
        fecha.getMonth() + 1
      ).padStart(
        2,
        '0'
      );

    const anio =
      fecha.getFullYear();


    return `${anio}-${mes}-${dia}`;

  };


  const confirmarRegistro =
  async () => {

     let idUbicacion =
      null;


    try {

      idUbicacion =
        await obtenerIdUbicacion();

    }
    catch (error) {

      console.log(
        'Error registrando ubicación:',
        error.response?.data ||
        error.message
      );


      showAlert(
        'error',
        'No se pudo guardar la ubicación',
        'Intentá nuevamente o registrá la donación sin ubicación.'
      );


      return;

    }

    const datos = {

      id_categoria_donacion:
        idCategoria,

      descripcion:
        descripcion.trim(),

      cantidad:
        Number(cantidad),

      unidad:
        unidad.trim(),

      condicion_bien:
        condicionBien.trim(),

      disponible_desde:
        formatearFechaBackend(
          disponibleDesde
        ),
      
      id_ubicacion:idUbicacion  

    };


    const correcto =
      await onRegistrar?.(
        datos,
        idempotencyKey.current,
        imagenSeleccionada
      );


    if (
      correcto
    ) {

      setConfirmacionVisible(
        false
      );

    }

  };


  if (
    loadingCategorias
  ) {

    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
        />

        <Text style={styles.loadingText}>
          Cargando formulario...
        </Text>
      </View>
    );

  }


  return (

    <ScrollView
      contentContainerStyle={
        styles.container
      }
      keyboardShouldPersistTaps="handled"
    >

      <TouchableOpacity
        style={styles.backButton}
        onPress={onVolver}
      >
        <Text
          style={
            styles.backButtonText
          }
        >
          ← Volver
        </Text>
      </TouchableOpacity>


      <Text style={styles.title}>
        Nueva donación
      </Text>

      <Text style={styles.subtitle}>
        Completá los datos del bien
        que querés ofrecer.
      </Text>


      {/* ORGANIZACIÓN DESTINATARIA */}

      <View style={styles.orgCard}>

        <Text style={styles.orgLabel}>
          Organización destinataria
        </Text>

        <Text style={styles.orgName}>
          {nombreOrganizacion}
        </Text>

        <Text style={styles.verified}>
          ✓ Organización verificada
        </Text>

      </View>


      {/* CATEGORÍA */}

      <Text style={styles.label}>
        Categoría *
      </Text>

      <View style={styles.optionsContainer}>

        {
          categorias?.map(
            (categoria) => {

              const seleccionada =
                idCategoria ===
                categoria.id_categoria_donacion;

              return (

                <TouchableOpacity
                  key={
                    categoria
                      .id_categoria_donacion
                  }
                  style={[
                    styles.optionButton,
                    seleccionada &&
                      styles.optionSelected
                  ]}
                  onPress={
                    () =>
                      setIdCategoria(
                        categoria
                          .id_categoria_donacion
                      )
                  }
                >

                  <Text
                    style={[
                      styles.optionText,
                      seleccionada &&
                        styles.optionTextSelected
                    ]}
                  >
                    {categoria.nombre}
                  </Text>

                </TouchableOpacity>

              );

            }
          )
        }

      </View>


      {/* DESCRIPCIÓN */}

      <Text style={styles.label}>
        Descripción *
      </Text>

      <TextInput
        style={[
          styles.input,
          styles.textArea
        ]}
        placeholder={
          'Ej.: Arroz, fideos y leche larga vida.'
        }
        multiline
        value={descripcion}
        onChangeText={
          setDescripcion
        }
      />


      {/* CANTIDAD */}

      <Text style={styles.label}>
        Cantidad *
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ej.: 15"
        keyboardType="decimal-pad"
        value={cantidad}
        onChangeText={
          setCantidad
        }
      />


      {/* UNIDAD */}

      <Text style={styles.label}>
        Unidad *
      </Text>

      <TextInput
        style={styles.input}
        placeholder={
          'Ej.: kg, unidades, cajas'
        }
        value={unidad}
        onChangeText={
          setUnidad
        }
      />


      {/* CONDICIÓN */}

      <Text style={styles.label}>
        Condición del bien *
      </Text>

      <TextInput
        style={styles.input}
        placeholder={
          'Ej.: Buen estado'
        }
        value={condicionBien}
        onChangeText={
          setCondicionBien
        }
      />


      {/* DISPONIBILIDAD */}

      <Text style={styles.label}>
        ¿Desde qué fecha estará disponible? *
        </Text>

        <Text style={styles.fieldHelp}>
        Indicá desde cuándo la organización podrá coordinar
        la entrega o retiro de la donación.
        </Text>

        <TouchableOpacity
        style={styles.input}
        onPress={
            () =>
            setMostrarFechaDisponible(
                true
            )
        }
        >

        <Text
            style={{
            color:
                disponibleDesde
                ? '#1F2933'
                : '#777777'
            }}
        >

            {
            disponibleDesde
                ? formatearFechaVisible(
                    disponibleDesde
                )
                : 'DD/MM/AAAA'
            }

        </Text>

        </TouchableOpacity>


        {mostrarFechaDisponible && (

        <DateTimePicker

            value={
            disponibleDesde ||
            new Date()
            }

            mode="date"

             minimumDate={
                new Date()
            }

            onChange={(
            event,
            fechaSeleccionada
            ) => {

            setMostrarFechaDisponible(
                false
            );


            if (
                event.type ===
                'dismissed' ||
                !fechaSeleccionada
            ) {

                return;

            }


            setDisponibleDesde(
                fechaSeleccionada
            );

            }}

        />

        )}


      <Text style={styles.label}>
  Ubicación aproximada
</Text>

<Text style={styles.fieldHelp}>
  Opcional. Indicá una zona donde podría coordinarse la entrega o retiro de la donación.
</Text>


<View
  style={
    styles.locationModeContainer
  }
>

  <TouchableOpacity

    style={[
      styles.locationModeButton,

      modoUbicacion === 'GPS' &&
        styles.locationModeButtonActive
    ]}

    onPress={
      obtenerUbicacionActual
    }

    disabled={
      obteniendoUbicacion
    }

  >

    <Text
      style={[
        styles.locationModeButtonText,

        modoUbicacion === 'GPS' &&
          styles.locationModeButtonTextActive
      ]}
    >

      {
        obteniendoUbicacion
          ? 'Obteniendo...'
          : 'Ubicación actual'
      }

    </Text>

  </TouchableOpacity>


  <TouchableOpacity

    style={[
      styles.locationModeButton,

      modoUbicacion === 'MANUAL' &&
        styles.locationModeButtonActive
    ]}

    onPress={
      () => {

        setModoUbicacion(
          'MANUAL'
        );

        setUbicacionActual(
          null
        );

        setDireccionActual(
          ''
        );

        setUbicacionSeleccionada(
          null
        );

        setBusquedaUbicacion(
          ''
        );

        setResultadosUbicacion(
          []
        );

      }
    }

  >

    <Text
      style={[
        styles.locationModeButtonText,

        modoUbicacion === 'MANUAL' &&
          styles.locationModeButtonTextActive
      ]}
    >
      Elegir manualmente
    </Text>

  </TouchableOpacity>

</View>


{modoUbicacion === 'GPS' &&
  ubicacionActual && (

  <View
    style={
      styles.selectedLocation
    }
  >

    <Text
      style={
        styles.selectedLocationTitle
      }
    >
      Ubicación actual seleccionada
    </Text>

    <Text
      style={
        styles.selectedLocationText
      }
    >
      {direccionActual}
    </Text>

  </View>

)}


{modoUbicacion === 'MANUAL' && (

  <>

    <TextInput

      style={
        styles.input
      }

      placeholder="Buscar dirección o lugar..."

      value={
        busquedaUbicacion
      }

      onChangeText={
        (texto) => {

          setBusquedaUbicacion(
            texto
          );

          setUbicacionSeleccionada(
            null
          );

        }
      }

    />


    {buscandoUbicacion && (

      <Text
        style={
          styles.searchingText
        }
      >
        Buscando...
      </Text>

    )}


    {resultadosUbicacion.map(
      (resultado) => (

        <TouchableOpacity

          key={
            resultado.placeId
          }

          style={
            styles.locationResult
          }

          onPress={
            () => {

              setUbicacionSeleccionada(
                resultado
              );

              setBusquedaUbicacion(
                resultado.nombre
              );

              setResultadosUbicacion(
                []
              );

            }
          }

        >

          <Text
            style={
              styles.locationResultText
            }
          >
            {resultado.nombre}
          </Text>


          <Text
            style={
              styles.locationResultDetail
            }
          >
            {resultado.detalle}
          </Text>

        </TouchableOpacity>

      )
    )}


    {ubicacionSeleccionada && (

      <View
        style={
          styles.selectedLocation
        }
      >

        <Text
          style={
            styles.selectedLocationTitle
          }
        >
          Ubicación seleccionada
        </Text>

        <Text
          style={
            styles.selectedLocationText
          }
        >
          {ubicacionSeleccionada.nombre}
        </Text>

      </View>

    )}

  </>

)}

{/* ==================================================
    IMAGEN OPCIONAL
================================================== */}

<Text style={styles.label}>
  Imagen de referencia
</Text>

<Text style={styles.fieldHelp}>
  Podés adjuntar una imagen JPG, PNG o WEBP de hasta 5 MB.
</Text>


{
  imagenSeleccionada ? (

    <View
      style={
        styles.imageCard
      }
    >

      <Image

        source={{
          uri:
            imagenSeleccionada.uri
        }}

        style={
          styles.imagePreview
        }

        resizeMode="cover"

      />


      <View
        style={
          styles.imageActions
        }
      >

        <TouchableOpacity

          style={
            styles.imageReplaceButton
          }

          onPress={
            seleccionarImagen
          }

        >

          <Text
            style={
              styles.imageReplaceText
            }
          >
            Reemplazar
          </Text>

        </TouchableOpacity>


        <TouchableOpacity

          style={
            styles.imageRemoveButton
          }

          onPress={() =>
            setImagenSeleccionada(
              null
            )
          }

        >

          <Text
            style={
              styles.imageRemoveText
            }
          >
            Quitar
          </Text>

        </TouchableOpacity>

      </View>

    </View>

  ) : (

    <TouchableOpacity

      style={
        styles.imageSelectButton
      }

      onPress={
        seleccionarImagen
      }

    >

      <Text
        style={
          styles.imageSelectText
        }
      >
        Seleccionar imagen
      </Text>

    </TouchableOpacity>

  )
}


      <TouchableOpacity
        style={styles.primaryButton}
        onPress={continuar}
      >

        <Text
          style={
            styles.primaryButtonText
          }
        >
          Registrar donación
        </Text>

      </TouchableOpacity>


    <ConfirmModal

      visible={
        confirmacionVisible
      }

      title="Registrar donación"

      message={
        `Vas a registrar esta donación para ${nombreOrganizacion}. La organización podrá revisarla y el estado inicial será Pendiente. ¿Deseás continuar?`
      }

      confirmText="Confirmar registro"

      cancelText="Revisar datos"

      destructive={
        false
      }

      loading={
        loadingRegistro
      }

      onCancel={
        () =>
          setConfirmacionVisible(
            false
          )
      }

      onConfirm={
        confirmarRegistro
      }

    />       

    </ScrollView>

  );

}


const styles =
  StyleSheet.create({

    container: {
      padding: 18,
      paddingBottom: 40,
      backgroundColor:
        '#F5F7F6'
    },


    center: {
      flex: 1,
      justifyContent:
        'center',
      alignItems:
        'center'
    },


    loadingText: {
      marginTop: 12
    },


    backButton: {
      alignSelf:
        'flex-start',

      backgroundColor:
        '#FFFFFF',

      paddingHorizontal: 14,
      paddingVertical: 10,

      borderRadius: 10,

      borderWidth: 1,
      borderColor:
        '#DDE5E2',

      elevation: 2,

      marginBottom: 14
    },


    backButtonText: {
      color:
        '#1F6F5C',

      fontWeight:
        '600',

      fontSize: 14
    },


    title: {
      fontSize: 24,
      fontWeight: '700',
      color: '#1F2933'
    },


    subtitle: {
      marginTop: 4,
      marginBottom: 18,
      color: '#667085',
      fontSize: 14
    },


    orgCard: {
      backgroundColor:
        '#FFFFFF',

      borderRadius: 14,

      padding: 16,

      borderWidth: 1,
      borderColor:
        '#DDE5E2',

      marginBottom: 20
    },


    orgLabel: {
      fontSize: 12,
      color: '#667085'
    },


    orgName: {
      fontSize: 18,
      fontWeight: '700',
      color: '#1F2933',
      marginTop: 4
    },


    verified: {
      color: '#1F6F5C',
      marginTop: 5,
      fontWeight: '600'
    },


    label: {
      fontSize: 14,
      fontWeight: '600',
      color: '#344054',
      marginBottom: 7,
      marginTop: 12
    },


    input: {
      backgroundColor:
        '#FFFFFF',

      borderWidth: 1,
      borderColor:
        '#D0D5DD',

      borderRadius: 10,

      paddingHorizontal: 13,
      paddingVertical: 11,

      fontSize: 15,
      color: '#1F2933'
    },


    textArea: {
      minHeight: 100,
      textAlignVertical:
        'top'
    },


    optionsContainer: {
      flexDirection:
        'row',

      flexWrap:
        'wrap',

      gap: 8
    },


    optionButton: {
      paddingHorizontal: 14,
      paddingVertical: 9,

      borderRadius: 20,

      backgroundColor:
        '#FFFFFF',

      borderWidth: 1,
      borderColor:
        '#D0D5DD'
    },


    optionSelected: {
      backgroundColor:
        '#1F6F5C',

      borderColor:
        '#1F6F5C'
    },


    optionText: {
      color:
        '#344054'
    },


    optionTextSelected: {
      color:
        '#FFFFFF',

      fontWeight:
        '600'
    },


    help: {
      marginTop: 18,
      color: '#667085',
      fontSize: 12,
      lineHeight: 18
    },


    primaryButton: {
      backgroundColor:
        '#1F6F5C',

      paddingVertical: 14,

      borderRadius: 12,

      alignItems:
        'center',

      marginTop: 22
    },


    primaryButtonText: {
      color:
        '#FFFFFF',

      fontSize: 16,
      fontWeight: '700'
    },

    fieldHelp: {
  fontSize: 12,
  color: '#667085',
  lineHeight: 17,
  marginBottom: 8
},

searchingText: {
  marginTop: 8,
  color: '#667085',
  fontSize: 12
},

locationResult: {
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#D0D5DD',
  borderRadius: 10,
  padding: 12,
  marginTop: 6
},

locationResultText: {
  fontSize: 13,
  color: '#344054',
  fontWeight: '600'
},

locationResultDetail: {
  fontSize: 11,
  color: '#667085',
  marginTop: 3
},

selectedLocation: {
  backgroundColor: '#E8F3EF',
  borderRadius: 10,
  padding: 12,
  marginTop: 10
},

selectedLocationTitle: {
  fontSize: 12,
  fontWeight: '700',
  color: '#1F6F5C',
  marginBottom: 4
},

selectedLocationText: {
  fontSize: 12,
  color: '#344054'
},

locationModeContainer: {
  flexDirection: 'row',
  gap: 8,
  marginTop: 4
},

locationModeButton: {
  flex: 1,
  minHeight: 44,
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#D0D5DD',
  borderRadius: 12,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 10
},

locationModeButtonActive: {
  backgroundColor: '#1F6F5C',
  borderColor: '#1F6F5C'
},

locationModeButtonText: {
  fontSize: 12,
  fontWeight: '600',
  color: '#667085',
  textAlign: 'center'
},

locationModeButtonTextActive: {
  color: '#FFFFFF'
},
imageSelectButton: {

  backgroundColor:
    '#FFFFFF',

  borderWidth: 1,
  borderColor:
    '#1F6F5C',

  borderRadius: 10,

  paddingVertical: 12,

  alignItems:
    'center',

  marginBottom: 8

},


imageSelectText: {

  color:
    '#1F6F5C',

  fontWeight:
    '600'

},


imageCard: {

  backgroundColor:
    '#FFFFFF',

  borderWidth: 1,
  borderColor:
    '#DDE5E2',

  borderRadius: 12,

  padding: 10,

  marginBottom: 8

},


imagePreview: {

  width: '100%',
  height: 220,

  borderRadius: 9,

  backgroundColor:
    '#E5E7EB'

},


imageActions: {

  flexDirection:
    'row',

  gap: 10,

  marginTop: 10

},


imageReplaceButton: {

  flex: 1,

  borderWidth: 1,
  borderColor:
    '#1F6F5C',

  paddingVertical: 10,

  borderRadius: 9,

  alignItems:
    'center'

},


imageReplaceText: {

  color:
    '#1F6F5C',

  fontWeight:
    '600'

},


imageRemoveButton: {

  flex: 1,

  borderWidth: 1,
  borderColor:
    '#B42318',

  paddingVertical: 10,

  borderRadius: 9,

  alignItems:
    'center'

},


imageRemoveText: {

  color:
    '#B42318',

  fontWeight:
    '600'

},

  });