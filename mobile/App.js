import React, {
  useState,
  useEffect
} from 'react';

import * as Notifications from 'expo-notifications';

import {
  registrarDispositivoPush,
  desactivarDispositivoPush
} from './src/services/notificacionesPush';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  StyleSheet,
  View,
  ImageBackground,
  ScrollView,
  Modal,
  Text,
  TouchableOpacity,
} from 'react-native';


import LoginScreen
  from './src/screens/LoginScreen';

import RoleSelectionScreen
  from './src/screens/RoleSelectionScreen';

import RegisterVoluntario
  from './src/screens/RegisterVoluntario';

import RegisterOrganizacion
  from './src/screens/RegisterOrganizacion';

import ForgotPasswordScreen
  from './src/screens/ForgotPasswordScreen';

import MisOportunidadesScreen
  from './src/screens/MisOportunidadesScreen';

import OportunidadFormScreen
  from './src/screens/OportunidadFormScreen';

import BuscarOportunidadesScreen
  from './src/screens/BuscarOportunidadesScreen';

import DetalleOportunidadScreen
  from './src/screens/DetalleOportunidadScreen';

import MisInscripcionesScreen from './src/screens/MisInscripcionesScreen';

import GestionInscripcionesScreen
  from './src/screens/GestionInscripcionesScreen';

import PerfilVoluntarioOrganizacionScreen
  from './src/screens/PerfilVoluntarioOrganizacionScreen';

import VoluntarioBottomNav
  from './src/components/VoluntarioBottomNav';

import InicioVoluntarioScreen
  from './src/screens/InicioVoluntarioScreen';

import InicioOrganizacionScreen
  from './src/screens/InicioOrganizacionScreen';

import OrganizacionBottomNav
  from './src/components/OrganizacionBottomNav';

import AdminBottomNav
  from './src/components/AdminBottomNav';

import OrganizacionesPendientesScreen
  from './src/screens/OrganizacionesPendientesScreen';

import DetalleOrganizacionPendienteScreen
  from './src/screens/DetalleOrganizacionPendienteScreen';

import {
  obtenerOrganizacionesPendientes,
  aprobarOrganizacion,
  rechazarOrganizacion,
  obtenerUsuarios,
  bloquearUsuario,
  rehabilitarUsuario,
  obtenerTiposActividadAdmin,
crearTipoActividadAdmin,
actualizarTipoActividadAdmin,
anularRegistroOrganizacion
} from './src/services/adminService'; 

import MiOrganizacionScreen
  from './src/screens/MiOrganizacionScreen';

import MiReputacionOrganizacionScreen
  from './src/screens/MiReputacionOrganizacionScreen';  


import MiPerfilVoluntarioScreen
  from './src/screens/MiPerfilVoluntarioScreen';

import MiReputacionScreen
  from './src/screens/MiReputacionScreen';

import {
  inscribirseOportunidad,
  obtenerMisInscripciones,
  obtenerInscripcionesOportunidad,
  aceptarInscripcion,
  rechazarInscripcion,
  ocultarInscripcion,
  cancelarInscripcion,
  marcarResultadoParticipacion,
  obtenerPerfilVoluntarioDeInscripcion
} from './src/services/inscripcionService';

// ======================================================
// CALIFICACIONES - ACTIVIDAD 3.2
// ======================================================

import {
  calificarVoluntario,
  obtenerMiReputacionVoluntario,
  calificarOrganizacion,
  obtenerMiReputacionOrganizacion
} from './src/services/calificacionService';

import {
  guardarToken,
  obtenerToken,
  eliminarToken
} from './src/services/authStorage';


import {
  login,
  registrarUsuario,
  recuperarPassword,
  obtenerPerfilProtegido,
  obtenerMiOrganizacion,
  obtenerMiVoluntario
} from './src/services/authService';

import {
  obtenerMisOportunidades,
  obtenerOportunidadesVoluntario,
  obtenerDetalleOportunidadVoluntario,
  obtenerOportunidadPorId,
  obtenerTiposActividad,
  publicarOportunidad,
  cancelarOportunidad,
  cerrarOportunidad,
  finalizarOportunidad,
  eliminarOportunidad
} from './src/services/oportunidadService';


import {
  buscarUbicacionesPorTexto
} from './src/services/ubicacionService';

import OrganizacionesDonacionScreen
  from './src/screens/OrganizacionesDonacionScreen';

import {
  obtenerOrganizacionesDonacion,
  obtenerDetalleOrganizacionDonacion,
  obtenerCategoriasDonacion,
  registrarDonacion,
  subirImagenDonacion,
  obtenerMisDonaciones,
  obtenerDetalleDonacion,
  obtenerDonacionesRecibidas,
  obtenerDetalleDonacionRecibida,
  aceptarDonacionRecibida,
  rechazarDonacionRecibida,
  coordinarDonacionRecibida,
  marcarDonacionComoRecibida
} from './src/services/donacionService';  

import RegistrarDonacionScreen
  from './src/screens/RegistrarDonacionScreen';

import DetalleOrganizacionDonacionScreen
  from './src/screens/DetalleOrganizacionDonacionScreen';

import MisDonacionesScreen
  from './src/screens/MisDonacionesScreen';

import DetalleDonacionScreen
  from './src/screens/DetalleDonacionScreen';

import DonacionesRecibidasScreen
  from './src/screens/DonacionesRecibidasScreen';

import DetalleDonacionRecibidaScreen
  from './src/screens/DetalleDonacionRecibidaScreen';  

import * as Location
  from 'expo-location';

import {
  obtenerRecomendacionesVoluntario,
  obtenerInteresesVoluntario,
  actualizarInteresesVoluntario
} from './src/services/voluntarioService';

import UsuariosAdminScreen
  from './src/screens/UsuariosAdminScreen';

import TiposActividadAdminScreen
  from './src/screens/TiposActividadAdminScreen';

import EstadisticasOrganizacionScreen
  from './src/screens/EstadisticasOrganizacionScreen';

import EstadisticasAdminScreen
  from './src/screens/EstadisticasAdminScreen';

import {
  obtenerEstadisticasOrganizacion,
  obtenerEstadisticasGlobales
} from './src/services/estadisticaService';


import NotificacionesVoluntarioScreen
  from './src/screens/NotificacionesVoluntarioScreen';

import {
  obtenerMisNotificaciones,
  obtenerCantidadNoLeidas,
  marcarNotificacionLeida
} from './src/services/notificacionService';

import {
  obtenerMiPerfilPublico
} from './src/services/perfilPublicoService';

import PerfilesPublicosAdminScreen
  from './src/screens/PerfilesPublicosAdminScreen';


// ======================================================
// REGISTRAR PUSH SIN INTERRUMPIR LA SESIÓN
// ======================================================

const intentarRegistrarPush = async (jwt) => {

  try {

    await registrarDispositivoPush(jwt);

  }
  catch (error) {

    console.warn(

      'No se pudo registrar el dispositivo para push:',

      error.response?.data?.mensaje ||
      error.message

    );

  }

};


export default function App() {

  const [
    currentScreen,
    setCurrentScreen
  ] = useState('A01');


  const [
    loading,
    setLoading
  ] = useState(false);


  const [
    oportunidades,
    setOportunidades
  ] = useState([]);


  const [
    oportunidadesVoluntario,
    setOportunidadesVoluntario
  ] = useState([]);

  const [
  oportunidadesInicioVoluntario,
  setOportunidadesInicioVoluntario
  ] = useState([]);

  const [
  loadingInicioVoluntario,
  setLoadingInicioVoluntario
  ] = useState(false);

  // ======================================================
  // RECOMENDACIONES - ACTIVIDAD 3.1.2
  // ======================================================

  const [
    recomendacionesVoluntario,
    setRecomendacionesVoluntario
  ] = useState([]);


  const [
    loadingRecomendaciones,
    setLoadingRecomendaciones
  ] = useState(false);

  const [
    recomendacionesCargadas,
    setRecomendacionesCargadas
  ] = useState(false);

  const [
    ubicacionRecomendaciones,
    setUbicacionRecomendaciones
  ] = useState(null);

  // ======================================================
  // INTERESES DEL VOLUNTARIO
  // ACTIVIDAD 3.1.2
  // ======================================================

  const [
    interesesVoluntario,
    setInteresesVoluntario
  ] = useState([]);

  const [
    loadingInteresesVoluntario,
    setLoadingInteresesVoluntario
  ] = useState(false);

  const [
  inscripcionesVoluntario,
  setInscripcionesVoluntario
  ] = useState([]);

  const [
  inscripcionesOrganizacion,
  setInscripcionesOrganizacion
] = useState([]);

const [
  perfilVoluntarioOrganizacion,
  setPerfilVoluntarioOrganizacion
] = useState(null);

const [
  loadingPerfilVoluntarioOrganizacion,
  setLoadingPerfilVoluntarioOrganizacion
] = useState(false);

// ======================================================
// ESTADO DE CALIFICACIONES
// ACTIVIDAD 3.2.1
// ======================================================

const [
  loadingCalificacion,
  setLoadingCalificacion
] = useState(false);

const [
  loadingCalificacionOrganizacion,
  setLoadingCalificacionOrganizacion
] = useState(false);
const [
  oportunidadGestionando,
  setOportunidadGestionando
] = useState(null);

  const [
  estadoInscripcionDetalle,
  setEstadoInscripcionDetalle
] = useState(null);

const [
  origenDetalleVoluntario,
  setOrigenDetalleVoluntario
] = useState(null);


  const [
    tiposActividad,
    setTiposActividad
  ] = useState([]);


  const [
    oportunidadEditando,
    setOportunidadEditando
  ] = useState(null);


  const [
    oportunidadSeleccionada,
    setOportunidadSeleccionada
  ] = useState(null);


  const [
    loadingDetalle,
    setLoadingDetalle
  ] = useState(false);


  const [
    scrollYVoluntario,
    setScrollYVoluntario
  ] = useState(0);

  const [
  scrollYInicioVoluntario,
  setScrollYInicioVoluntario
  ] = useState(0);

  const [
    scrollYInscripciones,
    setScrollYInscripciones
  ] = useState(0);

  const [
  scrollYOrganizacion,
  setScrollYOrganizacion
] = useState(0);

const [
  scrollYOrganizacionGuardado,
  setScrollYOrganizacionGuardado
] = useState(0);

const [
  scrollYDonacionesRecibidas,
  setScrollYDonacionesRecibidas
] = useState(0);

const [
  scrollYOrganizacionesPendientes,
  setScrollYOrganizacionesPendientes
] = useState(0);

  const scrollRef =
    React.useRef(null);


  const [
    filtrosVoluntario,
    setFiltrosVoluntario
  ] = useState({});


  const [
    filtroEstadoOrganizacion,
    setFiltroEstadoOrganizacion
  ] =
    useState('TODAS');

  const [
  filtroEstadoInscripciones,
  setFiltroEstadoInscripciones
] = React.useState('TODAS');

  const [
    busquedaOrganizacion,
    setBusquedaOrganizacion
  ] =
    useState('');

  const [
  notificacionesVoluntario,
  setNotificacionesVoluntario
] = useState([]);


const [
  cantidadNoLeidas,
  setCantidadNoLeidas
] = useState(0);


const [
  loadingNotificaciones,
  setLoadingNotificaciones
] = useState(false);  

  const [
    estadoUbicacionVoluntario,
    setEstadoUbicacionVoluntario
  ] = useState({

    modoUbicacion: null,

    ubicacionActual: null,

    ubicacionManualSeleccionada: null,

    direccionActual: '',

    textoUbicacion: '',

    radioBusquedaKm: '',

  });

  const [
  estadoUbicacionDonacion,
  setEstadoUbicacionDonacion
] = useState({

  modoUbicacion: null,

  ubicacionActual: null,

  ubicacionManualSeleccionada: null,

  direccionActual: '',

  textoUbicacion: '',

  radioBusquedaKm:'',

});

  const [
  datosOrganizacion,
  setDatosOrganizacion
] = useState(null);

// ======================================================
// ESTADÍSTICAS - ORGANIZACIÓN
// ACTIVIDAD 3.4.1
// ======================================================

const [
  estadisticasOrganizacion,
  setEstadisticasOrganizacion
] = useState(null);


const [
  loadingEstadisticasOrganizacion,
  setLoadingEstadisticasOrganizacion
] = useState(false);

// ======================================================
// DATOS DEL PERFIL DEL VOLUNTARIO
// ACTIVIDAD 3.2.1
// ======================================================

const [
  datosVoluntario,
  setDatosVoluntario
] = useState(null);

const [
  loadingDatosVoluntario,
  setLoadingDatosVoluntario
] = useState(false);

const [
  reputacionVoluntario,
  setReputacionVoluntario
] = useState(null);

const [
  loadingReputacionVoluntario,
  setLoadingReputacionVoluntario
] = useState(false);

const [
  loadingDatosOrganizacion,
  setLoadingDatosOrganizacion
] = useState(false);

const [
  reputacionOrganizacion,
  setReputacionOrganizacion
] = useState(null);

const [
  loadingReputacionOrganizacion,
  setLoadingReputacionOrganizacion
] = useState(false);

// ======================================================
// PERFIL PÚBLICO DE ORGANIZACIÓN - ACTIVIDAD 3.6.1
// ======================================================

const [
  perfilPublicoOrganizacion,
  setPerfilPublicoOrganizacion
] = useState(null);

const [
  loadingPerfilPublicoOrganizacion,
  setLoadingPerfilPublicoOrganizacion
] = useState(false);

const [
  organizacionesDonacion,
  setOrganizacionesDonacion
] = useState([]);


const [
  filtrosDonacion,
  setFiltrosDonacion
] = useState({});


const [
  loadingDonacion,
  setLoadingDonacion
] = useState(false);


const [
  organizacionDonacionSeleccionada,
  setOrganizacionDonacionSeleccionada
] = useState(null);

const [
  loadingDetalleDonacion,
  setLoadingDetalleDonacion
] = useState(false);

const [
  scrollYDonacion,
  setScrollYDonacion
] = useState(0);

  // ======================================================
  // MODAL DE CIERRE DE SESIÓN
  // ======================================================

  const [
    logoutVisible,
    setLogoutVisible
  ] = useState(false);


  const [
  categoriasDonacion,
  setCategoriasDonacion
] = useState([]);


const [
  loadingCategoriasDonacion,
  setLoadingCategoriasDonacion
] = useState(false);

const [
  loadingRegistroDonacion,
  setLoadingRegistroDonacion
] = useState(false);

// ======================================================
// DONACIONES RECIBIDAS - ORGANIZACIÓN
// ======================================================

const [
  donacionesRecibidas,
  setDonacionesRecibidas
] = useState([]);


const [
  estadoFiltroDonacionesRecibidas,
  setEstadoFiltroDonacionesRecibidas
] = useState('TODAS');


const [
  donacionRecibidaSeleccionada,
  setDonacionRecibidaSeleccionada
] = useState(null);


const [
  loadingDonacionesRecibidas,
  setLoadingDonacionesRecibidas
] = useState(false);


const [
  loadingDetalleDonacionRecibida,
  setLoadingDetalleDonacionRecibida
] = useState(false);


const [
  loadingAccionDonacion,
  setLoadingAccionDonacion
] = useState(false);

const [
  donacionesVoluntario,
  setDonacionesVoluntario
] = useState([]);


const [
  filtroEstadoDonaciones,
  setFiltroEstadoDonaciones
] = useState(null);


const [
  loadingMisDonaciones,
  setLoadingMisDonaciones
] = useState(false);


const [
  donacionSeleccionada,
  setDonacionSeleccionada
] = useState(null);


const [
  loadingDetalleDonacionPropia,
  setLoadingDetalleDonacionPropia
] = useState(false);


const [
  scrollYMisDonaciones,
  setScrollYMisDonaciones
] = useState(0);

// ======================================================
// ADMINISTRACIÓN
// ======================================================

const [
  organizacionesPendientes,
  setOrganizacionesPendientes
] = useState([]);

const [
  usuariosAdmin,
  setUsuariosAdmin
] = useState([]);

const [
  loadingUsuariosAdmin,
  setLoadingUsuariosAdmin
] = useState(false);

const [
  loadingAdmin,
  setLoadingAdmin
] = useState(false);

const [
  organizacionAdminSeleccionada,
  setOrganizacionAdminSeleccionada
] = useState(null);


const [
  loadingAccionAdmin,
  setLoadingAccionAdmin
] = useState(false);

const [
  tiposActividadAdmin,
  setTiposActividadAdmin
] = useState([]);

const [
  loadingTiposActividadAdmin,
  setLoadingTiposActividadAdmin
] = useState(false);

// ======================================================
// ESTADÍSTICAS GLOBALES - ADMIN
// ACTIVIDAD 3.4.2
// ======================================================

const [
  estadisticasAdmin,
  setEstadisticasAdmin
] = useState(null);


const [
  loadingEstadisticasAdmin,
  setLoadingEstadisticasAdmin
] = useState(false);

  // ======================================================
  // VERIFICAR SESIÓN GUARDADA
  // ======================================================

  useEffect(() => {

    const verificarSesionGuardada =
      async () => {

        const token =
          await obtenerToken();


        if (!token) {

          return;

        }


        try {

          const data =
            await obtenerPerfilProtegido(
              token
            );


          const rol =
            data.usuario.rol;


          if (
            rol === 'VOLUNTARIO'
          ) {

            setCurrentScreen(
              'VOLUNTARIO_INICIO'
            );


            await cargarTiposActividad();
            
            await cargarInteresesVoluntario();

            await cargarOportunidadesInicioVoluntario();

            await cargarRecomendacionesVoluntario();

            await cargarOportunidadesVoluntario();

            await cargarMisInscripciones();
            await intentarRegistrarPush(
              token
            );

          }
          else if (
            rol === 'ORGANIZACION'
          ) {

            setCurrentScreen(
              'ORGANIZACION_INICIO'
            );


            await cargarOportunidades();
            await intentarRegistrarPush(
              token
            );
          }
          else if (
            rol === 'ADMIN'
          ) {

            setCurrentScreen(
              'ADMIN_HOME'
            );

          }
          else {

            await eliminarToken();

            setCurrentScreen(
              'A01'
            );

          }

        }
        catch (error) {

          if (
            error.response
              ?.status === 401
          ) {

            await eliminarToken();

            setCurrentScreen(
              'A01'
            );

          }

        }

      };


    verificarSesionGuardada();

  }, []);


  // ======================================================
  // MODAL DE ALERTA FLOTANTE
  // ======================================================

  const [
    modalVisible,
    setModalVisible
  ] = useState(false);


  const [
    modalType,
    setModalType
  ] = useState('success');


  const [
    modalTitle,
    setModalTitle
  ] = useState('');


  const [
    modalMessage,
    setModalMessage
  ] = useState('');


  const showAlert = (
    type,
    title,
    message
  ) => {

    setModalType(
      type
    );

    setModalTitle(
      title
    );

    setModalMessage(
      message
    );

    setModalVisible(
      true
    );

  };


  // ======================================================
  // 1. INICIAR SESIÓN
  // ======================================================

  const handleLogin =
    async (
      email,
      password
    ) => {

      if (
        !email ||
        !password
      ) {

        showAlert(

          'error',

          'Campos Incompletos',

          'Por favor ingresa tu correo electrónico y contraseña.'

        );


        return;

      }


      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


      if (
        !emailRegex.test(
          email
        )
      ) {

        showAlert(

          'error',

          'Correo Inválido',

          'Ingresá un correo electrónico válido.'

        );


        return;

      }


      setLoading(
        true
      );


      try {

        const data =
          await login(
            email,
            password
          );


        await guardarToken(
          data.token
        );


        const rol =
          data.user.rol;


        if (
          rol === 'VOLUNTARIO'
        ) {

          setCurrentScreen(
            'VOLUNTARIO_INICIO'
          );


          await cargarTiposActividad();

          await cargarInteresesVoluntario();

          await cargarOportunidadesInicioVoluntario();

          await cargarRecomendacionesVoluntario();

          await cargarOportunidadesVoluntario();

          await cargarMisInscripciones();
          await intentarRegistrarPush(
            data.token
          );

        }
        else if (
          rol === 'ORGANIZACION'
        ) {

          setCurrentScreen(
            'ORGANIZACION_INICIO'
          );


          await cargarOportunidades();
          await intentarRegistrarPush(
              data.token
            )

        }
        else if (
          rol === 'ADMIN'
        ) {

          setCurrentScreen(
            'ADMIN_HOME'
          );

        }
        else {

          await eliminarToken();


          showAlert(

            'error',

            'Rol inválido',

            'El usuario no posee un rol válido dentro del sistema.'

          );


          return;

        }


        showAlert(

          'success',

          '¡Bienvenido/a!',

          `Inicio de sesión exitoso.\nRol: ${data.user.rol}`

        );

      }
      catch (error) {

        const errorMsg =

          error.response
            ?.data
            ?.error ||

          'No se pudo conectar con el servidor backend';


        showAlert(

          'error',

          'Error de Acceso',

          errorMsg

        );

      }
      finally {

        setLoading(
          false
        );

      }

    };


  // ======================================================
  // 2. REGISTRO VOLUNTARIO
  // ======================================================

  const handleRegisterVoluntario =
    async (
      data
    ) => {

      if (
        !data.nombre ||
        !data.apellido ||
        !data.email ||
        !data.password
      ) {

        showAlert(

          'error',

          'Campos Incompletos',

          'Nombre, Apellido, Correo y Contraseña son obligatorios.'

        );


        return;

      }


      setLoading(
        true
      );


      try {

        await registrarUsuario(
          data
        );


        setLoading(
          false
        );


        showAlert(

          'success',

          '¡Cuenta Creada!',

          'Tu registro como voluntario se completó con éxito. Ya podés iniciar sesión.'

        );


        setCurrentScreen(
          'A01'
        );

      }
      catch (error) {

        setLoading(
          false
        );


        const errorMsg =

          error.response
            ?.data
            ?.error ||

          'No se pudo crear la cuenta de voluntario';


        showAlert(

          'error',

          'Error de Registro',

          errorMsg

        );

      }

    };


  // ======================================================
  // 3. REGISTRO ORGANIZACIÓN
  // ======================================================

  const handleRegisterOrganizacion =
    async (
      data
    ) => {

      const camposFaltantes =
        [];


      if (
        !data.razon_social
      ) {

        camposFaltantes.push(
          'Razón Social'
        );

      }


      if (
        !data.cuit
      ) {

        camposFaltantes.push(
          'CUIT'
        );

      }


      if (
        !data.email
      ) {

        camposFaltantes.push(
          'Correo'
        );

      }


      if (
        !data.password
      ) {

        camposFaltantes.push(
          'Contraseña'
        );

      }


      if (
        camposFaltantes.length >
        0
      ) {

        showAlert(

          'error',

          'Campos Incompletos',

          `Faltan los siguientes campos: ${camposFaltantes.join(', ')}.`

        );


        return;

      }


      if (
        data.cuit.length !==
        11
      ) {

        showAlert(

          'error',

          'CUIT Inválido',

          'El CUIT debe contener exactamente 11 dígitos numéricos.'

        );


        return;

      }


      setLoading(
        true
      );


      try {

        await registrarUsuario(
          data
        );


        setLoading(
          false
        );


        showAlert(

          'success',

          '¡Organización Registrada!',

          'Tu cuenta fue creada con éxito. Su estado de verificación es PENDIENTE hasta ser revisada.'

        );


        setCurrentScreen(
          'A01'
        );

      }
      catch (error) {

        setLoading(
          false
        );


        const errorMsg =

          error.response
            ?.data
            ?.details ||

          error.response
            ?.data
            ?.error ||

          'No se pudo registrar la organización';


        showAlert(

          'error',

          'Error de Registro',

          errorMsg

        );

      }

    };


  // ======================================================
  // 4. RECUPERAR CONTRASEÑA
  // ======================================================

  const handleForgotPassword =
    async (
      email
    ) => {

      setLoading(
        true
      );


      try {

        const data =
          await recuperarPassword(
            email
          );


        setLoading(
          false
        );


        showAlert(

          'success',

          'Solicitud Enviada',

          data.message

        );


        setCurrentScreen(
          'A01'
        );

      }
      catch (error) {

        setLoading(
          false
        );


        const errorMsg =

          error.response
            ?.data
            ?.error ||

          'No se pudo procesar la solicitud.';


        showAlert(

          'error',

          'Error',

          errorMsg

        );

      }

    };


  // ======================================================
  // OPORTUNIDADES ORGANIZACIÓN
  // ======================================================

  const cargarOportunidades =
    async () => {

      setLoading(
        true
      );


      try {

        const token =
          await obtenerToken();


        if (!token) {

          await eliminarToken();


          setOportunidades(
            []
          );


          setCurrentScreen(
            'A01'
          );


          showAlert(

            'error',

            'Sesión finalizada',

            'Tu sesión no es válida. Iniciá sesión nuevamente.'

          );


          return;

        }


        const data =
          await obtenerMisOportunidades(
            token
          );


        setOportunidades(
          data.oportunidades
        );

      }
      catch (error) {

      if (
        error.response
          ?.status === 401
      ) {

        await eliminarToken();

        setOportunidades(
          []
        );

        setTiposActividad(
          []
        );

        setOportunidadEditando(
          null
        );

        setCurrentScreen(
          'A01'
        );

        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );

        return;

      }


      // Organización pendiente o rechazada:
      // navegar no debe mostrar un error.
      if (
        error.response
          ?.status === 403
      ) {

        setOportunidades(
          []
        );

        return;

      }


      const errorMsg =

        error.response
          ?.data
          ?.error ||

        'No se pudieron cargar las oportunidades';


      showAlert(
        'error',
        'Error',
        errorMsg
      );

    }
      finally {

        setLoading(
          false
        );

      }

    };

  // ======================================================
// INSCRIPCIONES DE UNA OPORTUNIDAD - ORGANIZACIÓN
// ======================================================

const abrirGestionInscripciones =
  async (oportunidad) => {

    setScrollYOrganizacionGuardado(
    scrollYOrganizacion
    );

    setLoading(true);

    try {

      const token =
        await obtenerToken();

      if (!token) {

        await eliminarToken();

        setInscripcionesOrganizacion([]);
        setOportunidadGestionando(null);

        setCurrentScreen('A01');

        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión no es válida. Iniciá sesión nuevamente.'
        );

        return;
      }

      const data =
        await obtenerInscripcionesOportunidad(
          token,
          oportunidad.id_oportunidad
        );

      setOportunidadGestionando(
        oportunidad
      );

      setInscripcionesOrganizacion(
        data.inscripciones || []
      );

      setCurrentScreen(
        'GESTION_INSCRIPCIONES'
      );

      return true;

    }
    catch (error) {

      if (
        error.response?.status === 401
      ) {

        await eliminarToken();

        setInscripcionesOrganizacion([]);
        setOportunidadGestionando(null);

        setCurrentScreen('A01');

        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );

        return false;
      }

      showAlert(
        'error',
        'Error',
        error.response?.data?.error ||
        'No se pudieron cargar las inscripciones.'
      );

    }
    finally {

      setLoading(false);

    }

  };  

  // ======================================================
// CONSULTAR PERFIL DE VOLUNTARIO DESDE UNA INSCRIPCIÓN
// MEJORA 10 - ACTIVIDAD 3.2
// ======================================================

const cargarPerfilVoluntarioOrganizacion = async (
  idInscripcion
) => {

  // ====================================================
  // 1. PREPARAR LA PANTALLA
  // ====================================================

  setPerfilVoluntarioOrganizacion(null);

  setLoadingPerfilVoluntarioOrganizacion(true);

  setCurrentScreen(
    'PERFIL_VOLUNTARIO_ORGANIZACION'
  );


  setTimeout(() => {

    scrollRef.current?.scrollTo({
      y: 0,
      animated: false
    });

  }, 0);


  try {

    // ==================================================
    // 2. RECUPERAR TOKEN
    // ==================================================

    const token =
      await obtenerToken();


    if (!token) {

      await eliminarToken();

      setPerfilVoluntarioOrganizacion(null);

      setInscripcionesOrganizacion([]);

      setOportunidadGestionando(null);

      setCurrentScreen('A01');

      showAlert(
        'error',
        'Sesión finalizada',
        'Tu sesión no es válida. Iniciá sesión nuevamente.'
      );

      return false;

    }


    // ==================================================
    // 3. CONSULTAR PERFIL AUTORIZADO
    // ==================================================

    const data =
      await obtenerPerfilVoluntarioDeInscripcion(
        token,
        idInscripcion
      );


    // ==================================================
    // 4. VALIDAR RESPUESTA
    // ==================================================

    if (!data?.perfil) {

      throw new Error(
        'El servidor no devolvió los datos del perfil.'
      );

    }


    // ==================================================
    // 5. GUARDAR INFORMACIÓN
    // ==================================================

    setPerfilVoluntarioOrganizacion(
      data.perfil
    );


    return true;

  }
  catch (error) {

    // ==================================================
    // 6. CONTROLAR SESIÓN VENCIDA
    // ==================================================

    if (
      error.response?.status === 401
    ) {

      await eliminarToken();

      setPerfilVoluntarioOrganizacion(null);

      setInscripcionesOrganizacion([]);

      setOportunidadGestionando(null);

      setCurrentScreen('A01');

      showAlert(
        'error',
        'Sesión finalizada',
        'Tu sesión venció. Iniciá sesión nuevamente.'
      );

      return false;

    }


    // ==================================================
    // 7. MANEJAR OTROS ERRORES
    // ==================================================

    setPerfilVoluntarioOrganizacion(null);

    setCurrentScreen(
      'GESTION_INSCRIPCIONES'
    );


    showAlert(
      'error',
      'No se pudo consultar el perfil',

      error.response?.data?.mensaje ||
      error.response?.data?.error ||
      error.message ||
      'Ocurrió un error al consultar el perfil del voluntario.'
    );


    return false;

  }
  finally {

    setLoadingPerfilVoluntarioOrganizacion(false);

  }

};

  // ======================================================
// ACEPTAR INSCRIPCIÓN - ORGANIZACIÓN
// ======================================================

const handleAceptarInscripcion =
  async (idInscripcion) => {

    if (!oportunidadGestionando) {
      return;
    }

    setLoading(true);

    try {

      const token =
        await obtenerToken();

      if (!token) {

        await eliminarToken();

        setInscripcionesOrganizacion([]);
        setOportunidadGestionando(null);

        setCurrentScreen('A01');

        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión no es válida. Iniciá sesión nuevamente.'
        );

        return;
      }

      await aceptarInscripcion(
        token,
        idInscripcion
      );

      const data =
        await obtenerInscripcionesOportunidad(
          token,
          oportunidadGestionando.id_oportunidad
        );

      setInscripcionesOrganizacion(
        data.inscripciones || []
      );
      await cargarOportunidades();

      showAlert(
        'success',
        'Inscripción aceptada',
        'El voluntario fue aceptado correctamente.'
      );

    }
    catch (error) {

      if (error.response?.status === 401) {

        await eliminarToken();

        setInscripcionesOrganizacion([]);
        setOportunidadGestionando(null);

        setCurrentScreen('A01');

        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );

        return;
      }

      showAlert(
        'error',
        'No se pudo aceptar',
        error.response?.data?.error ||
        error.response?.data?.mensaje ||
        'Ocurrió un error al aceptar la inscripción.'
      );

    }
    finally {

      setLoading(false);

    }

  };


// ======================================================
// RECHAZAR INSCRIPCIÓN - ORGANIZACIÓN
// ======================================================

const handleRechazarInscripcion =
  async (idInscripcion) => {

    if (!oportunidadGestionando) {
      return;
    }

    setLoading(true);

    try {

      const token =
        await obtenerToken();

      if (!token) {

        await eliminarToken();

        setInscripcionesOrganizacion([]);
        setOportunidadGestionando(null);

        setCurrentScreen('A01');

        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión no es válida. Iniciá sesión nuevamente.'
        );

        return;
      }

      await rechazarInscripcion(
        token,
        idInscripcion
      );

      const data =
        await obtenerInscripcionesOportunidad(
          token,
          oportunidadGestionando.id_oportunidad
        );

      setInscripcionesOrganizacion(
        data.inscripciones || []
      );

      showAlert(
        'success',
        'Inscripción rechazada',
        'La inscripción fue rechazada correctamente.'
      );

    }
    catch (error) {

      if (error.response?.status === 401) {

        await eliminarToken();

        setInscripcionesOrganizacion([]);
        setOportunidadGestionando(null);

        setCurrentScreen('A01');

        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );

        return;
      }

      showAlert(
        'error',
        'No se pudo rechazar',
        error.response?.data?.error ||
        error.response?.data?.mensaje ||
        'Ocurrió un error al rechazar la inscripción.'
      );

    }
    finally {

      setLoading(false);

    }

  };

  // ======================================================
// MARCAR RESULTADO DE PARTICIPACIÓN - ORGANIZACIÓN
// ======================================================

const handleMarcarResultadoParticipacion = async (
  idInscripcion,
  estado
) => {

  setLoading(true);

  try {

    const token =
      await obtenerToken();

    if (!token) {

      await eliminarToken();

      setCurrentScreen(
        'A01'
      );

      showAlert(
        'error',
        'Sesión finalizada',
        'Tu sesión no es válida. Iniciá sesión nuevamente.'
      );

      return;
    }


    await marcarResultadoParticipacion(
      token,
      idInscripcion,
      estado
    );


    if (
      oportunidadGestionando
        ?.id_oportunidad
    ) {

      const data =
        await obtenerInscripcionesOportunidad(
          token,
          oportunidadGestionando.id_oportunidad
        );

      setInscripcionesOrganizacion(
        data.inscripciones || []
      );

    }


    showAlert(
      'success',
      'Participación actualizada',
      estado === 'COMPLETADA'
        ? 'El voluntario fue marcado como participante de la actividad.'
        : 'El voluntario fue marcado como ausente.'
    );

  }
  catch (error) {

    if (
      error.response?.status === 401
    ) {

      await eliminarToken();

      setCurrentScreen(
        'A01'
      );

      showAlert(
        'error',
        'Sesión finalizada',
        'Tu sesión venció. Iniciá sesión nuevamente.'
      );

      return;
    }


    showAlert(
      'error',
      'No se pudo actualizar',
      error.response?.data?.error ||
      'No se pudo actualizar el resultado de participación.'
    );

  }
  finally {

    setLoading(false);

  }

};

// ======================================================
// CALIFICAR VOLUNTARIO POR ORGANIZACIÓN
// ACTIVIDAD 3.2.1
// ======================================================

const handleCalificarVoluntario = async (
  idInscripcion,
  puntuacion,
  comentario
) => {

  setLoadingCalificacion(true);

  try {

    // ==================================================
    // 1. OBTENER TOKEN
    // ==================================================

    const token =
      await obtenerToken();

    if (!token) {

      await eliminarToken();

      setCurrentScreen('A01');

      showAlert(
        'error',
        'Sesión finalizada',
        'Tu sesión no es válida. Iniciá sesión nuevamente.'
      );

      return false;

    }


    // ==================================================
    // 2. ENVIAR CALIFICACIÓN AL BACKEND
    // ==================================================

    await calificarVoluntario(
      token,
      idInscripcion,
      puntuacion,
      comentario
    );


    // ==================================================
    // 3. ACTUALIZAR ESTADO LOCAL DE LA INSCRIPCIÓN
    // ==================================================

    setInscripcionesOrganizacion(
      (inscripcionesActuales) =>

        inscripcionesActuales.map(
          (inscripcion) => {

            if (
              inscripcion.id_inscripcion ===
              idInscripcion
            ) {

              return {
                ...inscripcion,

                calificada_por_organizacion: true
              };

            }

            return inscripcion;

          }
        )
    );


    // ==================================================
    // 4. CONFIRMAR OPERACIÓN
    // ==================================================

    return true;

  }
  catch (error) {

    // ==================================================
    // 5. MANEJAR SESIÓN VENCIDA
    // ==================================================

    if (
      error.response?.status === 401
    ) {

      await eliminarToken();

      setCurrentScreen('A01');

      showAlert(
        'error',
        'Sesión finalizada',
        'Tu sesión venció. Iniciá sesión nuevamente.'
      );

      return false;

    }


    // ==================================================
    // 6. MOSTRAR ERROR DEL BACKEND
    // ==================================================

    showAlert(
      'error',
      'No se pudo calificar',
      error.response?.data?.mensaje ||
      error.response?.data?.error ||
      'Ocurrió un error al registrar la calificación.'
    );

    return false;

  }
  finally {

    setLoadingCalificacion(false);

  }

};

// ======================================================
// CALIFICAR ORGANIZACIÓN COMO VOLUNTARIO
// ACTIVIDAD 3.2.2
// ======================================================

const handleCalificarOrganizacion = async (
  idInscripcion,
  puntuacion,
  comentario
) => {

  setLoadingCalificacionOrganizacion(true);

  try {

    // ==================================================
    // 1. OBTENER TOKEN DEL VOLUNTARIO
    // ==================================================

    const token = await obtenerToken();

    if (!token) {

      await eliminarToken();

      setInscripcionesVoluntario([]);

      setCurrentScreen('A01');

      showAlert(
        'error',
        'Sesión finalizada',
        'Tu sesión no es válida. Iniciá sesión nuevamente.'
      );

      return false;

    }


    // ==================================================
    // 2. REGISTRAR CALIFICACIÓN EN EL BACKEND
    // ==================================================

    await calificarOrganizacion(
      token,
      idInscripcion,
      puntuacion,
      comentario
    );


    // ==================================================
    // 3. ACTUALIZAR ESTADO LOCAL DE LA INSCRIPCIÓN
    // ==================================================

    setInscripcionesVoluntario(
      (actuales) =>
        actuales.map(
          (inscripcion) =>

            inscripcion.id_inscripcion === idInscripcion

              ? {
                  ...inscripcion,
                  calificada_por_voluntario: true
                }

              : inscripcion

        )
    );


    // ==================================================
    // 4. CONFIRMAR OPERACIÓN
    // ==================================================

    return true;

  }
  catch (error) {

    // ==================================================
    // 5. MANEJAR SESIÓN VENCIDA
    // ==================================================

    if (
      error.response?.status === 401
    ) {

      await eliminarToken();

      setInscripcionesVoluntario([]);

      setCurrentScreen('A01');

      showAlert(
        'error',
        'Sesión finalizada',
        'Tu sesión venció. Iniciá sesión nuevamente.'
      );

      return false;

    }


    // ==================================================
    // 6. MOSTRAR ERRORES DEL BACKEND
    // ==================================================

    showAlert(
      'error',
      'No se pudo calificar la organización',
      error.response?.data?.mensaje ||
      error.response?.data?.error ||
      'Ocurrió un error al registrar la calificación.'
    );

    return false;

  }
  finally {

    setLoadingCalificacionOrganizacion(false);

  }

};

// ======================================================
// CARGAR ESTADÍSTICAS DE LA ORGANIZACIÓN
// ACTIVIDAD 3.4.1
// ======================================================

const cargarEstadisticasOrganizacion =
  async () => {

    setLoadingEstadisticasOrganizacion(
      true
    );


    try {

      const token =
        await obtenerToken();


      if (!token) {

        await eliminarToken();

        setEstadisticasOrganizacion(
          null
        );

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión no es válida. Iniciá sesión nuevamente.'
        );


        return false;

      }


      const data =
        await obtenerEstadisticasOrganizacion(
          token
        );


      setEstadisticasOrganizacion(
        data?.estadisticas || null
      );


      return true;

    }
    catch (error) {

      if (
        error.response?.status === 401
      ) {

        await eliminarToken();

        setEstadisticasOrganizacion(
          null
        );

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );


        return false;

      }


      if (
        error.response?.status === 403
      ) {

        showAlert(
          'error',
          'Acceso no permitido',
          error.response?.data?.error ||
          'No tenés permisos para consultar estas estadísticas.'
        );


        return false;

      }


      showAlert(
        'error',
        'Error',
        error.response?.data?.error ||
        'No se pudieron cargar las estadísticas de la organización.'
      );


      return false;

    }
    finally {

      setLoadingEstadisticasOrganizacion(
        false
      );

    }

  };

// ======================================================
// ADMIN - ORGANIZACIONES PENDIENTES
// ======================================================

const cargarOrganizacionesPendientes =
  async () => {

    setLoadingAdmin(
      true
    );


    try {

      const token =
        await obtenerToken();


      if (!token) {

        await eliminarToken();

        setOrganizacionesPendientes(
          []
        );

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión no es válida. Iniciá sesión nuevamente.'
        );


        return false;

      }


      const data =
        await obtenerOrganizacionesPendientes(
          token
        );


      const organizaciones =
        data?.organizaciones;


      if (
        !Array.isArray(
          organizaciones
        )
      ) {

        setOrganizacionesPendientes(
          []
        );


        showAlert(
          'error',
          'Error',
          'La respuesta de organizaciones pendientes no es válida.'
        );


        return false;

      }


      setOrganizacionesPendientes(
        organizaciones
      );


      return true;

    }
    catch (error) {

      if (
        error.response?.status ===
        401
      ) {

        await eliminarToken();

        setOrganizacionesPendientes(
          []
        );

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );


        return false;

      }


      if (
        error.response?.status ===
        403
      ) {

        showAlert(
          'error',
          'Acceso no autorizado',
          'Tu cuenta no tiene permisos de administrador.'
        );


        return false;

      }


      showAlert(
        'error',
        'Error',
        error.response
          ?.data
          ?.error ||
        'No se pudieron obtener las organizaciones pendientes.'
      );


      return false;

    }
    finally {

      setLoadingAdmin(
        false
      );

    }

  };

// ======================================================
// ADMIN - USUARIOS
// ======================================================

const cargarUsuariosAdmin =
  async () => {

    setLoadingUsuariosAdmin(
      true
    );


    try {

      const token =
        await obtenerToken();


      if (!token) {

        await eliminarToken();

        setUsuariosAdmin(
          []
        );

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión no es válida. Iniciá sesión nuevamente.'
        );


        return false;

      }


      const data =
        await obtenerUsuarios(
          token
        );


      const usuarios =
        data?.usuarios;


      if (
        !Array.isArray(
          usuarios
        )
      ) {

        setUsuariosAdmin(
          []
        );


        showAlert(
          'error',
          'Error',
          'La respuesta de usuarios no es válida.'
        );


        return false;

      }


      setUsuariosAdmin(
        usuarios
      );


      return true;

    }
    catch (error) {

      if (
        error.response?.status ===
        401
      ) {

        await eliminarToken();

        setUsuariosAdmin(
          []
        );

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );


        return false;

      }


      if (
        error.response?.status ===
        403
      ) {

        showAlert(
          'error',
          'Acceso no autorizado',
          'Tu cuenta no tiene permisos de administrador.'
        );


        return false;

      }


      showAlert(
        'error',
        'Error',
        error.response
          ?.data
          ?.error ||
        'No se pudieron obtener los usuarios.'
      );


      return false;

    }
    finally {

      setLoadingUsuariosAdmin(
        false
      );

    }

  };


  const cargarTiposActividadAdmin =
  async () => {

    setLoadingTiposActividadAdmin(true);

    try {

      const token =
        await obtenerToken();

      if (!token) {

        await eliminarToken();

        setCurrentScreen('A01');

        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión no es válida. Iniciá sesión nuevamente.'
        );

        return;
      }


      const data =
        await obtenerTiposActividadAdmin(
          token
        );


      setTiposActividadAdmin(
        Array.isArray(data.tiposActividad)
          ? data.tiposActividad
          : []
      );

    }
    catch (error) {

      if (
        error.response?.status === 401
      ) {

        await eliminarToken();

        setCurrentScreen('A01');

        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );

        return;
      }


      if (
        error.response?.status === 403
      ) {

        showAlert(
          'error',
          'Acceso no autorizado',
          'Tu cuenta no tiene permisos de administrador.'
        );

        return;
      }


      showAlert(
        'error',
        'No se pudieron cargar los tipos',
        error.response?.data?.error ||
          'No se pudo obtener el catálogo de tipos de actividad.'
      );

    }
    finally {

      setLoadingTiposActividadAdmin(false);

    }

  };

// ======================================================
// CARGAR ESTADÍSTICAS GLOBALES - ADMIN
// ACTIVIDAD 3.4.2
// ======================================================

const cargarEstadisticasAdmin =
  async () => {

    setLoadingEstadisticasAdmin(
      true
    );


    try {

      const token =
        await obtenerToken();


      if (!token) {

        await eliminarToken();

        setEstadisticasAdmin(
          null
        );

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión no es válida. Iniciá sesión nuevamente.'
        );


        return false;

      }


      const data =
        await obtenerEstadisticasGlobales(
          token
        );


      setEstadisticasAdmin(
        data?.estadisticas ||
        null
      );


      return true;

    }
    catch (error) {

      if (
        error.response
          ?.status === 401
      ) {

        await eliminarToken();

        setEstadisticasAdmin(
          null
        );

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );


        return false;

      }


      if (
        error.response
          ?.status === 403
      ) {

        setEstadisticasAdmin(
          null
        );


        showAlert(
          'error',
          'Acceso no autorizado',
          'Tu cuenta no tiene permisos de administrador.'
        );


        return false;

      }


      setEstadisticasAdmin(
        null
      );


      showAlert(
        'error',
        'No se pudieron cargar las estadísticas',
        error.response
          ?.data
          ?.error ||
        'No fue posible obtener las métricas globales del sistema.'
      );


      return false;

    }
    finally {

      setLoadingEstadisticasAdmin(
        false
      );

    }

  };


  // ======================================================
// CREAR TIPO DE ACTIVIDAD - ADMIN
// ======================================================

const handleCrearTipoActividadAdmin =
  async (nombre) => {

    setLoadingAccionAdmin(true);

    try {

      const token =
        await obtenerToken();

      if (!token) {

        await eliminarToken();

        setCurrentScreen('A01');

        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión no es válida. Iniciá sesión nuevamente.'
        );

        return false;
      }


      const data =
        await crearTipoActividadAdmin(
          token,
          nombre
        );


      showAlert(
        'success',
        'Tipo creado',
        data.message ||
          'El tipo de actividad fue creado correctamente.'
      );


      await cargarTiposActividadAdmin();

      return true;

    }
    catch (error) {

      if (
        error.response?.status === 401
      ) {

        await eliminarToken();

        setCurrentScreen('A01');

        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );

        return false;
      }


      if (
        error.response?.status === 403
      ) {

        showAlert(
          'error',
          'Acceso no autorizado',
          'Tu cuenta no tiene permisos de administrador.'
        );

        return false;
      }


      showAlert(
        'error',
        'No se pudo crear',
        error.response?.data?.error ||
          'No se pudo crear el tipo de actividad.'
      );

      return false;

    }
    finally {

      setLoadingAccionAdmin(false);

    }

  };


// ======================================================
// ACTUALIZAR TIPO DE ACTIVIDAD - ADMIN
// ======================================================

const handleActualizarTipoActividadAdmin =
  async (
    idTipoActividad,
    nombre
  ) => {

    setLoadingAccionAdmin(true);

    try {

      const token =
        await obtenerToken();

      if (!token) {

        await eliminarToken();

        setCurrentScreen('A01');

        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión no es válida. Iniciá sesión nuevamente.'
        );

        return false;
      }


      const data =
        await actualizarTipoActividadAdmin(
          token,
          idTipoActividad,
          nombre
        );


      showAlert(
        'success',
        'Tipo actualizado',
        data.message ||
          'El tipo de actividad fue actualizado correctamente.'
      );


      await cargarTiposActividadAdmin();

      return true;

    }
    catch (error) {

      if (
        error.response?.status === 401
      ) {

        await eliminarToken();

        setCurrentScreen('A01');

        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );

        return false;
      }


      if (
        error.response?.status === 403
      ) {

        showAlert(
          'error',
          'Acceso no autorizado',
          'Tu cuenta no tiene permisos de administrador.'
        );

        return false;
      }


      showAlert(
        'error',
        'No se pudo actualizar',
        error.response?.data?.error ||
          'No se pudo actualizar el tipo de actividad.'
      );

      return false;

    }
    finally {

      setLoadingAccionAdmin(false);

    }

  };

// ======================================================
// ADMIN - BLOQUEAR USUARIO
// ======================================================

const handleBloquearUsuarioAdmin =
  async (
    idUsuario,
    motivo
  ) => {

    if (
      !motivo ||
      !motivo.trim()
    ) {

      showAlert(
        'error',
        'Motivo obligatorio',
        'Ingresá un motivo para bloquear la cuenta.'
      );

      return false;

    }


    setLoadingAccionAdmin(
      true
    );


    try {

      const token =
        await obtenerToken();


      if (!token) {

        await eliminarToken();

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión no es válida. Iniciá sesión nuevamente.'
        );


        return false;

      }


      const data =
        await bloquearUsuario(
          token,
          idUsuario,
          motivo.trim()
        );


      showAlert(
        'success',
        'Cuenta bloqueada',
        data.message ||
        'El usuario fue bloqueado correctamente.'
      );


      await cargarUsuariosAdmin();


      return true;

    }
    catch (error) {

      if (
        error.response?.status ===
        401
      ) {

        await eliminarToken();

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );


        return false;

      }


      if (
        error.response?.status ===
        403
      ) {

        showAlert(
          'error',
          'Acceso no autorizado',
          'Tu cuenta no tiene permisos de administrador.'
        );


        return false;

      }


      showAlert(
        'error',
        'No se pudo bloquear',
        error.response
          ?.data
          ?.error ||
        'No se pudo bloquear la cuenta.'
      );


      return false;

    }
    finally {

      setLoadingAccionAdmin(
        false
      );

    }

  };

  // ======================================================
// ADMIN - REHABILITAR USUARIO
// ======================================================

const handleRehabilitarUsuarioAdmin =
  async (
    idUsuario
  ) => {

    setLoadingAccionAdmin(
      true
    );


    try {

      const token =
        await obtenerToken();


      if (!token) {

        await eliminarToken();

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión no es válida. Iniciá sesión nuevamente.'
        );


        return false;

      }


      const data =
        await rehabilitarUsuario(
          token,
          idUsuario
        );


      showAlert(
        'success',
        'Cuenta rehabilitada',
        data.message ||
        'El usuario fue rehabilitado correctamente.'
      );


      await cargarUsuariosAdmin();


      return true;

    }
    catch (error) {

      if (
        error.response?.status ===
        401
      ) {

        await eliminarToken();

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );


        return false;

      }


      if (
        error.response?.status ===
        403
      ) {

        showAlert(
          'error',
          'Acceso no autorizado',
          'Tu cuenta no tiene permisos de administrador.'
        );


        return false;

      }


      showAlert(
        'error',
        'No se pudo rehabilitar',
        error.response
          ?.data
          ?.error ||
        'No se pudo rehabilitar la cuenta.'
      );


      return false;

    }
    finally {

      setLoadingAccionAdmin(
        false
      );

    }

  };

  // ======================================================
// ADMIN - APROBAR ORGANIZACIÓN
// ======================================================

const handleAprobarOrganizacion =
  async () => {

    if (
      !organizacionAdminSeleccionada
        ?.id_organizacion
    ) {

      showAlert(
        'error',
        'Error',
        'No se pudo identificar la organización.'
      );

      return false;

    }


    setLoadingAccionAdmin(
      true
    );


    try {

      const token =
        await obtenerToken();


      if (!token) {

        await eliminarToken();

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión no es válida. Iniciá sesión nuevamente.'
        );


        return false;

      }


      const data =
        await aprobarOrganizacion(
          token,
          organizacionAdminSeleccionada
            .id_organizacion
        );


      showAlert(
        'success',
        'Organización aprobada',
        data.message ||
        'La organización fue verificada correctamente.'
      );


      setOrganizacionAdminSeleccionada(
        null
      );


      await cargarOrganizacionesPendientes();


      setCurrentScreen(
        'ADMIN_ORGANIZACIONES'
      );


      return true;

    }
    catch (error) {

      if (
        error.response?.status ===
        401
      ) {

        await eliminarToken();

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );


        return false;

      }


      showAlert(
        'error',
        'No se pudo aprobar',
        error.response
          ?.data
          ?.error ||
        'No se pudo aprobar la organización.'
      );


      return false;

    }
    finally {

      setLoadingAccionAdmin(
        false
      );

    }

  };

  // ======================================================
// ADMIN - ANULAR REGISTRO DE ORGANIZACIÓN
// ======================================================

const handleAnularRegistroOrganizacion =
  async (motivo) => {

    if (
      !organizacionAdminSeleccionada
        ?.id_organizacion
    ) {

      showAlert(
        'error',
        'Error',
        'No se pudo identificar la organización.'
      );

      return false;

    }


    if (
      !motivo ||
      !motivo.trim()
    ) {

      showAlert(
        'error',
        'Motivo obligatorio',
        'Ingresá un motivo para anular el registro.'
      );

      return false;

    }


    setLoadingAccionAdmin(true);


    try {

      const token =
        await obtenerToken();


      if (!token) {

        await eliminarToken();

        setCurrentScreen('A01');

        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión no es válida. Iniciá sesión nuevamente.'
        );

        return false;

      }


      const data =
        await anularRegistroOrganizacion(
          token,
          organizacionAdminSeleccionada
            .id_organizacion,
          motivo.trim()
        );


      await cargarOrganizacionesPendientes();


      setOrganizacionAdminSeleccionada(
        null
      );


      setCurrentScreen(
        'ADMIN_ORGANIZACIONES'
      );


      showAlert(
        'success',
        'Registro anulado',
        data.message ||
          'El registro de la organización fue anulado correctamente.'
      );


      return true;

    }
    catch (error) {

      if (
        error.response?.status === 401
      ) {

        await eliminarToken();

        setCurrentScreen('A01');

        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );

        return false;

      }


      if (
        error.response?.status === 403
      ) {

        showAlert(
          'error',
          'Acceso no autorizado',
          'Tu cuenta no tiene permisos de administrador.'
        );

        return false;

      }


      showAlert(
        'error',
        'No se pudo anular',
        error.response?.data?.error ||
          'No se pudo anular el registro de la organización.'
      );


      return false;

    }
    finally {

      setLoadingAccionAdmin(false);

    }

  };

  // ======================================================
// ADMIN - RECHAZAR ORGANIZACIÓN
// ======================================================

const handleRechazarOrganizacion =
  async (motivo) => {

    if (
      !organizacionAdminSeleccionada
        ?.id_organizacion
    ) {

      showAlert(
        'error',
        'Error',
        'No se pudo identificar la organización.'
      );

      return false;

    }


    if (
      !motivo ||
      !motivo.trim()
    ) {

      showAlert(
        'error',
        'Motivo obligatorio',
        'Ingresá un motivo para rechazar la organización.'
      );

      return false;

    }


    setLoadingAccionAdmin(
      true
    );


    try {

      const token =
        await obtenerToken();


      if (!token) {

        await eliminarToken();

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión no es válida. Iniciá sesión nuevamente.'
        );


        return false;

      }


      const data =
        await rechazarOrganizacion(
          token,
          organizacionAdminSeleccionada
            .id_organizacion,
          motivo.trim()
        );


      showAlert(
        'success',
        'Organización rechazada',
        data.message ||
        'La organización fue rechazada correctamente.'
      );


      setOrganizacionAdminSeleccionada(
        null
      );


      await cargarOrganizacionesPendientes();


      setCurrentScreen(
        'ADMIN_ORGANIZACIONES'
      );


      return true;

    }
    catch (error) {

      if (
        error.response?.status ===
        401
      ) {

        await eliminarToken();

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );


        return false;

      }


      showAlert(
        'error',
        'No se pudo rechazar',
        error.response
          ?.data
          ?.error ||
        'No se pudo rechazar la organización.'
      );


      return false;

    }
    finally {

      setLoadingAccionAdmin(
        false
      );

    }

  };

  // ======================================================
  // 5. CERRAR SESIÓN
  // ======================================================

  const handleLogout =
    () => {

      setLogoutVisible(
        true
      );

    };


  const confirmarLogout =
    async () => {
      
       // ==================================================
    // DESACTIVAR NOTIFICACIONES PUSH
    // ACTIVIDAD 3.3.1
    // ==================================================

    const jwt = await obtenerToken();

    if (jwt) {

      try {

        await desactivarDispositivoPush(
          jwt
        );

      }
      catch (error) {

        console.warn(

          'No se pudo desactivar el dispositivo push:',

          error.response?.data?.mensaje ||
          error.message

        );

        showAlert(
          'error',
          'Advertencia de notificaciones',
          'No se pudo desactivar el dispositivo. Podrías seguir recibiendo notificaciones de esta cuenta hasta que se regularice el registro.'
        );

      }

    }


    // ==================================================
    // ELIMINAR JWT
    // ==================================================
      await eliminarToken();

      // Limpiar notificaciones de la sesión anterior
        setNotificacionesVoluntario([]);

        setCantidadNoLeidas(0);

        setLoadingNotificaciones(false);

      setOportunidades(
        []
      );

      setInscripcionesVoluntario([]);

        setInscripcionesOrganizacion([]);

        setOportunidadGestionando(null);

        setFiltroEstadoInscripciones('TODAS');

        setDatosOrganizacion(null);

        // Limpiar información de administración.
        setUsuariosAdmin([]);

        setTiposActividadAdmin([]);

      setOportunidadesVoluntario(
        []
      );

      setOportunidadesInicioVoluntario(
        []
      );

      setRecomendacionesVoluntario(
        []
      );

      setRecomendacionesCargadas(
        false
      );

      setLoadingRecomendaciones(
        false
      );

      setUbicacionRecomendaciones(
        null
      );

      setTiposActividad(
        []
      );

      setInteresesVoluntario(
        []
      );

      setLoadingInteresesVoluntario(
        false
      );


      setOportunidadEditando(
        null
      );


      setOportunidadSeleccionada(
        null
      );

      setPerfilVoluntarioOrganizacion(null);

      setLoadingPerfilVoluntarioOrganizacion(false);

      setLoadingDetalle(
        false
      );
    
      setDatosVoluntario(null);

    setLoadingDatosVoluntario(false);

    setReputacionVoluntario(null);
    setLoadingCalificacionOrganizacion(false);

setLoadingReputacionVoluntario(false);

setReputacionOrganizacion(null);

setLoadingReputacionOrganizacion(false);

      setFiltrosVoluntario(
        {}

     
      );


      setEstadoUbicacionVoluntario({

        modoUbicacion:
          null,

        ubicacionActual:
          null,

        ubicacionManualSeleccionada:
          null,

        direccionActual:
          '',

        textoUbicacion:
          '',

        radioBusquedaKm:
          '',

      });

  setBusquedaOrganizacion('');

// Restablecer filtro de estado.
setFiltroEstadoOrganizacion('TODAS');

      // ======================================================
        // LIMPIAR BÚSQUEDA DE ORGANIZACIONES AL CERRAR SESIÓN
        // MEJORA UX - ACTIVIDAD 3.3.2
        // ======================================================

        // Limpiar filtros de búsqueda:
        // nombre, tipo de actividad y ubicación.
        setFiltrosDonacion({});

        // Limpiar resultados de la sesión anterior.
        setOrganizacionesDonacion([]);

        // Limpiar organización seleccionada.
        setOrganizacionDonacionSeleccionada(null);

        // Restablecer estado de carga.
        setLoadingDonacion(false);

        // Restablecer filtros y datos de ubicación.
        setEstadoUbicacionDonacion({

          modoUbicacion: null,

          ubicacionActual: null,

          ubicacionManualSeleccionada: null,

          direccionActual: '',

          textoUbicacion: '',

          radioBusquedaKm: '',

        });

        // Restablecer posición de desplazamiento.
        setScrollYDonacion(0);


      setScrollYVoluntario(
        0
      );

      setScrollYInicioVoluntario(
        0
      );

      setScrollYInscripciones(
        0
      );

      setDonacionesVoluntario(
        []
      );

      setFiltroEstadoDonaciones(
        null
      );

      setDonacionSeleccionada(
        null
      );

      setLoadingMisDonaciones(
        false
      );

      setLoadingDetalleDonacionPropia(
        false
      );

      setScrollYMisDonaciones(
        0
      );

      setDonacionesRecibidas(
          []
        );

        setEstadoFiltroDonacionesRecibidas(
          'TODAS'
        );

        setDonacionRecibidaSeleccionada(
          null
        );

        setLoadingDonacionesRecibidas(
          false
        );

        setLoadingDetalleDonacionRecibida(
          false
        );

        setLoadingAccionDonacion(
          false
        );

        setScrollYDonacionesRecibidas(
          0
        );

        setOrganizacionesPendientes(
          []
        );

        setLoadingAdmin(
          false
        );

        setOrganizacionAdminSeleccionada(
          null
        );

        setLoadingAccionAdmin(
          false
        );


      setLogoutVisible(
        false
      );


      setCurrentScreen(
        'A01'
      );

    };


  // ======================================================
  // TIPOS DE ACTIVIDAD
  // ======================================================

  const cargarTiposActividad =
    async () => {

      try {

        const token =
          await obtenerToken();


        if (!token) {

          await eliminarToken();


          setOportunidades(
            []
          );


          setTiposActividad(
            []
          );


          setOportunidadEditando(
            null
          );


          setCurrentScreen(
            'A01'
          );


          showAlert(

            'error',

            'Sesión finalizada',

            'Tu sesión no es válida. Iniciá sesión nuevamente.'

          );


          return false;

        }


        const data =
          await obtenerTiposActividad(
            token
          );


        const tipos =
          data?.tiposActividad;


        if (
          !Array.isArray(
            tipos
          )
        ) {

          showAlert(

            'error',

            'Error',

            'La respuesta de tipos de actividad no es válida.'

          );


          return false;

        }


        setTiposActividad(
          tipos
        );


        return true;

      }
      catch (error) {

        if (
          error.response
            ?.status === 401
        ) {

          await eliminarToken();


          setOportunidades(
            []
          );


          setTiposActividad(
            []
          );


          setOportunidadEditando(
            null
          );


          setCurrentScreen(
            'A01'
          );


          showAlert(

            'error',

            'Sesión finalizada',

            'Tu sesión venció. Iniciá sesión nuevamente.'

          );


          return false;

        }


        showAlert(

          'error',

          'Error',

          error.response
            ?.data
            ?.error ||

          'No se pudieron cargar los tipos de actividad.'

        );


        return false;

      }

    };


  // ======================================================
  // OPORTUNIDADES INICIO VOLUNTARIO
  // ======================================================

  const cargarOportunidadesInicioVoluntario =
    async () => {

      setLoadingInicioVoluntario(
        true
      );


      try {

        const token =
          await obtenerToken();


        if (!token) {

          await eliminarToken();


          setOportunidadesInicioVoluntario(
            []
          );


          setCurrentScreen(
            'A01'
          );


          showAlert(

            'error',

            'Sesión finalizada',

            'Tu sesión no es válida. Iniciá sesión nuevamente.'

          );


          return false;

        }


        /*
          Inicio siempre consulta sin filtros.

          De esta manera el mapa principal muestra
          todas las oportunidades disponibles,
          independientemente de los filtros que el
          voluntario haya utilizado en Buscar.
        */

        const data =
          await obtenerOportunidadesVoluntario(
            token,
            {}
          );


        setOportunidadesInicioVoluntario(

          Array.isArray(
            data?.oportunidades
          )

            ? data.oportunidades

            : []

        );


        return true;

      }
      catch (error) {

        if (
          error.response
            ?.status === 401
        ) {

          await eliminarToken();


          setOportunidadesInicioVoluntario(
            []
          );


          setCurrentScreen(
            'A01'
          );


          showAlert(

            'error',

            'Sesión finalizada',

            'Tu sesión venció. Iniciá sesión nuevamente.'

          );


          return false;

        }


        showAlert(

          'error',

          'Error',

          error.response
            ?.data
            ?.error ||

          'No se pudieron cargar las oportunidades del inicio.'

        );


        return false;

      }
      finally {

        setLoadingInicioVoluntario(
          false
        );

      }

    };

  // ======================================================
  // CARGAR RECOMENDACIONES DEL VOLUNTARIO
  // ACTIVIDAD 3.1.2
  // ======================================================

  const cargarRecomendacionesVoluntario =
    async (
      ubicacion = null
    ) => {

      setLoadingRecomendaciones(
        true
      );


      try {

        const token =
          await obtenerToken();


        if (!token) {

          await eliminarToken();


          setRecomendacionesVoluntario(
            []
          );


          setCurrentScreen(
            'A01'
          );


          showAlert(
            'error',
            'Sesión finalizada',
            'Tu sesión no es válida. Iniciá sesión nuevamente.'
          );


          return false;

        }


        const data =
          await obtenerRecomendacionesVoluntario(
            token,
            ubicacion
          );


        setRecomendacionesVoluntario(

          Array.isArray(
            data?.recomendaciones
          )

            ? data.recomendaciones

            : []

        );

        setRecomendacionesCargadas(
          true
        );

        return true;

      }
      catch (error) {

        console.error(
          'ERROR AL CARGAR RECOMENDACIONES:',
          error
        );


        if (
          error.response?.status === 401
        ) {

          await eliminarToken();


          setRecomendacionesVoluntario(
            []
          );
          
          setRecomendacionesCargadas(
            true
          );

          setCurrentScreen(
            'A01'
          );


          showAlert(
            'error',
            'Sesión finalizada',
            'Tu sesión venció. Iniciá sesión nuevamente.'
          );


          return false;

        }


        setRecomendacionesVoluntario(
          []
        );


        showAlert(
          'error',
          'Recomendaciones no disponibles',
          error.response
            ?.data
            ?.error ||
          'No se pudieron obtener las recomendaciones.'
        );


        return false;

      }
      finally {

        setLoadingRecomendaciones(
          false
        );

      }

    };

    // ======================================================
    // CARGAR INTERESES DEL VOLUNTARIO
    // ACTIVIDAD 3.1.2
    // ======================================================

    const cargarInteresesVoluntario =
      async () => {

        setLoadingInteresesVoluntario(
          true
        );

        try {

          const token =
            await obtenerToken();

          if (!token) {

            await eliminarToken();

            setInteresesVoluntario(
              []
            );

            setCurrentScreen(
              'A01'
            );

            return false;

          }


          const data =
            await obtenerInteresesVoluntario(
              token
            );


          setInteresesVoluntario(

            Array.isArray(
              data?.intereses
            )

              ? data.intereses

              : []

          );


          return true;

        }
        catch (error) {

          console.error(
            'ERROR AL CARGAR INTERESES:',
            error
          );


          setInteresesVoluntario(
            []
          );


          return false;

        }
        finally {

          setLoadingInteresesVoluntario(
            false
          );

        }

      };

  // ======================================================
  // ACTUALIZAR INTERESES DEL VOLUNTARIO
  // ACTIVIDAD 3.1.2
  // ======================================================

  const guardarInteresesVoluntario =
    async (
      idsIntereses
    ) => {

      setLoadingInteresesVoluntario(
        true
      );

      try {

        const token =
          await obtenerToken();


        if (!token) {

          await eliminarToken();

          setCurrentScreen(
            'A01'
          );

          return false;

        }


        const data =
          await actualizarInteresesVoluntario(
            token,
            idsIntereses
          );


        setInteresesVoluntario(

          Array.isArray(
            data?.intereses
          )

            ? data.intereses

            : []

        );


        // Los intereses modifican el puntaje,
        // por lo que recalculamos inmediatamente.

        await cargarRecomendacionesVoluntario(
          ubicacionRecomendaciones
        );


        return true;

      }
      catch (error) {

        console.error(
          'ERROR AL ACTUALIZAR INTERESES:',
          error
        );


        showAlert(
          'error',
          'No se pudieron guardar los intereses',
          error.response
            ?.data
            ?.error ||
          'Ocurrió un error al actualizar tus intereses.'
        );


        return false;

      }
      finally {

        setLoadingInteresesVoluntario(
          false
        );

      }

    };

  // ======================================================
  // USAR UBICACIÓN PARA RECOMENDACIONES
  // ======================================================

  const usarUbicacionRecomendaciones =
    async () => {

      try {

        const permiso =
          await Location
            .requestForegroundPermissionsAsync();


        if (
          permiso.status !==
          'granted'
        ) {

          showAlert(
          'error',
          'Permiso de ubicación',
          'No fue posible acceder a tu ubicación actual. Verificá el permiso de ubicación de la aplicación en la configuración del dispositivo. Podés seguir recibiendo recomendaciones según tus intereses e historial.'
        );



          return;

        }


        // ==================================================
      // 2. VERIFICAR QUE EL GPS ESTÉ ACTIVADO
      // ==================================================

      const serviciosActivos =
        await Location
          .hasServicesEnabledAsync();


      if (!serviciosActivos) {

        showAlert(
          'error',
          'Ubicación desactivada',
          'La ubicación de tu dispositivo está desactivada. Activala desde la configuración del celular e intentá nuevamente.'
        );

        return;

      }


      // ==================================================
      // 3. OBTENER UBICACIÓN ACTUAL
      // ==================================================

      setLoadingRecomendaciones(
        true
      );


      const posicion =
        await Location
          .getCurrentPositionAsync({
            accuracy:
              Location.Accuracy.Balanced
          });


      const ubicacion = {

        latitud:
          posicion.coords.latitude,

        longitud:
          posicion.coords.longitude,

        radioKm: 25

      };


      // ==================================================
      // 4. ACTUALIZAR RECOMENDACIONES
      // ==================================================

      setUbicacionRecomendaciones(
        ubicacion
      );


      await cargarRecomendacionesVoluntario(
        ubicacion
      );

    }
    catch (error) {

      console.error(
        'ERROR AL OBTENER UBICACIÓN:',
        error
      );


      showAlert(
        'error',
        'Ubicación no disponible',
        'No se pudo obtener tu ubicación actual. Verificá que la ubicación esté activada en tu celular e intentá nuevamente.'
      );

    }
    finally {

      setLoadingRecomendaciones(
        false
      );

    }

  };
  // ======================================================
  // OPORTUNIDADES VOLUNTARIO
  // ======================================================

  const cargarOportunidadesVoluntario =
    async (
      filtros = {}
    ) => {

      setLoading(
        true
      );


      try {

        const token =
          await obtenerToken();


        if (!token) {

          await eliminarToken();


          setOportunidadesVoluntario(
            []
          );


          setCurrentScreen(
            'A01'
          );


          showAlert(

            'error',

            'Sesión finalizada',

            'Tu sesión no es válida. Iniciá sesión nuevamente.'

          );


          return;

        }


        const data =
          await obtenerOportunidadesVoluntario(
            token,
            filtros
          );


        setOportunidadesVoluntario(
          data.oportunidades
        );

      }
      catch (error) {

        if (
          error.response
            ?.status === 401
        ) {

          await eliminarToken();


          setOportunidadesVoluntario(
            []
          );


          setCurrentScreen(
            'A01'
          );


          showAlert(

            'error',

            'Sesión finalizada',

            'Tu sesión venció. Iniciá sesión nuevamente.'

          );


          return;

        }


        showAlert(

          'error',

          'Error',

          error.response
            ?.data
            ?.error ||

          'No se pudieron cargar las oportunidades.'

        );

      }
      finally {

        setLoading(
          false
        );

      }

    };


  // ======================================================
  // DETALLE VOLUNTARIO
  // ======================================================

  const cargarDetalleOportunidadVoluntario =
    async (
      idOportunidad
    ) => {

      setLoadingDetalle(
        true
      );


      try {

        const token =
          await obtenerToken();


        if (!token) {

          await eliminarToken();


          setOportunidadSeleccionada(
            null
          );


          setCurrentScreen(
            'A01'
          );


          showAlert(

            'error',

            'Sesión finalizada',

            'Tu sesión no es válida. Iniciá sesión nuevamente.'

          );


          return false;

        }


        const data =
          await obtenerDetalleOportunidadVoluntario(
            token,
            idOportunidad
          );


        setOportunidadSeleccionada(
          data.oportunidad
        );


        setCurrentScreen(
          'OPORTUNIDAD_DETALLE'
        );


        return true;

      }
      catch (error) {

        if (
          error.response
            ?.status === 401
        ) {

          await eliminarToken();


          setOportunidadSeleccionada(
            null
          );


          setCurrentScreen(
            'A01'
          );


          showAlert(

            'error',

            'Sesión finalizada',

            'Tu sesión venció. Iniciá sesión nuevamente.'

          );


          return false;

        }


        showAlert(

          'error',

          'Error',

          error.response
            ?.data
            ?.error ||

          'No se pudo cargar la oportunidad.'

        );


        return false;

      }
      finally {

        setLoadingDetalle(
          false
        );

      }

    };

    // ======================================================
// ELIMINAR LÓGICAMENTE OPORTUNIDAD - ORGANIZACIÓN
// ======================================================

const handleEliminarOportunidad = async (
  idOportunidad
) => {

  setLoading(true);

  try {

    const token =
      await obtenerToken();

    if (!token) {

      await eliminarToken();

      setOportunidades([]);

      setCurrentScreen(
        'A01'
      );

      showAlert(
        'error',
        'Sesión finalizada',
        'Tu sesión no es válida. Iniciá sesión nuevamente.'
      );

      return;
    }


    await eliminarOportunidad(
      token,
      idOportunidad
    );


    showAlert(
      'success',
      'Oportunidad eliminada',
      'La oportunidad fue quitada de tu listado correctamente.'
    );


    await cargarOportunidades();

  }
  catch (error) {

    if (
      error.response?.status === 401
    ) {

      await eliminarToken();

      setOportunidades([]);

      setCurrentScreen(
        'A01'
      );

      showAlert(
        'error',
        'Sesión finalizada',
        'Tu sesión venció. Iniciá sesión nuevamente.'
      );

      return;
    }


    showAlert(
      'error',
      'No se pudo eliminar',
      error.response?.data?.error ||
      'Ocurrió un error al eliminar la oportunidad.'
    );

  }
  finally {

    setLoading(false);

  }

};


  // ======================================================
  // BUSCAR UBICACIONES
  // ======================================================

  const buscarUbicaciones =
    async (
      texto
    ) => {

      try {

        const token =
          await obtenerToken();


        if (!token) {

          await eliminarToken();


          setCurrentScreen(
            'A01'
          );


          showAlert(

            'error',

            'Sesión finalizada',

            'Tu sesión no es válida. Iniciá sesión nuevamente.'

          );


          return [];

        }


        const data =
          await buscarUbicacionesPorTexto(
            token,
            texto
          );


        const resultados =
          data?.resultados;


        if (
          !Array.isArray(
            resultados
          )
        ) {

          showAlert(

            'error',

            'Error',

            'La respuesta de búsqueda de ubicaciones no es válida.'

          );


          return [];

        }


        return resultados;

      }
      catch (error) {

        if (
          error.response
            ?.status === 401
        ) {

          await eliminarToken();


          setCurrentScreen(
            'A01'
          );


          showAlert(

            'error',

            'Sesión finalizada',

            'Tu sesión venció. Iniciá sesión nuevamente.'

          );


          return [];

        }


        showAlert(

          'error',

          'Error',

          error.response
            ?.data
            ?.error ||

          'No se pudieron buscar ubicaciones.'

        );


        return [];

      }

    };


    // ======================================================
// INSCRIPCIÓN DE VOLUNTARIO
// ======================================================

const handleInscribirse =
  async (
    idOportunidad
  ) => {

    try {

      setLoading(
        true
      );


      const token =
        await obtenerToken();


      if (!token) {

        await eliminarToken();


        setCurrentScreen(
          'A01'
        );


        showAlert(

          'error',

          'Sesión finalizada',

          'Tu sesión no es válida. Iniciá sesión nuevamente.'

        );


        return false;

      }


      const data =
          await inscribirseOportunidad(
            token,
            idOportunidad
          );


        if (
          currentScreen ===
          'OPORTUNIDAD_DETALLE'
        ) {

          setEstadoInscripcionDetalle(
            data?.inscripcion?.estado ||
            'PENDIENTE'
          );

        }


        await cargarMisInscripciones();


      showAlert(

        'success',

        'Inscripción realizada',

        'Te inscribiste correctamente a la oportunidad. Podés cancelar tu inscripción hasta 3 días antes del inicio de la actividad.'

      );


      return true;

    }
    catch (error) {

      if (
        error.response
          ?.status === 401
      ) {

        await eliminarToken();


        setCurrentScreen(
          'A01'
        );


        showAlert(

          'error',

          'Sesión finalizada',

          'Tu sesión venció. Iniciá sesión nuevamente.'

        );


        return false;

      }


      showAlert(

        'error',

        'No se pudo realizar la inscripción',

        error.response
          ?.data
          ?.mensaje ||

        'Ocurrió un error al intentar inscribirte.'

      );


      return false;

    }
    finally {

      setLoading(
        false
      );

    }

  };


  // ======================================================
// MIS INSCRIPCIONES
// ======================================================

const cargarMisInscripciones =
  async () => {

    setLoading(
      true
    );


    try {

      const token =
        await obtenerToken();


      if (!token) {

        await eliminarToken();

        setInscripcionesVoluntario(
          []
        );

        setCurrentScreen(
          'A01'
        );


        showAlert(

          'error',

          'Sesión finalizada',

          'Tu sesión no es válida. Iniciá sesión nuevamente.'

        );


        return false;

      }


      const data =
        await obtenerMisInscripciones(
          token
        );

       


      setInscripcionesVoluntario(
        Array.isArray(data)
          ? data
          : []
      );


      return true;

    }
    catch (error) {

      if (
        error.response
          ?.status === 401
      ) {

        await eliminarToken();

        setInscripcionesVoluntario(
          []
        );

        setCurrentScreen(
          'A01'
        );


        showAlert(

          'error',

          'Sesión finalizada',

          'Tu sesión venció. Iniciá sesión nuevamente.'

        );


        return false;

      }


      showAlert(

        'error',

        'Error',

        error.response
          ?.data
          ?.mensaje ||

        'No se pudieron cargar tus inscripciones.'

      );


      return false;

    }
    finally {

      setLoading(
        false
      );

    }

  };

  // ======================================================
// OCULTAR INSCRIPCIÓN - VOLUNTARIO
// ======================================================

const handleOcultarInscripcion =
  async (idInscripcion) => {

    setLoading(true);

    try {

      const token =
        await obtenerToken();

      if (!token) {

        await eliminarToken();

        setInscripcionesVoluntario([]);

        setCurrentScreen(
          'A01'
        );

        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión no es válida. Iniciá sesión nuevamente.'
        );

        return;
      }

      await ocultarInscripcion(
        token,
        idInscripcion
      );

      await cargarMisInscripciones();

      showAlert(
        'success',
        'Inscripción quitada',
        'La inscripción dejó de aparecer en tu listado.'
      );

    }
    catch (error) {

      if (
        error.response?.status === 401
      ) {

        await eliminarToken();

        setInscripcionesVoluntario([]);

        setCurrentScreen(
          'A01'
        );

        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );

        return;
      }

      showAlert(
        'error',
        'No se pudo quitar',
        error.response?.data?.error ||
        'Ocurrió un error al quitar la inscripción.'
      );

    }
    finally {

      setLoading(false);

    }

  };

  // ======================================================
// CANCELAR INSCRIPCIÓN - VOLUNTARIO
// ======================================================

const handleCancelarInscripcion =
  async (idInscripcion) => {

    setLoading(true);

    try {

      const token =
        await obtenerToken();

      if (!token) {

        await eliminarToken();

        setInscripcionesVoluntario([]);

        setCurrentScreen(
          'A01'
        );

        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión no es válida. Iniciá sesión nuevamente.'
        );

        return;
      }

      await cancelarInscripcion(
        token,
        idInscripcion
      );

      await cargarMisInscripciones();

      showAlert(
        'success',
        'Inscripción cancelada',
        'Tu inscripción fue cancelada correctamente.'
      );

    }
    catch (error) {

      if (
        error.response?.status === 401
      ) {

        await eliminarToken();

        setInscripcionesVoluntario([]);

        setCurrentScreen(
          'A01'
        );

        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );

        return;
      }

      showAlert(
        'error',
        'No se pudo cancelar',
        error.response?.data?.error ||
        'Ocurrió un error al cancelar la inscripción.'
      );

    }
    finally {

      setLoading(false);

    }

  };


  // ======================================================
// CARGAR DATOS DEL PERFIL DEL VOLUNTARIO
// ACTIVIDAD 3.2.1
// ======================================================

const cargarDatosVoluntario = async () => {

  setLoadingDatosVoluntario(true);

  try {

    // ==================================================
    // 1. OBTENER TOKEN
    // ==================================================

    const token =
      await obtenerToken();

    if (!token) {

      await eliminarToken();

      setDatosVoluntario(null);

      setCurrentScreen('A01');

      showAlert(
        'error',
        'Sesión finalizada',
        'Tu sesión no es válida. Iniciá sesión nuevamente.'
      );

      return false;

    }


    // ==================================================
    // 2. CONSULTAR PERFIL
    // ==================================================

    const data =
      await obtenerMiVoluntario(token);


    // ==================================================
    // 3. ALMACENAR DATOS
    // ==================================================

    setDatosVoluntario(
      data.voluntario
    );

    return true;

  }
  catch (error) {

    // ==================================================
    // 4. MANEJAR SESIÓN VENCIDA
    // ==================================================

    if (
      error.response?.status === 401
    ) {

      await eliminarToken();

      setDatosVoluntario(null);

      setCurrentScreen('A01');

      showAlert(
        'error',
        'Sesión finalizada',
        'Tu sesión venció. Iniciá sesión nuevamente.'
      );

      return false;

    }


    // ==================================================
    // 5. MANEJAR OTROS ERRORES
    // ==================================================

    setDatosVoluntario(null);

    showAlert(
      'error',
      'No se pudo cargar el perfil',
      error.response?.data?.mensaje ||
      error.response?.data?.error ||
      'Ocurrió un error al consultar los datos del voluntario.'
    );

    return false;

  }
  finally {

    setLoadingDatosVoluntario(false);

  }

};

// ======================================================
// CARGAR REPUTACIÓN DEL VOLUNTARIO
// ACTIVIDAD 3.2.1
// ======================================================

const cargarReputacionVoluntario = async () => {

  setLoadingReputacionVoluntario(true);

  setReputacionVoluntario(null);

  try {

    // ==================================================
    // 1. OBTENER TOKEN
    // ==================================================

    const token =
      await obtenerToken();

    if (!token) {

      await eliminarToken();

      setDatosVoluntario(null);

      setReputacionVoluntario(null);

      setCurrentScreen('A01');

      showAlert(
        'error',
        'Sesión finalizada',
        'Tu sesión no es válida. Iniciá sesión nuevamente.'
      );

      return false;

    }


    // ==================================================
    // 2. CONSULTAR REPUTACIÓN
    // ==================================================

    const data =
      await obtenerMiReputacionVoluntario(
        token
      );


    // ==================================================
    // 3. ALMACENAR RESULTADOS
    // ==================================================

    setReputacionVoluntario(data);

    return true;

  }
  catch (error) {

    // ==================================================
    // 4. MANEJAR SESIÓN VENCIDA
    // ==================================================

    if (
      error.response?.status === 401
    ) {

      await eliminarToken();

      setDatosVoluntario(null);

      setReputacionVoluntario(null);

      setCurrentScreen('A01');

      showAlert(
        'error',
        'Sesión finalizada',
        'Tu sesión venció. Iniciá sesión nuevamente.'
      );

      return false;

    }


    // ==================================================
    // 5. MANEJAR ERRORES DE CONSULTA
    // ==================================================

    setReputacionVoluntario(null);

    setCurrentScreen('VOLUNTARIO_PERFIL');

    showAlert(
      'error',
      'No se pudo cargar la reputación',
      error.response?.data?.mensaje ||
      error.response?.data?.error ||
      'Ocurrió un error al consultar tus valoraciones.'
    );

    return false;

  }
  finally {

    setLoadingReputacionVoluntario(false);

  }

};
   // ======================================================
// CARGAR DATOS DE LA ORGANIZACIÓN - ORGANIZACIÓN
// ======================================================

  const cargarDatosOrganizacion =
  async () => {

    setLoadingDatosOrganizacion(
      true
    );


    try {

      const token =
        await obtenerToken();


      if (!token) {

        return false;

      }


      const data =
        await obtenerMiOrganizacion(
          token
        );


      setDatosOrganizacion(
        data.organizacion
      );


      return true;

    }
    catch (error) {

      showAlert(

        'error',

        'Error',

        error.response
          ?.data
          ?.error ||

        'No se pudo cargar la información de la organización.'

      );


      return false;

    }
    finally {

      setLoadingDatosOrganizacion(
        false
      );

    }

  };

// ======================================================
// CARGAR PERFIL PÚBLICO DE LA ORGANIZACIÓN
// ACTIVIDAD 3.6.1
// ======================================================

const cargarPerfilPublicoOrganizacion =
  async () => {

    setLoadingPerfilPublicoOrganizacion(
      true
    );

    try {

      const token =
        await obtenerToken();

      if (!token) {

        await eliminarToken();

        setPerfilPublicoOrganizacion(
          null
        );

        setCurrentScreen(
          'A01'
        );

        return false;
      }


      const data =
        await obtenerMiPerfilPublico(
          token
        );


      setPerfilPublicoOrganizacion(
        data.perfil || null
      );


      return true;

    }
    catch (error) {

      if (
        error.response?.status === 401
      ) {

        await eliminarToken();

        setDatosOrganizacion(
          null
        );

        setPerfilPublicoOrganizacion(
          null
        );

        setCurrentScreen(
          'A01'
        );

        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );

        return false;
      }


      setPerfilPublicoOrganizacion(
        null
      );


      showAlert(
        'error',
        'No se pudo cargar el perfil público',
        error.response?.data?.error ||
        'Ocurrió un error al consultar el perfil público.'
      );


      return false;

    }
    finally {

      setLoadingPerfilPublicoOrganizacion(
        false
      );

    }

  };

// ======================================================
// CARGAR REPUTACIÓN DE LA ORGANIZACIÓN
// ACTIVIDAD 3.2.2
// ======================================================

const cargarReputacionOrganizacion = async () => {

  setLoadingReputacionOrganizacion(true);

  setReputacionOrganizacion(null);

  try {

    // ==================================================
    // 1. OBTENER TOKEN DE AUTENTICACIÓN
    // ==================================================

    const token =
      await obtenerToken();


    if (!token) {

      await eliminarToken();

      setDatosOrganizacion(null);

      setReputacionOrganizacion(null);

      setCurrentScreen('A01');

      showAlert(
        'error',
        'Sesión finalizada',
        'Tu sesión no es válida. Iniciá sesión nuevamente.'
      );

      return false;

    }


    // ==================================================
    // 2. CONSULTAR REPUTACIÓN EN EL BACKEND
    // ==================================================

    const data =
      await obtenerMiReputacionOrganizacion(
        token
      );


    // ==================================================
    // 3. ALMACENAR RESULTADOS
    // ==================================================

    setReputacionOrganizacion(data);

    return true;

  }
  catch (error) {

    // ==================================================
    // 4. MANEJAR SESIÓN VENCIDA
    // ==================================================

    if (
      error.response?.status === 401
    ) {

      await eliminarToken();

      setDatosOrganizacion(null);

      setReputacionOrganizacion(null);

      setCurrentScreen('A01');

      showAlert(
        'error',
        'Sesión finalizada',
        'Tu sesión venció. Iniciá sesión nuevamente.'
      );

      return false;

    }


    // ==================================================
    // 5. MANEJAR OTROS ERRORES
    // ==================================================

    setReputacionOrganizacion(null);

    setCurrentScreen('ORGANIZACION_PERFIL');

    showAlert(
      'error',
      'No se pudo cargar la reputación',
      error.response?.data?.mensaje ||
      error.response?.data?.error ||
      'Ocurrió un error al consultar las valoraciones.'
    );

    return false;

  }
  finally {

    setLoadingReputacionOrganizacion(false);

  }

};

  const cargarOrganizacionesDonacion =
  async (filtros = {}) => {

    try {

      setLoadingDonacion(
        true
      );


      const token =
        await obtenerToken();


      if (!token) {

        return;

      }


      const data =
        await obtenerOrganizacionesDonacion(
          token,
          filtros
        );


      setOrganizacionesDonacion(
        data.organizaciones || []
      );


      setFiltrosDonacion(
        filtros
      );

    }
    catch (error) {

      console.error(
        'ERROR AL CARGAR ORGANIZACIONES PARA DONACIÓN:',
        error
      );


      if (
        error.response
          ?.status === 401
      ) {

        await eliminarToken();

        setCurrentScreen(
          'A01'
        );

        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );

        return;

      }


      showAlert(
        'error',
        'No se pudieron cargar las organizaciones',
        error.response
          ?.data
          ?.error ||
          'Ocurrió un error al consultar las organizaciones.'
      );

    }
    finally {

      setLoadingDonacion(
        false
      );

    }

  };

  // ======================================================
// CARGAR DONACIONES RECIBIDAS - ORGANIZACIÓN
// ======================================================

const cargarDonacionesRecibidas =
  async (
    estado =
      estadoFiltroDonacionesRecibidas
  ) => {

    try {

      setLoadingDonacionesRecibidas(
        true
      );


      const token =
        await obtenerToken();


      if (!token) {

        return;

      }


      const data =
        await obtenerDonacionesRecibidas(
          token,
          estado
        );


      setDonacionesRecibidas(
        data.donaciones || []
      );


      setEstadoFiltroDonacionesRecibidas(
        estado
      );

    }
    catch (error) {

      console.error(
        'ERROR AL CARGAR DONACIONES RECIBIDAS:',
        error
      );


      if (
        error.response
          ?.status === 401
      ) {

        await eliminarToken();

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );

        return;

      }


      showAlert(
        'error',
        'No se pudieron cargar las donaciones',
        error.response
          ?.data
          ?.error ||
          'Ocurrió un error al consultar las donaciones recibidas.'
      );

    }
    finally {

      setLoadingDonacionesRecibidas(
        false
      );

    }

  };
  // ======================================================
// CARGAR DETALLE DE DONACIÓN RECIBIDA
// ======================================================

const cargarDetalleDonacionRecibida =
  async (
    idDonacion
  ) => {

    try {

      setLoadingDetalleDonacionRecibida(
        true
      );


      const token =
        await obtenerToken();


      if (!token) {

        return;

      }


      const data =
        await obtenerDetalleDonacionRecibida(
          token,
          idDonacion
        );


      setDonacionRecibidaSeleccionada(
        data.donacion
      );


      setCurrentScreen(
        'ORGANIZACION_DONACION_DETALLE'
      );
      return true

    }
    catch (error) {

      console.error(
        'ERROR AL CARGAR DETALLE DE DONACIÓN RECIBIDA:',
        error
      );


      if (
        error.response
          ?.status === 401
      ) {

        await eliminarToken();

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );

        return false;

      }


      showAlert(
        'error',
        'No se pudo cargar la donación',
        error.response
          ?.data
          ?.error ||
          'Ocurrió un error al consultar el detalle de la donación.'
      );

    }
    finally {

      setLoadingDetalleDonacionRecibida(
        false
      );

    }

  };

  // ======================================================
// ACEPTAR DONACIÓN RECIBIDA
// ======================================================

const handleAceptarDonacionRecibida =
  async (
    donacion
  ) => {

    try {

      setLoadingAccionDonacion(
        true
      );


      const token =
        await obtenerToken();


      if (!token) {

        await eliminarToken();

        setCurrentScreen(
          'A01'
        );

        return;

      }


      const data =
        await aceptarDonacionRecibida(
          token,
          donacion.id_donacion
        );


      setDonacionRecibidaSeleccionada(
  (actual) => ({
    ...actual,
    ...data.donacion
  })
);


      await cargarDonacionesRecibidas(
        estadoFiltroDonacionesRecibidas
      );


      showAlert(
        'success',
        'Donación aceptada',
        'La donación fue aceptada correctamente. El siguiente paso es coordinar la entrega con el voluntario desde esta misma pantalla.'
      );

    }
    catch (error) {

      console.error(
        'ERROR AL ACEPTAR DONACIÓN RECIBIDA:',
        error
      );


      if (
        error.response
          ?.status === 401
      ) {

        await eliminarToken();

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );

        return;

      }


      showAlert(
        'error',
        'No se pudo aceptar la donación',
        error.response
          ?.data
          ?.error ||
          'Ocurrió un error al aceptar la donación.'
      );

    }
    finally {

      setLoadingAccionDonacion(
        false
      );

    }

  };

  // ======================================================
// RECHAZAR DONACIÓN RECIBIDA
// ======================================================

const handleRechazarDonacionRecibida =
  async (
    donacion,
    observacion
  ) => {

    try {

      setLoadingAccionDonacion(
        true
      );


      const token =
        await obtenerToken();


      if (!token) {

        await eliminarToken();

        setCurrentScreen(
          'A01'
        );

        return;

      }


      const data =
        await rechazarDonacionRecibida(
          token,
          donacion.id_donacion,
          observacion
        );


     setDonacionRecibidaSeleccionada(
        (actual) => ({
          ...actual,
          ...data.donacion
        })
      );


      await cargarDonacionesRecibidas(
        estadoFiltroDonacionesRecibidas
      );


      showAlert(
        'success',
        'Donación rechazada',
        'La donación fue rechazada correctamente.'
      );

    }
    catch (error) {

      console.error(
        'ERROR AL RECHAZAR DONACIÓN RECIBIDA:',
        error
      );


      if (
        error.response
          ?.status === 401
      ) {

        await eliminarToken();

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );

        return;

      }


      showAlert(
        'error',
        'No se pudo rechazar la donación',
        error.response
          ?.data
          ?.error ||
          'Ocurrió un error al rechazar la donación.'
      );

    }
    finally {

      setLoadingAccionDonacion(
        false
      );

    }

  };

 // ======================================================
// COORDINAR DONACIÓN RECIBIDA
// ======================================================

const handleCoordinarDonacionRecibida =
  async (
    donacion,
    detalleCoordinacion,
    telefonoContacto
  ) => {

    try {

      setLoadingAccionDonacion(
        true
      );


      const token =
        await obtenerToken();


      if (!token) {

        await eliminarToken();

        setCurrentScreen(
          'A01'
        );

        return;

      }


      const data =
        await coordinarDonacionRecibida(
          token,
          donacion.id_donacion,
          detalleCoordinacion,
          telefonoContacto
        );


      setDonacionRecibidaSeleccionada(
        (actual) => ({
          ...actual,
          ...data.donacion
        })
      );


      await cargarDonacionesRecibidas(
        estadoFiltroDonacionesRecibidas
      );


      showAlert(
        'success',
        'Entrega coordinada',
        'La coordinación de la donación fue registrada correctamente.'
      );

    }
    catch (error) {

      const status =
        error.response?.status;


      if (
        !status ||
        status >= 500
      ) {

        console.error(
          'ERROR AL COORDINAR DONACIÓN RECIBIDA:',
          error
        );

      }


      if (
        error.response
          ?.status === 401
      ) {

        await eliminarToken();

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );

        return;

      }


      showAlert(
        'error',
        'No se pudo coordinar la donación',
        error.response
          ?.data
          ?.error ||
          'Ocurrió un error al coordinar la entrega.'
      );

    }
    finally {

      setLoadingAccionDonacion(
        false
      );

    }

  };

  // ======================================================
// MARCAR DONACIÓN COMO RECIBIDA
// ======================================================

const handleMarcarDonacionRecibida =
  async (
    donacion
  ) => {

    try {

      setLoadingAccionDonacion(
        true
      );


      const token =
        await obtenerToken();


      if (!token) {

        await eliminarToken();

        setCurrentScreen(
          'A01'
        );

        return;

      }


      const data =
        await marcarDonacionComoRecibida(
          token,
          donacion.id_donacion
        );


      setDonacionRecibidaSeleccionada(
          (actual) => ({
            ...actual,
            ...data.donacion
          })
        );


      await cargarDonacionesRecibidas(
        estadoFiltroDonacionesRecibidas
      );


      showAlert(
        'success',
        'Donación recibida',
        'La recepción de la donación fue registrada correctamente.'
      );

    }
    catch (error) {

      console.error(
        'ERROR AL MARCAR DONACIÓN COMO RECIBIDA:',
        error
      );


      if (
        error.response
          ?.status === 401
      ) {

        await eliminarToken();

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );

        return;

      }


      showAlert(
        'error',
        'No se pudo registrar la recepción',
        error.response
          ?.data
          ?.error ||
          'Ocurrió un error al marcar la donación como recibida.'
      );

    }
    finally {

      setLoadingAccionDonacion(
        false
      );

    }

  };

  const cargarDetalleOrganizacionDonacion =
  async (
    idOrganizacion
  ) => {

    try {

      setLoadingDetalleDonacion(
        true
      );


      const token =
        await obtenerToken();


      if (!token) {

        await eliminarToken();

        setCurrentScreen(
          'A01'
        );

        return;

      }


      const data =
        await obtenerDetalleOrganizacionDonacion(
          token,
          idOrganizacion
        );


      setOrganizacionDonacionSeleccionada(
        data.organizacion
      );

      setCurrentScreen(
      'DETALLE_ORGANIZACION_DONACION'
       ) ;


      

    }
    catch (error) {

      console.error(
        'ERROR AL CONSULTAR DETALLE DE ORGANIZACIÓN:',
        error
      );


      if (
        error.response
          ?.status === 401
      ) {

        await eliminarToken();

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );

        return;

      }


      showAlert(
        'error',
        'Organización no disponible',
        error.response
          ?.data
          ?.error ||
          'No se pudo consultar la organización.'
      );

    }
    finally {

      setLoadingDetalleDonacion(
        false
      );

    }

  };

const cargarCategoriasDonacion =
  async () => {

    try {

      setLoadingCategoriasDonacion(
        true
      );


      const token = await obtenerToken();


      const data =
        await obtenerCategoriasDonacion(
          token
        );


      setCategoriasDonacion(
        data.categorias || []
      );

    }
    catch (error) {

      console.error(
        'ERROR CATEGORÍAS DONACIÓN:',
        error
      );


      showAlert(
        'error',
        'Error',
        'No se pudieron cargar las categorías de donación.'
      );

    }
    finally {

      setLoadingCategoriasDonacion(
        false
      );

    }

  };


  const handleRegistrarDonacion =
  async (
    datos,
    idempotencyKey,
    imagenSeleccionada
  ) => {

    try {

      setLoadingRegistroDonacion(
        true
      );


      const token =
        await obtenerToken();


      if (!token) {

        await eliminarToken();

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );


        return false;

      }


      if (
        !organizacionDonacionSeleccionada
          ?.id_organizacion
      ) {

        showAlert(
          'error',
          'Organización no disponible',
          'No se pudo determinar la organización destinataria.'
        );


        return false;

      }


      const respuesta =
  await registrarDonacion(
    token,
    {
      ...datos,

      id_organizacion:
        organizacionDonacionSeleccionada
          .id_organizacion
    },
    idempotencyKey
  );


const donacionRegistrada =
  respuesta?.donacion ||
  respuesta;


const idDonacion =
  donacionRegistrada
    ?.id_donacion;


if (
  imagenSeleccionada
) {

  if (
    !idDonacion
  ) {

    throw new Error(
      'No se pudo identificar la donación registrada.'
    );

  }


  try {

    await subirImagenDonacion(
      token,
      idDonacion,
      imagenSeleccionada
    );

  }
  catch (errorImagen) {

    console.error(
      'ERROR AL SUBIR IMAGEN DE DONACIÓN:',
      errorImagen
    );


    showAlert(
      'error',
      'Imagen no adjuntada',
      errorImagen.response
        ?.data
        ?.error ||
        'La donación fue registrada, pero no se pudo adjuntar la imagen. Podés reemplazarla, quitarla o intentar nuevamente.'
    );


    return false;

  }

}


      showAlert(
        'success',
        'Donación registrada',
        'Tu donación fue enviada correctamente a la organización y quedó pendiente de revisión.'
      );


      setCurrentScreen(
        'DETALLE_ORGANIZACION_DONACION'
      );


      return true;

    }
    catch (error) {

      console.error(
        'ERROR AL REGISTRAR DONACIÓN:',
        error.response?.data ||
        error.message
      );


      if (
        error.response?.status ===
        401
      ) {

        await eliminarToken();

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );


        return false;

      }


      showAlert(
        'error',
        'No se pudo registrar la donación',
        error.response?.data?.error ||
        'Ocurrió un error al registrar la donación.'
      );


      return false;

    }
    finally {

      setLoadingRegistroDonacion(
        false
      );

    }

  };

// ======================================================
// MIS DONACIONES - VOLUNTARIO
// ======================================================

const cargarMisDonaciones =
  async (
    estado = null
  ) => {

    try {

      setLoadingMisDonaciones(
        true
      );


      const token =
        await obtenerToken();


      if (!token) {

        await eliminarToken();

        setDonacionesVoluntario(
          []
        );

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión no es válida. Iniciá sesión nuevamente.'
        );


        return false;

      }


      const data =
        await obtenerMisDonaciones(
          token,
          estado
        );


      setDonacionesVoluntario(

        Array.isArray(
          data?.donaciones
        )

          ? data.donaciones

          : []

      );


      return true;

    }
    catch (error) {

      console.error(
        'ERROR AL CARGAR MIS DONACIONES:',
        error
      );


      if (
        error.response?.status ===
        401
      ) {

        await eliminarToken();

        setDonacionesVoluntario(
          []
        );

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );


        return false;

      }


      showAlert(
        'error',
        'Error',
        error.response
          ?.data
          ?.error ||
        'No se pudieron cargar tus donaciones.'
      );


      return false;

    }
    finally {

      setLoadingMisDonaciones(
        false
      );

    }

  };


// ======================================================
// DETALLE DE DONACIÓN PROPIA
// ======================================================

const cargarDetalleDonacionPropia =
  async (
    idDonacion
  ) => {

    try {

      setLoadingDetalleDonacionPropia(
        true
      );


      const token =
        await obtenerToken();


      if (!token) {

        await eliminarToken();

        setDonacionSeleccionada(
          null
        );

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión no es válida. Iniciá sesión nuevamente.'
        );


        return false;

      }


      const data =
        await obtenerDetalleDonacion(
          token,
          idDonacion
        );


      setDonacionSeleccionada(
        data?.donacion || null
      );


      setCurrentScreen(
        'DETALLE_DONACION'
      );


      return true;

    }
    catch (error) {

      console.error(
        'ERROR AL CARGAR DETALLE DE DONACIÓN:',
        error
      );


      if (
        error.response?.status ===
        401
      ) {

        await eliminarToken();

        setDonacionSeleccionada(
          null
        );

        setCurrentScreen(
          'A01'
        );


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );


        return false;

      }


      showAlert(
        'error',
        'Donación no disponible',
        error.response
          ?.data
          ?.error ||
        'No se pudo consultar la donación.'
      );


      return false;

    }
    finally {

      setLoadingDetalleDonacionPropia(
        false
      );

    }

  };

  // ======================================================
// OBTENER CANTIDAD DE NOTIFICACIONES NO LEÍDAS
// ======================================================

const cargarCantidadNoLeidas = async () => {

  try {

    const token = await obtenerToken();

    if (!token) {
      return;
    }


    const data =
      await obtenerCantidadNoLeidas(token);


    setCantidadNoLeidas(
      Number(data.cantidad) || 0
    );

  }
  catch (error) {

    console.warn(
      'No se pudo consultar el contador de notificaciones:',
      error.message
    );

  }

};

// ======================================================
// CARGAR HISTORIAL DE NOTIFICACIONES
// ======================================================

const cargarNotificacionesVoluntario = async () => {

  setLoadingNotificaciones(true);

  try {

    const token = await obtenerToken();

    if (!token) {
      return;
    }


    const data =
      await obtenerMisNotificaciones(token);


    setNotificacionesVoluntario(
      data.notificaciones || []
    );


    await cargarCantidadNoLeidas();

  }
  catch (error) {

    console.error(
      'Error al obtener notificaciones:',
      error.message
    );


    showAlert(
      'error',
      'Notificaciones',
      'No se pudieron cargar las notificaciones.'
    );

  }
  finally {

    setLoadingNotificaciones(false);

  }

};

// ======================================================
// MARCAR NOTIFICACIÓN COMO LEÍDA
// ======================================================

const handleMarcarNotificacionLeida = async (
  notificacion
) => {

  try {

    const token = await obtenerToken();

    if (!token) {
      return false;
    }


    await marcarNotificacionLeida(
      token,
      notificacion.id_notificacion
    );


    // Actualizar estado local

    setNotificacionesVoluntario(
      anteriores =>
        anteriores.map(item =>

          item.id_notificacion ===
          notificacion.id_notificacion

            ? {
                ...item,
                leida_en:
                  item.leida_en ||
                  new Date().toISOString()
              }

            : item

        )
    );


    await cargarCantidadNoLeidas();

    return true;

  }
  catch (error) {

    console.error(
      'Error al marcar notificación:',
      error.message
    );


    showAlert(
      'error',
      'Notificaciones',
      'No se pudo marcar la notificación como leída.'
    );

    return false;

  }

};

// ======================================================
// ACTUALIZAR CONTADOR DE NOTIFICACIONES
// VOLUNTARIOS Y ORGANIZACIONES
// ACTIVIDAD 3.3.2
// ======================================================

useEffect(() => {

  if (
    currentScreen === 'VOLUNTARIO_INICIO' ||
    currentScreen === 'ORGANIZACION_INICIO'
  ) {

    cargarCantidadNoLeidas();

  }

}, [currentScreen]);


// ======================================================
// ACTUALIZAR NOTIFICACIONES AL RECIBIR PUSH
// ACTIVIDAD 3.3.1
// ======================================================

useEffect(() => {

  const suscripcion =
    Notifications.addNotificationReceivedListener(
          async () => {

      // Actualizar contador de ambos roles.

      if (
        currentScreen === 'VOLUNTARIO_INICIO' ||
        currentScreen === 'ORGANIZACION_INICIO'
      ) {

        await cargarCantidadNoLeidas();

      }

      // Actualizar historial de ambos roles.

      if (
        currentScreen === 'VOLUNTARIO_NOTIFICACIONES' ||
        currentScreen === 'ORGANIZACION_NOTIFICACIONES'
      ) {

        await cargarNotificacionesVoluntario();

      }

    }
    );

  return () => {

    suscripcion.remove();

  };

}, [currentScreen]);

  // ======================================================
  // RENDER PRINCIPAL
  // ======================================================

  return (

    <SafeAreaProvider>

    <View
      style={
        styles.mainContainer
      }
    >

      <ImageBackground

        source={
  currentScreen === 'A01'
    ? require(
        './assets/fondo.png'
      )
    : null
}

        style={
          styles.backgroundImage
        }

        imageStyle={{
          opacity: 0.22
        }}

      >

        <ScrollView

          ref={
            scrollRef
          }

          nestedScrollEnabled={
            true
          }

          contentContainerStyle={[

              styles.scrollContainer,

              (
                currentScreen ===
                  'ORGANIZACION_HOME' ||

                currentScreen ===
                  'ADMIN_ORGANIZACIONES' ||
                  
                  currentScreen ===
                  'ADMIN_ORGANIZACION_DETALLE'
              ) &&
                styles.scrollContainerOrganizacion

            ]}

          onScroll={(
            event
          ) => {

            const y =
              event
                .nativeEvent
                .contentOffset
                .y;


            if (
              currentScreen ===
                'VOLUNTARIO_INICIO'
            ) {

              setScrollYInicioVoluntario(
                y
              );

            }
            else if (
              currentScreen ===
                'VOLUNTARIO_HOME'
            ) {

              setScrollYVoluntario(
                y
              );

            }
            else if (
              currentScreen ===
                'MIS_INSCRIPCIONES'
            ) {

              setScrollYInscripciones(
                y
              );

            }
            else if (
              currentScreen ===
                'ORGANIZACION_HOME'
            ) {

              setScrollYOrganizacion(
                y
              );

            }else if (
                currentScreen ===
                  'VOLUNTARIO_DONAR'
              ) {

                setScrollYDonacion(
                  y
                );

              }
              else if (
                currentScreen ===
                  'MIS_DONACIONES'
              ) {

                setScrollYMisDonaciones(
                  y
                );

              } else if (
                currentScreen ===
                  'ORGANIZACION_DONACIONES'
              ) {

                setScrollYDonacionesRecibidas(
                  y
                );

              } else if (
                  currentScreen ===
                  'ADMIN_ORGANIZACIONES'
                ) {

                  setScrollYOrganizacionesPendientes(
                    event.nativeEvent.contentOffset.y
                  );

                }

          }}

          scrollEventThrottle={
            16
          }

        >


          {/* ==================================================
              A01
          ================================================== */}

          {currentScreen ===
            'A01' && (

            <LoginScreen

              onLogin={
                handleLogin
              }

              onNavigateRegister={() =>
                setCurrentScreen(
                  'A04'
                )
              }

              onNavigateForgotPassword={() =>
                setCurrentScreen(
                  'A02'
                )
              }

              loading={
                loading
              }

            />

          )}


          {/* ==================================================
              A02
          ================================================== */}

          {currentScreen ===
            'A02' && (

            <ForgotPasswordScreen

              onSendResetLink={
                handleForgotPassword
              }

              onBack={() =>
                setCurrentScreen(
                  'A01'
                )
              }

              loading={
                loading
              }

              showAlert={
                showAlert
              }

            />

          )}


          {/* ==================================================
              A04
          ================================================== */}

          {currentScreen ===
            'A04' && (

            <RoleSelectionScreen

              onSelectRole={(
                screen
              ) =>
                setCurrentScreen(
                  screen
                )
              }

              onBack={() =>
                setCurrentScreen(
                  'A01'
                )
              }

            />

          )}


          {/* ==================================================
              A05
          ================================================== */}

          {currentScreen ===
            'A05' && (

            <RegisterVoluntario

              onRegister={
                handleRegisterVoluntario
              }

              onBack={() =>
                setCurrentScreen(
                  'A04'
                )
              }

              loading={
                loading
              }

              showAlert={
                showAlert
              }

            />

          )}


          {/* ==================================================
              A06
          ================================================== */}

          {currentScreen ===
            'A06' && (

            <RegisterOrganizacion

              onRegister={
                handleRegisterOrganizacion
              }

              onBack={() =>
                setCurrentScreen(
                  'A04'
                )
              }

              loading={
                loading
              }

              showAlert={
                showAlert
              }

            />

          )}

{/* ==================================================
    MI PERFIL - VOLUNTARIO
    ACTIVIDAD 3.2.1
================================================== */}

{currentScreen === 'VOLUNTARIO_PERFIL' && (

  <MiPerfilVoluntarioScreen

  voluntario={
    datosVoluntario
  }

  loading={
    loadingDatosVoluntario
  }

  onLogout={
    handleLogout
  }

  tiposActividad={
    tiposActividad
  }

  intereses={
    interesesVoluntario
  }

  loadingIntereses={
    loadingInteresesVoluntario
  }

  onGuardarIntereses={
    guardarInteresesVoluntario
  }

  onVerReputacion={async () => {

    // Abrir pantalla de reputación

    setCurrentScreen(
      'VOLUNTARIO_REPUTACION'
    );


    // Volver al inicio del contenido

    setTimeout(() => {

      scrollRef.current?.scrollTo({
        y: 0,
        animated: false
      });

    }, 0);


    // Consultar calificaciones recibidas

    await cargarReputacionVoluntario();

  }}

/>
)}

{/* ==================================================
    MI REPUTACIÓN - VOLUNTARIO
    ACTIVIDAD 3.2.1
================================================== */}

{currentScreen === 'VOLUNTARIO_REPUTACION' && (

  <MiReputacionScreen

    reputacion={
      reputacionVoluntario
    }

    loading={
      loadingReputacionVoluntario
    }

    onVolver={() => {

      setCurrentScreen(
        'VOLUNTARIO_PERFIL'
      );


      setTimeout(() => {

        scrollRef.current?.scrollTo({
          y: 0,
          animated: false
        });

      }, 0);

    }}

  />

)}


          {/* ==================================================
              VOLUNTARIO
          ================================================== */}

          {/* ================================================== */}
          {/* NOTIFICACIONES DEL VOLUNTARIO - ACTIVIDAD 3.3.1 */}
          {/* ================================================== */}

          {currentScreen ===
            'VOLUNTARIO_NOTIFICACIONES' && (

            <NotificacionesVoluntarioScreen

              notificaciones={
                notificacionesVoluntario
              }

              loading={
                loadingNotificaciones
              }

              onRecargar={
                cargarNotificacionesVoluntario
              }

              onMarcarLeida={
                handleMarcarNotificacionLeida
              }

              onVolver={async () => {

                setCurrentScreen(
                  'VOLUNTARIO_INICIO'
                );

                await cargarCantidadNoLeidas();

              }}

              onVerDonaciones={async (notificacion) => {

                
                // Cargar donaciones actualizadas.
                const cargadas = await cargarMisDonaciones(null);

                if (!cargadas) {
                  return;
                }

                // Restablecer filtro.
                setFiltroEstadoDonaciones(null);

                // Abrir pantalla.
                setCurrentScreen('MIS_DONACIONES');

                // Marcar como leída.
                if (!notificacion.leida_en) {
                  await handleMarcarNotificacionLeida(
                    notificacion
                  );
                }

              }}

              onVerInscripciones={async (notificacion) => {

              
                // Cargar inscripciones actualizadas.
                const cargadas = await cargarMisInscripciones();

                if (!cargadas) {
                  return;
                }

                // Abrir pantalla.
                setCurrentScreen('MIS_INSCRIPCIONES');

                // Marcar como leída.
                if (!notificacion.leida_en) {
                  await handleMarcarNotificacionLeida(
                    notificacion
                  );
                }

              }}

              onVerOportunidad={async (notificacion) => {

                // Actualizar estado de lectura

                if (!notificacion.leida_en) {

                  await handleMarcarNotificacionLeida(
                    notificacion
                  );

                }


                // Comprobar disponibilidad

                if (
                  !notificacion.oportunidad_disponible ||
                  !notificacion.id_oportunidad
                ) {

                  showAlert(
                    'error',
                    'Oportunidad no disponible',
                    'Esta oportunidad ya no se encuentra disponible.'
                  );

                  return;

                }


                // Recuperar inscripción existente

                const inscripcionExistente =
                  inscripcionesVoluntario.find(
                    inscripcion =>
                      String(inscripcion.id_oportunidad) ===
                      String(notificacion.id_oportunidad)
                  );


                setEstadoInscripcionDetalle(

                  inscripcionExistente
                    ? inscripcionExistente.estado
                    : null

                );


                // Registrar origen de navegación

                setOrigenDetalleVoluntario(
                  'NOTIFICACIONES'
                );


                // Abrir detalle actual de la oportunidad

                await cargarDetalleOportunidadVoluntario(
                  notificacion.id_oportunidad
                );

              }}

            />

          )}

          {/* ==================================================
                INICIO VOLUNTARIO
            ================================================== */}

            {currentScreen ===
              'VOLUNTARIO_INICIO' && (

              <InicioVoluntarioScreen

                oportunidades={
                  oportunidadesInicioVoluntario
                }

                loading={
                  loadingInicioVoluntario
                }

                recomendaciones={
                  recomendacionesVoluntario
                }

                loadingRecomendaciones={
                  loadingRecomendaciones
                }

                recomendacionesCargadas={
                  recomendacionesCargadas
                }

                ubicacionRecomendaciones={
                  ubicacionRecomendaciones
                }

                onUsarUbicacion={
                  usarUbicacionRecomendaciones
                }

                cantidadNoLeidas={
                cantidadNoLeidas
                }

                onNotificaciones={async () => {

                  setCurrentScreen(
                   'VOLUNTARIO_NOTIFICACIONES'
                  );

                  scrollRef.current?.scrollTo({
                  y: 0,
                  animated: false
                  });

                  await cargarNotificacionesVoluntario();

                }}

                onBuscar={async () => {

                  setCurrentScreen(
                    'VOLUNTARIO_HOME'
                  );


                  await cargarOportunidadesVoluntario(
                    filtrosVoluntario
                  );


                  setTimeout(
                    () => {

                      scrollRef.current
                        ?.scrollTo({

                          y:
                            scrollYVoluntario,

                          animated:
                            false

                        });

                    },
                    0.1
                  );

                }}


                onMisInscripciones={async () => {

                  setCurrentScreen(
                    'MIS_INSCRIPCIONES'
                  );


                  await cargarMisInscripciones();


                  setTimeout(
                    () => {

                      scrollRef.current
                        ?.scrollTo({

                          y:
                            scrollYInscripciones,

                          animated:
                            false

                        });

                    },
                    0.1
                  );

                }}


                onVerDetalle={async (
                  idOportunidad
                ) => {

                  const inscripcionExistente =
                    inscripcionesVoluntario.find(
                      (inscripcion) =>

                        String(
                          inscripcion.id_oportunidad
                        ) ===
                        String(
                          idOportunidad
                        )
                    );


                  setOrigenDetalleVoluntario(
                    'INICIO'
                  );


                  setEstadoInscripcionDetalle(

                    inscripcionExistente

                      ? inscripcionExistente.estado

                      : null

                  );


                  await cargarDetalleOportunidadVoluntario(
                    idOportunidad
                  );

                }}

              />

            )}

          {currentScreen ===
            'VOLUNTARIO_HOME' && (

            <BuscarOportunidadesScreen

              oportunidades={
                oportunidadesVoluntario
              }

              tiposActividad={
                tiposActividad
              }

              loading={
                loading
              }

              inscripciones={
                inscripcionesVoluntario
              }

              onInscribirse={
                handleInscribirse
              }

              onFiltrar={async (
                filtros
              ) => {

                setFiltrosVoluntario(
                  filtros
                );


                await cargarOportunidadesVoluntario(
                  filtros
                );

              }}

              onBuscarUbicacion={
                buscarUbicaciones
              }

              onLogout={
                handleLogout
              }

              onVerDetalle={async (
                  idOportunidad
                ) => {

                  const inscripcionExistente =
                    inscripcionesVoluntario.find(
                      (inscripcion) =>
                        inscripcion.id_oportunidad ===
                        idOportunidad
                    );


                  setOrigenDetalleVoluntario(
                    'BUSCAR'
                  );


                  setEstadoInscripcionDetalle(
                    inscripcionExistente
                      ? inscripcionExistente.estado
                      : null
                  );


                  await cargarDetalleOportunidadVoluntario(
                    idOportunidad
                  );

                }}

              filtrosGuardados={
                filtrosVoluntario
              }

              estadoUbicacionGuardado={
                estadoUbicacionVoluntario
              }

              onGuardarEstadoUbicacion={
                setEstadoUbicacionVoluntario
              }

              showAlert={
                showAlert
              }

            />

          )}

          {/* ======================================================
              MIS INSCRIPCIONES
          ====================================================== */}

          {currentScreen === 'MIS_INSCRIPCIONES' && (

            <MisInscripcionesScreen

              inscripciones={
                inscripcionesVoluntario
              }

              loading={
                loading
              }

              onOcultar={
                handleOcultarInscripcion
              }

              onCancelar={
                handleCancelarInscripcion
              }

              filtroEstado={
                filtroEstadoInscripciones
              }

              onCambiarFiltroEstado={
                setFiltroEstadoInscripciones
              }
              onCalificarOrganizacion={
                handleCalificarOrganizacion
              }

              loadingCalificacion={
                loadingCalificacionOrganizacion
              }

              onVerDetalle={async (
                idOportunidad,
                estadoInscripcion
              ) => {

                setOrigenDetalleVoluntario(
                  'MIS_INSCRIPCIONES'
                );

                setEstadoInscripcionDetalle(
                  estadoInscripcion
                );

                await cargarDetalleOportunidadVoluntario(
                  idOportunidad
                );

              }}

            />

          )}


          {/* ==================================================
              DETALLE VOLUNTARIO
          ================================================== */}

          {currentScreen ===
            'OPORTUNIDAD_DETALLE' && (

            <DetalleOportunidadScreen

              oportunidad={
                oportunidadSeleccionada
              }

              loading={
                loadingDetalle
              }

              estadoUbicacion={
                estadoUbicacionVoluntario
              }
              onInscribirse={
                handleInscribirse
              }

              estadoInscripcion={
                estadoInscripcionDetalle
              }

              

              onVolver={async () => {

                setOportunidadSeleccionada(
                  null
                );

                // ======================================================
                // VOLVER AL CENTRO DE NOTIFICACIONES
                // ======================================================

                if (
                  origenDetalleVoluntario ===
                  'NOTIFICACIONES'
                ) {

                  setCurrentScreen(
                    'VOLUNTARIO_NOTIFICACIONES'
                  );

                  await cargarNotificacionesVoluntario();

                  scrollRef.current?.scrollTo({
                    y: 0,
                    animated: false
                  });

                  return;

                }
                
                if (
                  origenDetalleVoluntario ===
                  'INICIO'
                ) {

                  setCurrentScreen(
                    'VOLUNTARIO_INICIO'
                  );


                  await cargarOportunidadesInicioVoluntario();
                  await cargarRecomendacionesVoluntario(
                    ubicacionRecomendaciones
                  );


                  setTimeout(
                    () => {

                      scrollRef.current
                        ?.scrollTo({

                          y:
                            scrollYInicioVoluntario,

                          animated:
                            true

                        });

                    },
                    0.1
                  );


                  return;

                }
                if (
                    origenDetalleVoluntario ===
                    'MIS_INSCRIPCIONES'
                  ) {

                    setCurrentScreen(
                      'MIS_INSCRIPCIONES'
                    );

                     setTimeout(
                          () => {

                            scrollRef.current
                              ?.scrollTo({

                                y:
                                  scrollYInscripciones,

                                animated:
                                  true

                              });

                          },
                          0.1
                        );

                    return;

                  }




                setCurrentScreen(
                  'VOLUNTARIO_HOME'
                );


                await cargarOportunidadesVoluntario(
                  filtrosVoluntario
                );


                setTimeout(
                  () => {

                    scrollRef.current
                      ?.scrollTo({

                        y:
                          scrollYVoluntario,

                        animated:
                          true

                      });

                  },
                  0.1
                );

              }}

            />

          )}


        {currentScreen ===
          'VOLUNTARIO_DONAR' && (

          <OrganizacionesDonacionScreen

            organizaciones={
              organizacionesDonacion
            }

            loading={
              loadingDonacion
            }

            tiposActividad={
              tiposActividad
            }

            filtrosGuardados={
              filtrosDonacion
            }

            onFiltrar={
              cargarOrganizacionesDonacion
            }

            onBuscarUbicacion={
              buscarUbicaciones
            }

            estadoUbicacionGuardado={
              estadoUbicacionDonacion
            }

            onGuardarEstadoUbicacion={
              setEstadoUbicacionDonacion
            }

            showAlert={
              showAlert
            }


            onMisDonaciones={
              async () => {

                setFiltroEstadoDonaciones(
                  null
                );

                setCurrentScreen(
                  'MIS_DONACIONES'
                );


                await cargarMisDonaciones(
                  null
                );


                setTimeout(
                  () => {

                    scrollRef.current
                      ?.scrollTo({
                        y:
                          scrollYMisDonaciones,

                        animated:
                          false
                      });

                  },
                  0.1
                );

              }
            }


            onSeleccionarOrganizacion={
              async (organizacion) => {

                await cargarDetalleOrganizacionDonacion(
                  organizacion.id_organizacion
                );

              }
            }

          />

        )}

          

         {currentScreen ===
              'DETALLE_ORGANIZACION_DONACION' && (

              <DetalleOrganizacionDonacionScreen

                organizacion={
                  organizacionDonacionSeleccionada
                }

                loading={
                  loadingDetalleDonacion
                }

                onVolver={() => {

                  setCurrentScreen(
                    'VOLUNTARIO_DONAR'
                  );

                  setTimeout(
                    () => {

                      scrollRef.current
                        ?.scrollTo({
                          y: scrollYDonacion,
                          animated: true
                        });

                    },
                    0.1
                  );

                }}

                onDonar={async () => {

                  await cargarCategoriasDonacion();

                  setCurrentScreen(
                    'REGISTRAR_DONACION'
                  );

                }}

              />

            )}


            {/* ==================================================
                REGISTRAR DONACIÓN - V06
            ================================================== */}

            {currentScreen ===
              'REGISTRAR_DONACION' && (

              <RegistrarDonacionScreen

                organizacion={
                  organizacionDonacionSeleccionada
                }

                categorias={
                  categoriasDonacion
                }

                loadingCategorias={
                  loadingCategoriasDonacion
                }
                loadingRegistro={
                  loadingRegistroDonacion
                }

                showAlert={
                  showAlert
                }

                onVolver={() => {

                  setCurrentScreen(
                    'DETALLE_ORGANIZACION_DONACION'
                  );

                }}

                 onRegistrar={
                  handleRegistrarDonacion
                }

              />

            )}

      {/* ==================================================
          MIS DONACIONES - V07
      ================================================== */}

      {currentScreen ===
        'MIS_DONACIONES' && (

        <MisDonacionesScreen

          donaciones={
            donacionesVoluntario
          }

          loading={
            loadingMisDonaciones
          }

          estadoFiltro={
            filtroEstadoDonaciones
          }

          onCambiarEstado={
            async (
              nuevoEstado
            ) => {

              setFiltroEstadoDonaciones(
                nuevoEstado
              );


              await cargarMisDonaciones(
                nuevoEstado
              );


              scrollRef.current
                ?.scrollTo({
                  y: 0,
                  animated: true
                });

            }
          }


          onVolver={() => {

            setCurrentScreen(
              'VOLUNTARIO_DONAR'
            );


            setTimeout(
              () => {

                scrollRef.current
                  ?.scrollTo({
                    y:
                      scrollYDonacion,

                    animated:
                      true
                  });

              },
              0.1
            );

          }}

          onVerDetalle={
            cargarDetalleDonacionPropia
          }

        />

      )}


    {/* ==================================================
        DETALLE DE DONACIÓN
    ================================================== */}

    {currentScreen ===
      'DETALLE_DONACION' && (

      <DetalleDonacionScreen

        donacion={
          donacionSeleccionada
        }

        loading={
          loadingDetalleDonacionPropia
        }

        onVolver={() => {

          setDonacionSeleccionada(
            null
          );


          setCurrentScreen(
            'MIS_DONACIONES'
          );


          setTimeout(
            () => {

              scrollRef.current
                ?.scrollTo({
                  y:
                    scrollYMisDonaciones,
                  animated:
                    true
                });

            },
            0.1
          );

        }}

      />

    )}  
    
    {/* ==================================================
    NOTIFICACIONES DE ORGANIZACIÓN
    ACTIVIDAD 3.3.2
================================================== */}

{currentScreen ===
  'ORGANIZACION_NOTIFICACIONES' && (

  <NotificacionesVoluntarioScreen

    modoOrganizacion={true}

    notificaciones={
      notificacionesVoluntario
    }

    loading={
      loadingNotificaciones
    }

    onRecargar={
      cargarNotificacionesVoluntario
    }

    onMarcarLeida={
      handleMarcarNotificacionLeida
    }

    onVolver={async () => {

      setCurrentScreen(
        'ORGANIZACION_INICIO'
      );

      await cargarCantidadNoLeidas();

      scrollRef.current?.scrollTo({
        y: 0,
        animated: false
      });

    }}

    onVerDonacion={async (notificacion) => {

       

        if (!notificacion.id_donacion) {
          showAlert(
            'error',
            'Donación no disponible',
            'No se pudo identificar la donación.'
          );
          return;
        }

        // Preparar listado para el regreso.
        await cargarDonacionesRecibidas('TODAS');

        // Abrir detalle.
       const detalleAbierto =
          await cargarDetalleDonacionRecibida(
            notificacion.id_donacion
          );

        if (!detalleAbierto) {
          return;
        }

        // Marcar notificación como leída.
        if (!notificacion.leida_en) {
          await handleMarcarNotificacionLeida(
            notificacion
          );
        }

      }}

      onGestionarInscripciones={async (notificacion) => {

        

        if (!notificacion.id_oportunidad) {
          showAlert(
            'error',
            'Oportunidad no disponible',
            'No se pudo identificar la oportunidad.'
          );
          return;
        }

        try {

          const token = await obtenerToken();

          if (!token) {
            showAlert(
              'error',
              'Sesión finalizada',
              'Iniciá sesión nuevamente.'
            );
            return;
          }

          // Obtener las oportunidades de la organización.
          const data = await obtenerMisOportunidades(token);

          const listaOportunidades =
            data.oportunidades || [];

          const oportunidad = listaOportunidades.find(
            item =>
              String(item.id_oportunidad) ===
              String(notificacion.id_oportunidad)
          );

          if (!oportunidad) {
            showAlert(
              'error',
              'Oportunidad no disponible',
              'No se encontró la oportunidad asociada.'
            );
            return;
          }

          setOportunidades(listaOportunidades);

          // Abrir gestión de inscripciones.
          const gestionAbierta =
            await abrirGestionInscripciones(
              oportunidad
            );

          if (!gestionAbierta) {
            return;
          }

          // Marcar como leída.
          if (!notificacion.leida_en) {
            await handleMarcarNotificacionLeida(
              notificacion
            );
          }

        } catch (error) {

          console.error(
            'Error al abrir inscripciones:',
            error
          );

          showAlert(
            'error',
            'Error',
            'No se pudo acceder a las inscripciones.'
          );

        }

      }}

  />

)}

          {/* ==================================================
              INICIO ORGANIZACIÓN
          ================================================== */}

          {currentScreen ===
            'ORGANIZACION_INICIO' && (

            <InicioOrganizacionScreen

              oportunidades={
                oportunidades
              }

              loading={
                loading
              }

              cantidadNoLeidas={
                cantidadNoLeidas
              }

              onNotificaciones={async () => {

                setCurrentScreen(
                  'ORGANIZACION_NOTIFICACIONES'
                );

                scrollRef.current?.scrollTo({
                  y: 0,
                  animated: false
                });

                await cargarNotificacionesVoluntario();

              }}

              onLogout={
                handleLogout
              }


              onMisOportunidades={async () => {

                setCurrentScreen(
                  'ORGANIZACION_HOME'
                );


                await cargarOportunidades();

              }}


              onNuevaOportunidad={async () => {

                setOportunidadEditando(
                  null
                );


                const tiposCargados =
                  await cargarTiposActividad();


                if (
                  !tiposCargados
                ) {

                  return;

                }


                setCurrentScreen(
                  'OPORTUNIDAD_FORM'
                );

              }}


              onMiOrganizacion={async () => {

                setCurrentScreen(
                  'ORGANIZACION_PERFIL'
                );


                await Promise.all([
                  cargarDatosOrganizacion(),
                  cargarPerfilPublicoOrganizacion()
                ]);


                setTimeout(() => {

                  scrollRef.current?.scrollTo({
                    y: 0,
                    animated: false
                  });

                }, 0);

              }}

            />

          )}


          {/* ==================================================
              ORGANIZACIÓN
          ================================================== */}

          {currentScreen ===
            'ORGANIZACION_HOME' && (

            <MisOportunidadesScreen

              oportunidades={
                oportunidades
              }

              loading={
                loading
              }

              filtroEstado={
                filtroEstadoOrganizacion
              }

              onCambiarFiltroEstado={
                setFiltroEstadoOrganizacion
              }

              busqueda={
                busquedaOrganizacion
              }

              onCambiarBusqueda={
                setBusquedaOrganizacion
              }

              onGestionarInscripciones={
                abrirGestionInscripciones
              }


              onNuevaOportunidad={
                async () => {

                  setOportunidadEditando(
                    null
                  );


                  const tiposCargados =
                    await cargarTiposActividad();


                  if (
                    !tiposCargados
                  ) {

                    return;

                  }


                  setCurrentScreen(
                    'OPORTUNIDAD_FORM'
                  );

                }
              }

              onEliminar={
                  handleEliminarOportunidad
                }


              onEditar={
                async (
                  idOportunidad
                ) => {

                  try {

                    setLoading(
                      true
                    );


                    const token =
                      await obtenerToken();


                    if (!token) {

                      await eliminarToken();


                      setOportunidades(
                        []
                      );


                      setTiposActividad(
                        []
                      );


                      setOportunidadEditando(
                        null
                      );


                      setCurrentScreen(
                        'A01'
                      );


                      showAlert(

                        'error',

                        'Sesión finalizada',

                        'Tu sesión no es válida. Iniciá sesión nuevamente.'

                      );


                      return;

                    }


                    const data =
                      await obtenerOportunidadPorId(
                        token,
                        idOportunidad
                      );


                    const tiposCargados =
                      await cargarTiposActividad();


                    if (
                      !tiposCargados
                    ) {

                      return;

                    }


                    setOportunidadEditando(
                      data.oportunidad
                    );


                    setCurrentScreen(
                      'OPORTUNIDAD_FORM'
                    );


                    setTimeout(
                      () => {

                        scrollRef.current
                          ?.scrollTo({

                            y: 0,

                            animated:
                              true

                          });

                      },
                      0.1
                    );

                  }
                  catch (error) {

                    if (
                      error.response
                        ?.status === 401
                    ) {

                      await eliminarToken();


                      setOportunidades(
                        []
                      );


                      setTiposActividad(
                        []
                      );


                      setOportunidadEditando(
                        null
                      );


                      setCurrentScreen(
                        'A01'
                      );


                      showAlert(

                        'error',

                        'Sesión finalizada',

                        'Tu sesión venció. Iniciá sesión nuevamente.'

                      );


                      return;

                    }


                    showAlert(

                      'error',

                      'Error',

                      'No se pudo cargar la oportunidad.'

                    );

                  }
                  finally {

                    setLoading(
                      false
                    );

                  }

                }
              }


              onPublicar={
                async (
                  idOportunidad
                ) => {

                  try {

                    setLoading(
                      true
                    );


                    const token =
                      await obtenerToken();


                    if (!token) {

                      await eliminarToken();


                      setOportunidades(
                        []
                      );


                      setTiposActividad(
                        []
                      );


                      setOportunidadEditando(
                        null
                      );


                      setCurrentScreen(
                        'A01'
                      );


                      showAlert(

                        'error',

                        'Sesión finalizada',

                        'Tu sesión no es válida. Iniciá sesión nuevamente.'

                      );


                      return;

                    }


                    await publicarOportunidad(
                      token,
                      idOportunidad
                    );


                    showAlert(

                      'success',

                      'Oportunidad publicada',

                      'La oportunidad se publicó correctamente.'

                    );


                    await cargarOportunidades();

                  }
                  catch (error) {

                    if (
                      error.response
                        ?.status === 401
                    ) {

                      await eliminarToken();


                      setOportunidades(
                        []
                      );


                      setTiposActividad(
                        []
                      );


                      setOportunidadEditando(
                        null
                      );


                      setCurrentScreen(
                        'A01'
                      );


                      showAlert(

                        'error',

                        'Sesión finalizada',

                        'Tu sesión venció. Iniciá sesión nuevamente.'

                      );


                      return;

                    }


                    showAlert(

                      'error',

                      'No se pudo publicar',

                      error.response
                        ?.data
                        ?.error ||

                      'Ocurrió un error al publicar la oportunidad.'

                    );

                  }
                  finally {

                    setLoading(
                      false
                    );

                  }

                }
              }


              onCancelar={
                async (
                  idOportunidad
                ) => {

                  try {

                    setLoading(
                      true
                    );


                    const token =
                      await obtenerToken();


                    if (!token) {

                      await eliminarToken();


                      setOportunidades(
                        []
                      );


                      setTiposActividad(
                        []
                      );


                      setOportunidadEditando(
                        null
                      );


                      setCurrentScreen(
                        'A01'
                      );


                      showAlert(

                        'error',

                        'Sesión finalizada',

                        'Tu sesión no es válida. Iniciá sesión nuevamente.'

                      );


                      return;

                    }


                    await cancelarOportunidad(
                      token,
                      idOportunidad
                    );


                    showAlert(

                      'success',

                      'Oportunidad cancelada',

                      'La oportunidad se canceló correctamente.'

                    );


                    await cargarOportunidades();

                  }
                  catch (error) {

                    if (
                      error.response
                        ?.status === 401
                    ) {

                      await eliminarToken();


                      setOportunidades(
                        []
                      );


                      setTiposActividad(
                        []
                      );


                      setOportunidadEditando(
                        null
                      );


                      setCurrentScreen(
                        'A01'
                      );


                      showAlert(

                        'error',

                        'Sesión finalizada',

                        'Tu sesión venció. Iniciá sesión nuevamente.'

                      );


                      return;

                    }


                    showAlert(

                      'error',

                      'No se pudo cancelar',

                      error.response
                        ?.data
                        ?.error ||

                      'Ocurrió un error al cancelar la oportunidad.'

                    );

                  }
                  finally {

                    setLoading(
                      false
                    );

                  }

                }
              }


              onCerrar={
                async (
                  idOportunidad
                ) => {

                  try {

                    setLoading(
                      true
                    );


                    const token =
                      await obtenerToken();


                    if (!token) {

                      await eliminarToken();


                      setOportunidades(
                        []
                      );


                      setTiposActividad(
                        []
                      );


                      setOportunidadEditando(
                        null
                      );


                      setCurrentScreen(
                        'A01'
                      );


                      showAlert(

                        'error',

                        'Sesión finalizada',

                        'Tu sesión no es válida. Iniciá sesión nuevamente.'

                      );


                      return;

                    }


                    await cerrarOportunidad(
                      token,
                      idOportunidad
                    );


                    showAlert(

                      'success',

                      'Oportunidad cerrada',

                      'La oportunidad se cerró correctamente.'

                    );


                    await cargarOportunidades();

                  }
                  catch (error) {

                    if (
                      error.response
                        ?.status === 401
                    ) {

                      await eliminarToken();


                      setOportunidades(
                        []
                      );


                      setTiposActividad(
                        []
                      );


                      setOportunidadEditando(
                        null
                      );


                      setCurrentScreen(
                        'A01'
                      );


                      showAlert(

                        'error',

                        'Sesión finalizada',

                        'Tu sesión venció. Iniciá sesión nuevamente.'

                      );


                      return;

                    }


                    showAlert(

                      'error',

                      'No se pudo cerrar',

                      error.response
                        ?.data
                        ?.error ||

                      'Ocurrió un error al cerrar la oportunidad.'

                    );

                  }
                  finally {

                    setLoading(
                      false
                    );

                  }

                }
              }


              onFinalizar={
                async (
                  idOportunidad
                ) => {

                  try {

                    setLoading(
                      true
                    );


                    const token =
                      await obtenerToken();


                    if (!token) {

                      await eliminarToken();


                      setOportunidades(
                        []
                      );


                      setTiposActividad(
                        []
                      );


                      setOportunidadEditando(
                        null
                      );


                      setCurrentScreen(
                        'A01'
                      );


                      showAlert(

                        'error',

                        'Sesión finalizada',

                        'Tu sesión no es válida. Iniciá sesión nuevamente.'

                      );


                      return;

                    }


                    await finalizarOportunidad(
                      token,
                      idOportunidad
                    );


                    showAlert(

                      'success',

                      'Oportunidad finalizada',

                      'La oportunidad se finalizó correctamente.'

                    );


                    await cargarOportunidades();

                  }
                  catch (error) {

                    if (
                      error.response
                        ?.status === 401
                    ) {

                      await eliminarToken();


                      setOportunidades(
                        []
                      );


                      setTiposActividad(
                        []
                      );


                      setOportunidadEditando(
                        null
                      );


                      setCurrentScreen(
                        'A01'
                      );


                      showAlert(

                        'error',

                        'Sesión finalizada',

                        'Tu sesión venció. Iniciá sesión nuevamente.'

                      );


                      return;

                    }


                    showAlert(

                      'error',

                      'No se pudo finalizar',

                      error.response
                        ?.data
                        ?.error ||

                      'Ocurrió un error al finalizar la oportunidad.'

                    );

                  }
                  finally {

                    setLoading(
                      false
                    );

                  }

                }
              }


              onLogout={
                handleLogout
              }

            />

          )}
{/* ==================================================
    Estadisticas de la organización
================================================== */}
{currentScreen ===
  'ORGANIZACION_ESTADISTICAS' && (

  <EstadisticasOrganizacionScreen
    estadisticas={
      estadisticasOrganizacion
    }
    loading={
      loadingEstadisticasOrganizacion
    }
  />

)}

{/* ==================================================
    MI ORGANIZACIÓN
================================================== */}

{currentScreen ===
  'ORGANIZACION_PERFIL' && (

  <MiOrganizacionScreen

    organizacion={
      datosOrganizacion
    }

    loading={
      loadingDatosOrganizacion
    }

    perfilPublico={
      perfilPublicoOrganizacion
    }

    loadingPerfilPublico={
      loadingPerfilPublicoOrganizacion
    }

    onLogout={
      handleLogout
    }

    onVerReputacion={async () => {

      // Abrir pantalla de reputación

      setCurrentScreen(
        'ORGANIZACION_REPUTACION'
      );


      // Posicionar el contenido al inicio

      setTimeout(() => {

        scrollRef.current?.scrollTo({
          y: 0,
          animated: false
        });

      }, 0);


      // Consultar valoraciones recibidas

      await cargarReputacionOrganizacion();

    }}

  />

)}

{/* ==================================================
    MI REPUTACIÓN - ORGANIZACIÓN
    ACTIVIDAD 3.2.2
================================================== */}

{currentScreen ===
  'ORGANIZACION_REPUTACION' && (

  <MiReputacionOrganizacionScreen

    reputacion={
      reputacionOrganizacion
    }

    loading={
      loadingReputacionOrganizacion
    }

    onVolver={() => {

      // Regresar al perfil institucional

      setCurrentScreen(
        'ORGANIZACION_PERFIL'
      );


      // Posicionar al inicio

      setTimeout(() => {

        scrollRef.current?.scrollTo({
          y: 0,
          animated: false
        });

      }, 0);

    }}

  />

)}

          {/* ==================================================
                DONACIONES RECIBIDAS - ORGANIZACIÓN
            ================================================== */}

            {currentScreen ===
              'ORGANIZACION_DONACIONES' && (

              <DonacionesRecibidasScreen

                donaciones={
                  donacionesRecibidas
                }

                loading={
                  loadingDonacionesRecibidas
                }

                estadoFiltro={
                  estadoFiltroDonacionesRecibidas
                }

                onCambiarEstadoFiltro={
                  async (
                    nuevoEstado
                  ) => {

                    await cargarDonacionesRecibidas(
                      nuevoEstado
                    );

                  }
                }

                onVerDetalle={
                  async (
                    donacion
                  ) => {

                    await cargarDetalleDonacionRecibida(
                      donacion.id_donacion
                    );

                  }
                }

              />

            )}

            {/* ==================================================
                DETALLE DE DONACIÓN RECIBIDA - ORGANIZACIÓN
            ================================================== */}

            {currentScreen ===
              'ORGANIZACION_DONACION_DETALLE' && (

              <DetalleDonacionRecibidaScreen

                donacion={
                  donacionRecibidaSeleccionada
                }

                loading={
                  loadingDetalleDonacionRecibida
                }

                loadingAccion={
                  loadingAccionDonacion
                }

                onVolver={() => {

                  setCurrentScreen(
                    'ORGANIZACION_DONACIONES'
                  );


                  setTimeout(
                    () => {

                      scrollRef.current
                        ?.scrollTo({

                          y:
                            scrollYDonacionesRecibidas,

                          animated:
                            true

                        });

                    },
                    0.1
                  );

                }}

                onAceptar={
                  handleAceptarDonacionRecibida
                }

                onRechazar={
                  handleRechazarDonacionRecibida
                }

                onCoordinar={
                  handleCoordinarDonacionRecibida
                }

                onMarcarRecibida={
                  handleMarcarDonacionRecibida
                }

              />

            )}

          {/* ==================================================
                GESTIÓN DE INSCRIPCIONES - ORGANIZACIÓN
            ================================================== */}

            {currentScreen ===
              'GESTION_INSCRIPCIONES' &&
              oportunidadGestionando && (

              <GestionInscripcionesScreen

                oportunidad={
                  oportunidadGestionando
                }
                onMarcarResultado={
                  handleMarcarResultadoParticipacion
                }

                inscripciones={
                  inscripcionesOrganizacion
                }

                loading={
                  loading
                }

                onCalificarVoluntario={
                  handleCalificarVoluntario
                }

                loadingCalificacion={
                  loadingCalificacion
                }

                onAceptar={
                  handleAceptarInscripcion
                }

                onRechazar={
                  handleRechazarInscripcion
                }
                onVerPerfil={cargarPerfilVoluntarioOrganizacion}

                onVolver={() => {

                  setInscripcionesOrganizacion(
                    []
                  );

                  setOportunidadGestionando(
                    null
                  );

                  setCurrentScreen(
                    'ORGANIZACION_HOME'
                  );

                  setTimeout(
                    () => {

                      scrollRef.current
                        ?.scrollTo({
                          y: scrollYOrganizacionGuardado,
                          animated: true
                        });

                    },
                    0.1
                  );

                }}

              />

            )}
          {/* ==================================================
    PERFIL DEL VOLUNTARIO - VISTA ORGANIZACIÓN
    MEJORA 10 - ACTIVIDAD 3.2
================================================== */}

{currentScreen ===
  'PERFIL_VOLUNTARIO_ORGANIZACION' && (

  <PerfilVoluntarioOrganizacionScreen

    perfil={
      perfilVoluntarioOrganizacion
    }

    loading={
      loadingPerfilVoluntarioOrganizacion
    }

    onVolver={() => {

      // Limpiar los datos del perfil consultado

      setPerfilVoluntarioOrganizacion(null);


      // Regresar a la gestión de inscripciones

      setCurrentScreen(
        'GESTION_INSCRIPCIONES'
      );


      // Posicionar la pantalla al inicio

      setTimeout(() => {

        scrollRef.current?.scrollTo({
          y: 0,
          animated: false
        });

      }, 0);

    }}

  />

)}

          {/* ==================================================
              FORMULARIO
          ================================================== */}

          {currentScreen ===
            'OPORTUNIDAD_FORM' && (

            <OportunidadFormScreen

              tiposActividad={
                tiposActividad
              }

              oportunidadEditando={
                oportunidadEditando
              }


              onVolver={() => {

                setOportunidadEditando(
                  null
                );


                setCurrentScreen(
                  'ORGANIZACION_HOME'
                );


                setTimeout(
                  () => {

                    scrollRef.current
                      ?.scrollTo({

                        y: 0,

                        animated:
                          true

                      });

                  },
                  0.1
                );

              }}


              onGuardado={
                async () => {

                  await cargarOportunidades();


                  setOportunidadEditando(
                    null
                  );


                  setCurrentScreen(
                    'ORGANIZACION_HOME'
                  );


                  setTimeout(
                    () => {

                      scrollRef.current
                        ?.scrollTo({

                          y: 0,

                          animated:
                            true

                        });

                    },
                    0.1
                  );

                }
              }


              showAlert={
                showAlert
              }

            />

          )}


          {/* ==================================================
              ADMIN
          ================================================== */}

          {currentScreen ===
            'ADMIN_HOME' && (

            <View
              style={{

                flex: 1,

                justifyContent:
                  'center',

                alignItems:
                  'center'

              }}
            >

              <Text
                style={{

                  fontSize:
                    22,

                  marginBottom:
                    10

                }}
              >
                Inicio Administrador
              </Text>


              <Text
                style={{

                  fontSize:
                    15,

                  marginBottom:
                    20

                }}
              >
                Rol: ADMIN
              </Text>


              <TouchableOpacity
                onPress={
                  handleLogout
                }
              >

                <Text
                  style={{
                    fontSize: 18
                  }}
                >
                  Cerrar sesión
                </Text>

              </TouchableOpacity>

            </View>

          )}

        {/* ==================================================
            ADMIN - ORGANIZACIONES
        ================================================== */}

        {currentScreen ===
          'ADMIN_ORGANIZACIONES' && (

          <OrganizacionesPendientesScreen

            organizaciones={
              organizacionesPendientes
            }

            loading={
              loadingAdmin
            }

            onVerDetalle={(
                organizacion
              ) => {

                setOrganizacionAdminSeleccionada(
                  organizacion
                );

                setCurrentScreen(
                  'ADMIN_ORGANIZACION_DETALLE'
                );


                setTimeout(
                  () => {

                    scrollRef.current
                      ?.scrollTo({
                        y: 0,
                        animated: false
                      });

                  },
                  0.1
                );

              }}

            onLogout={
              handleLogout
            }

          />

        )}  


      {/* ==================================================
          ADMIN - DETALLE ORGANIZACIÓN
      ================================================== */}

      {currentScreen ===
        'ADMIN_ORGANIZACION_DETALLE' && (

        <DetalleOrganizacionPendienteScreen

          organizacion={
            organizacionAdminSeleccionada
          }

          loading={
            loadingAccionAdmin
          }

          onVolver={() => {

            setCurrentScreen(
              'ADMIN_ORGANIZACIONES'
            );


            setTimeout(
              () => {

                scrollRef.current
                  ?.scrollTo({

                    y:
                      scrollYOrganizacionesPendientes,

                    animated:
                      true

                  });

              },
              100
            );

          }}

          onAprobar={
            handleAprobarOrganizacion
          }

          onRechazar={
            handleRechazarOrganizacion
          }

          onAnular={
            handleAnularRegistroOrganizacion
          }

        />

      )}

{/* ==================================================
    ADMIN - USUARIOS
================================================== */}

{currentScreen ===
  'ADMIN_USUARIOS' && (

  <UsuariosAdminScreen
  usuarios={
    usuariosAdmin
  }

  loading={
    loadingUsuariosAdmin
  }

  loadingAccion={
    loadingAccionAdmin
  }

  onBloquear={
    handleBloquearUsuarioAdmin
  }

  onRehabilitar={
    handleRehabilitarUsuarioAdmin
  }
  
/>

)}

{currentScreen ===
  'ADMIN_TIPOS_ACTIVIDAD' && (
  <TiposActividadAdminScreen
    tiposActividad={
      tiposActividadAdmin
    }
    loading={
      loadingTiposActividadAdmin
    }
    onNuevo={
      handleCrearTipoActividadAdmin
    }
    onEditar={
      handleActualizarTipoActividadAdmin
    }
  />
)}

{/* ==================================================
    ADMIN - PERFILES PÚBLICOS
================================================== */}

{currentScreen ===
  'ADMIN_PERFILES' && (

  <PerfilesPublicosAdminScreen />

)}

{/* ==================================================
    ADMIN - ESTADÍSTICAS
================================================== */}

{currentScreen ===
  'ADMIN_ESTADISTICAS' && (

  <EstadisticasAdminScreen

    estadisticas={
      estadisticasAdmin
    }

    loading={
      loadingEstadisticasAdmin
    }

  />

)}

        </ScrollView>

      </ImageBackground>


      {(
        currentScreen === 'VOLUNTARIO_INICIO' ||
        currentScreen === 'VOLUNTARIO_HOME' ||
        currentScreen === 'VOLUNTARIO_DONAR' ||
        currentScreen === 'MIS_DONACIONES'||
        currentScreen === 'MIS_INSCRIPCIONES'||
        currentScreen === 'VOLUNTARIO_PERFIL' ||
        currentScreen === 'VOLUNTARIO_REPUTACION'
      ) && (

            <VoluntarioBottomNav

              opcionActiva={

              currentScreen === 'VOLUNTARIO_INICIO'
                ? 'INICIO'

                : currentScreen === 'VOLUNTARIO_HOME'
                  ? 'BUSCAR'

                  : (
                    currentScreen === 'VOLUNTARIO_DONAR' ||
                    currentScreen === 'MIS_DONACIONES'
                  )
                    ? 'DONAR'

                    : (
                          currentScreen === 'VOLUNTARIO_PERFIL' ||
                          currentScreen === 'VOLUNTARIO_REPUTACION'
                        )
                          ? 'PERFIL'

                      : 'INSCRIPCIONES'

            }


              onInicio={async () => {

                setCurrentScreen(
                  'VOLUNTARIO_INICIO'
                );

                  await cargarOportunidadesInicioVoluntario();

                  await cargarRecomendacionesVoluntario(
                    ubicacionRecomendaciones
                  );;


                setTimeout(
                  () => {

                    scrollRef.current
                      ?.scrollTo({

                        y:
                          scrollYInicioVoluntario,

                        animated:
                          false

                      });

                  },
                  0.1
                );

              }}


              onBuscar={async () => {

                setCurrentScreen(
                  'VOLUNTARIO_HOME'
                );


                await cargarOportunidadesVoluntario(
                  filtrosVoluntario
                );


                setTimeout(
                  () => {

                    scrollRef.current
                      ?.scrollTo({

                        y:
                          scrollYVoluntario,

                        animated:
                          false

                      });

                  },
                  0.1
                );

              }}


              onDonar={async () => {

                setCurrentScreen(
                  'VOLUNTARIO_DONAR'
                );


                await cargarOrganizacionesDonacion(
                  filtrosDonacion
                );


                setTimeout(
                  () => {

                    scrollRef.current
                      ?.scrollTo({
                        y: 0,
                        animated: false
                      });

                  },
                  0.1
                );

              }}


              onMisInscripciones={async () => {

                setCurrentScreen(
                  'MIS_INSCRIPCIONES'
                );


                await cargarMisInscripciones();


                setTimeout(
                  () => {

                    scrollRef.current
                      ?.scrollTo({

                        y:
                          scrollYInscripciones,

                        animated:
                          false

                      });

                  },
                  0.1
                );

              }}

            onPerfil={async () => {

              // Mostrar pantalla de perfil

              setCurrentScreen(
                'VOLUNTARIO_PERFIL'
              );


              // Posicionar pantalla al inicio

              setTimeout(() => {

                scrollRef.current?.scrollTo({
                  y: 0,
                  animated: false
                });

              }, 0);


              // Recuperar datos del voluntario

              await cargarDatosVoluntario();

            }}

            />

            )}

            

            {/* ======================================================
                Barra de navegación inferior para la organización
            ====================================================== */}

            {(
              currentScreen === 'ORGANIZACION_INICIO' ||
              currentScreen === 'ORGANIZACION_HOME' ||
              currentScreen === 'ORGANIZACION_DONACIONES' ||
              currentScreen === 'ORGANIZACION_ESTADISTICAS' ||
              currentScreen === 'ORGANIZACION_PERFIL'||
              currentScreen === 'ORGANIZACION_REPUTACION'
            ) && (

              <OrganizacionBottomNav

                opcionActiva={

                  currentScreen ===
                    'ORGANIZACION_INICIO'

                    ? 'INICIO'

                    : currentScreen ===
                        'ORGANIZACION_HOME'

                      ? 'OPORTUNIDADES'

                      : currentScreen ===
                          'ORGANIZACION_DONACIONES'

                        ? 'DONACIONES'

                        : currentScreen ===
                            'ORGANIZACION_ESTADISTICAS'

                          ? 'ESTADISTICAS'

                          : 'ORGANIZACION'

                }


                onInicio={async () => {

                  setCurrentScreen(
                    'ORGANIZACION_INICIO'
                  );


                  await cargarOportunidades();

                }}


                onMisOportunidades={async () => {

                  setCurrentScreen(
                    'ORGANIZACION_HOME'
                  );


                  await cargarOportunidades();

                }}


                onDonaciones={async () => {

                  setEstadoFiltroDonacionesRecibidas(
                    'TODAS'
                  );

                  setScrollYDonacionesRecibidas(
                    0
                  );


                  setCurrentScreen(
                    'ORGANIZACION_DONACIONES'
                  );


                  await cargarDonacionesRecibidas(
                    'TODAS'
                  );


                  setTimeout(
                    () => {

                      scrollRef.current
                        ?.scrollTo({
                          y: 0,
                          animated: false
                        });

                    },
                    0.1
                  );

                }}


                onMiOrganizacion={async () => {

                  setCurrentScreen(
                    'ORGANIZACION_PERFIL'
                  );


                  await Promise.all([
                    cargarDatosOrganizacion(),
                    cargarPerfilPublicoOrganizacion()
                  ]);


                  setTimeout(() => {

                    scrollRef.current?.scrollTo({
                      y: 0,
                      animated: false
                    });

                  }, 0);

                }}

              onEstadisticas={async () => {

                setCurrentScreen(
                  'ORGANIZACION_ESTADISTICAS'
                );


                await cargarEstadisticasOrganizacion();


                setTimeout(
                  () => {

                    scrollRef.current
                      ?.scrollTo({
                        y: 0,
                        animated: false
                      });

                  },
                  0.1
                );

              }}

              />

            )}

        {/* ======================================================
              Barra de navegación inferior para ADMIN
          ====================================================== */}

          {(
            currentScreen ===
              'ADMIN_HOME' ||

            currentScreen ===
              'ADMIN_ORGANIZACIONES' ||

            currentScreen ===
              'ADMIN_USUARIOS' ||

              currentScreen ===
              'ADMIN_PERFILES' ||

            currentScreen ===
              'ADMIN_TIPOS_ACTIVIDAD' ||

            currentScreen ===
              'ADMIN_ESTADISTICAS'

          ) && (

            <AdminBottomNav

              opcionActiva={

                currentScreen ===
                  'ADMIN_HOME'

                  ? 'INICIO'

                  : currentScreen ===
                      'ADMIN_ORGANIZACIONES' ||
                    currentScreen ===
                      'ADMIN_ORGANIZACION_DETALLE'

                    ? 'ORGANIZACIONES'

                    : currentScreen ===
                        'ADMIN_USUARIOS'

                      ? 'USUARIOS'

                      : currentScreen ===
                          'ADMIN_PERFILES'

                        ? 'PERFILES'

                        : currentScreen ===
                            'ADMIN_TIPOS_ACTIVIDAD'

                          ? 'TIPOS_ACTIVIDAD'

                        : currentScreen ===
                            'ADMIN_ESTADISTICAS'

                          ? 'ESTADISTICAS'

                          : 'INICIO'

              }

              onTiposActividad={async () => {

                setCurrentScreen(
                  'ADMIN_TIPOS_ACTIVIDAD'
                );

                await cargarTiposActividadAdmin();

                scrollToTop?.();

              }}

              onInicio={() => {

                setCurrentScreen(
                  'ADMIN_HOME'
                );


                setTimeout(
                  () => {

                    scrollRef.current
                      ?.scrollTo({
                        y: 0,
                        animated: false
                      });

                  },
                  0.1
                );

              }}


              onOrganizaciones={async () => {

                setCurrentScreen(
                  'ADMIN_ORGANIZACIONES'
                );


                await cargarOrganizacionesPendientes();


                setTimeout(
                  () => {

                    scrollRef.current
                      ?.scrollTo({
                        y: 0,
                        animated: false
                      });

                  },
                  0.1
                );

              }}

              onUsuarios={async () => {

                setCurrentScreen(
                  'ADMIN_USUARIOS'
                );


                await cargarUsuariosAdmin();


                setTimeout(
                  () => {

                    scrollRef.current
                      ?.scrollTo({
                        y: 0,
                        animated: false
                      });

                  },
                  0.1
                );

              }}
          
            onPerfiles={() => {

            setCurrentScreen(
              'ADMIN_PERFILES'
            );


            setTimeout(
              () => {

                scrollRef.current
                  ?.scrollTo({
                    y: 0,
                    animated: false
                  });

              },
              0.1
            );

          }}

          onEstadisticas={async () => {

            setCurrentScreen(
              'ADMIN_ESTADISTICAS'
            );


            await cargarEstadisticasAdmin();


            setTimeout(
              () => {

                scrollRef.current
                  ?.scrollTo({
                    y: 0,
                    animated: false
                  });

              },
              0.1
            );

          }}
          
          />
        )}
            

            

      


      {/* ======================================================
          MODAL GENERAL
      ====================================================== */}

      <Modal

        animationType="fade"

        transparent={
          true
        }

        visible={
          modalVisible
        }

        onRequestClose={() =>
          setModalVisible(
            false
          )
        }

      >

        <View
          style={
            styles.modalOverlay
          }
        >

          <View
            style={
              styles.modalCard
            }
          >

            <View
              style={[

                styles.modalHeader,

                modalType ===
                  'success'

                  ? styles.headerSuccess

                  : styles.headerError

              ]}
            >

              <Text
                style={
                  styles.modalHeaderIcon
                }
              >

                {modalType ===
                  'success'
                  ? '✓'
                  : '✕'}

              </Text>

            </View>


            <View
              style={
                styles.modalBody
              }
            >

              <Text
                style={
                  styles.modalTitleText
                }
              >
                {modalTitle}
              </Text>


              <Text
                style={
                  styles.modalMessageText
                }
              >
                {modalMessage}
              </Text>


              <TouchableOpacity

                style={[

                  styles.modalButton,

                  modalType ===
                    'success'

                    ? styles.btnSuccess

                    : styles.btnError

                ]}

                onPress={() =>
                  setModalVisible(
                    false
                  )
                }

              >

                <Text
                  style={
                    styles.modalButtonText
                  }
                >
                  Entendido
                </Text>

              </TouchableOpacity>

            </View>

          </View>

        </View>

      </Modal>


      {/* ======================================================
          MODAL LOGOUT
      ====================================================== */}

      <Modal

        visible={
          logoutVisible
        }

        transparent={
          true
        }

        animationType="fade"

        onRequestClose={() =>
          setLogoutVisible(
            false
          )
        }

      >

        <View
          style={
            styles.logoutOverlay
          }
        >

          <View
            style={
              styles.logoutModal
            }
          >

            <Text
              style={
                styles.logoutModalTitle
              }
            >
              Cerrar sesión
            </Text>


            <Text
              style={
                styles.logoutModalText
              }
            >
              ¿Estás seguro de que querés cerrar sesión?
            </Text>


            <View
              style={
                styles.logoutModalButtons
              }
            >

              <TouchableOpacity

                style={
                  styles.cancelButton
                }

                onPress={() =>
                  setLogoutVisible(
                    false
                  )
                }

                activeOpacity={
                  0.8
                }

              >

                <Text
                  style={
                    styles.cancelButtonText
                  }
                >
                  Cancelar
                </Text>

              </TouchableOpacity>


              <TouchableOpacity

                style={
                  styles.confirmLogoutButton
                }

                onPress={
                  confirmarLogout
                }

                activeOpacity={
                  0.8
                }

              >

                <Text
                  style={
                    styles.confirmLogoutButtonText
                  }
                >
                  Cerrar sesión
                </Text>

              </TouchableOpacity>

            </View>

          </View>

        </View>

      </Modal>

    </View>
    </SafeAreaProvider>

  );

}


// ======================================================
// ESTILOS
// ======================================================

const styles =
  StyleSheet.create({


    mainContainer: {

      flex: 1,

      backgroundColor:
        '#F6F8F7'

    },


    backgroundImage: {

      flex: 1,

      width: '100%',

      height: '100%'

    },


    scrollContainer: {

      flexGrow: 1,

      justifyContent:
        'center',

      alignItems:
        'center',

      paddingVertical:
        40,

      paddingHorizontal:
        20

    },


    scrollContainerOrganizacion: {

      justifyContent:
        'flex-start'

    },


    modalOverlay: {

      flex: 1,

      backgroundColor:
        'rgba(0,0,0,0.5)',

      justifyContent:
        'center',

      alignItems:
        'center',

      paddingHorizontal:
        30

    },


    modalCard: {

      width:
        '100%',

      backgroundColor:
        '#FFFFFF',

      borderRadius:
        18,

      overflow:
        'hidden',

      elevation:
        10

    },


    modalHeader: {

      height:
        60,

      justifyContent:
        'center',

      alignItems:
        'center'

    },


    headerSuccess: {

      backgroundColor:
        '#1F6F5C'

    },


    headerError: {

      backgroundColor:
        '#C62828'

    },


    modalHeaderIcon: {

      color:
        '#FFFFFF',

      fontSize:
        28,

      fontWeight:
        'bold'

    },


    modalBody: {

      padding:
        20,

      alignItems:
        'center'

    },


    modalTitleText: {

      fontSize:
        17,

      fontWeight:
        'bold',

      color:
        '#1F2937',

      marginBottom:
        6

    },


    modalMessageText: {

      fontSize:
        13,

      color:
        '#5F6B76',

      textAlign:
        'center',

      marginBottom:
        18,

      lineHeight:
        18

    },


    modalButton: {

      width:
        '100%',

      height:
        44,

      borderRadius:
        8,

      justifyContent:
        'center',

      alignItems:
        'center'

    },


    btnSuccess: {

      backgroundColor:
        '#1F6F5C'

    },


    btnError: {

      backgroundColor:
        '#C62828'

    },


    modalButtonText: {

      color:
        '#FFFFFF',

      fontSize:
        14,

      fontWeight:
        'bold'

    },


    logoutOverlay: {

      flex: 1,

      backgroundColor:
        'rgba(0,0,0,0.5)',

      justifyContent:
        'center',

      alignItems:
        'center',

      paddingHorizontal:
        30

    },


    logoutModal: {

      width:
        '100%',

      maxWidth:
        360,

      backgroundColor:
        '#FFFFFF',

      borderRadius:
        18,

      padding:
        22,

      elevation:
        10,

      shadowColor:
        '#000000',

      shadowOffset: {

        width: 0,

        height: 4

      },

      shadowOpacity:
        0.18,

      shadowRadius:
        10

    },


    logoutModalTitle: {

      fontSize:
        20,

      fontWeight:
        'bold',

      color:
        '#164C40',

      textAlign:
        'center',

      marginBottom:
        10

    },


    logoutModalText: {

      fontSize:
        14,

      color:
        '#5F6B76',

      textAlign:
        'center',

      lineHeight:
        20,

      marginBottom:
        22

    },


    logoutModalButtons: {

      flexDirection:
        'row',

      gap:
        10

    },


    cancelButton: {

      flex:
        1,

      height:
        46,

      borderRadius:
        10,

      borderWidth:
        1,

      borderColor:
        '#1F6F5C',

      backgroundColor:
        '#FFFFFF',

      alignItems:
        'center',

      justifyContent:
        'center'

    },


    cancelButtonText: {

      color:
        '#1F6F5C',

      fontSize:
        14,

      fontWeight:
        'bold'

    },


    confirmLogoutButton: {

      flex:
        1,

      height:
        46,

      borderRadius:
        10,

      backgroundColor:
        '#C62828',

      alignItems:
        'center',

      justifyContent:
        'center'

    },


    confirmLogoutButtonText: {

      color:
        '#FFFFFF',

      fontSize:
        14,

      fontWeight:
        'bold'

    },

    

  });