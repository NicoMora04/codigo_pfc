import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ImageBackground,
  ScrollView,
  Modal,
  Text,
  TouchableOpacity,
} from 'react-native';

import axios from 'axios';

import LoginScreen from './src/screens/LoginScreen';
import RoleSelectionScreen from './src/screens/RoleSelectionScreen';
import RegisterVoluntario from './src/screens/RegisterVoluntario';
import RegisterOrganizacion from './src/screens/RegisterOrganizacion';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import MisOportunidadesScreen from './src/screens/MisOportunidadesScreen';
import OportunidadFormScreen from './src/screens/OportunidadFormScreen';
import BuscarOportunidadesScreen from './src/screens/BuscarOportunidadesScreen';
import DetalleOportunidadScreen from './src/screens/DetalleOportunidadScreen';

import {
  guardarToken,
  obtenerToken,
  eliminarToken
} from './src/services/authStorage';


export default function App() {

  const [currentScreen, setCurrentScreen] = useState('A01');
  const [loading, setLoading] = useState(false);
  const [oportunidades, setOportunidades] = useState([]);
  const [oportunidadesVoluntario, setOportunidadesVoluntario] = useState([]);
  const [tiposActividad, setTiposActividad] = useState([]);
  const [oportunidadEditando, setOportunidadEditando] = useState(null);
  const [oportunidadSeleccionada,setOportunidadSeleccionada] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // Modal de cierre de sesión
  const [logoutVisible, setLogoutVisible] = useState(false);

  // IP local para la API del Backend
  const API_URL = 'http://192.168.0.93:3000/api/auth';


  // ======================================================
  // VERIFICAR SESIÓN GUARDADA
  // ======================================================

  useEffect(() => {

  const verificarSesionGuardada = async () => {

    const token = await obtenerToken();

    if (!token) {
      return;
    }

    try {

      const response = await axios.get(
        `${API_URL}/perfil-protegido`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const rol = response.data.usuario.rol;

      if (rol === 'VOLUNTARIO') {

        setCurrentScreen('VOLUNTARIO_HOME');
        await cargarTiposActividad();
        await cargarOportunidadesVoluntario();

      }
      else if (rol === 'ORGANIZACION') {

        setCurrentScreen('ORGANIZACION_HOME');
        await cargarOportunidades();

      }
      else if (rol === 'ADMIN') {

        setCurrentScreen('ADMIN_HOME');

      }
      else {

        await eliminarToken();

        setCurrentScreen('A01');

      }

    } catch (error) {

      if (error.response?.status === 401) {

        await eliminarToken();

        setCurrentScreen('A01');

        console.log(
          'TOKEN VENCIDO O INVÁLIDO. SESIÓN ELIMINADA.'
        );

      }

    }

  };

  verificarSesionGuardada();

}, []);


  // ======================================================
  // MODAL DE ALERTA FLOTANTE
  // ======================================================

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');


  const showAlert = (type, title, message) => {

    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);

  };



  // ======================================================
  // 1. INICIAR SESIÓN (A01)
  // ======================================================

  const handleLogin = async (email, password) => {

    if (!email || !password) {

      showAlert(
        'error',
        'Campos Incompletos',
        'Por favor ingresa tu correo electrónico y contraseña.'
      );

      return;
    }


    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailRegex.test(email)) {

      showAlert(
        'error',
        'Correo Inválido',
        'Ingresá un correo electrónico válido.'
      );

      return;
    }


    setLoading(true);


    try {

      const response = await axios.post(
        `${API_URL}/login`,
        {
          email,
          password
        }
      );


      await guardarToken(response.data.token);

      const rol = response.data.user.rol;

      if (rol === 'VOLUNTARIO') {
        setCurrentScreen('VOLUNTARIO_HOME');
        await cargarTiposActividad();
        await cargarOportunidadesVoluntario();
      }
      else if (rol === 'ORGANIZACION') {
        setCurrentScreen('ORGANIZACION_HOME');
        await cargarOportunidades();
      }
      else if (rol === 'ADMIN') {
        setCurrentScreen('ADMIN_HOME');
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
        `Inicio de sesión exitoso.\nRol: ${response.data.user.rol}`
      );


    } catch (error) {

      const errorMsg =
        error.response?.data?.error ||
        'No se pudo conectar con el servidor backend';


      showAlert(
        'error',
        'Error de Acceso',
        errorMsg
      );


    } finally {

      setLoading(false);

    }

  };



  // ======================================================
  // 2. REGISTRO VOLUNTARIO (A05)
  // ======================================================

  const handleRegisterVoluntario = async (data) => {

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


    setLoading(true);


    try {

      await axios.post(
        `${API_URL}/register`,
        data
      );


      setLoading(false);


      showAlert(
        'success',
        '¡Cuenta Creada!',
        'Tu registro como voluntario se completó con éxito. Ya podés iniciar sesión.'
      );


      setCurrentScreen(
        'A01'
      );


    } catch (error) {

      setLoading(false);


      const errorMsg =
        error.response?.data?.error ||
        'No se pudo crear la cuenta de voluntario';


      showAlert(
        'error',
        'Error de Registro',
        errorMsg
      );

    }

  };



  // ======================================================
  // 3. REGISTRO ORGANIZACIÓN (A06)
  // ======================================================

  const handleRegisterOrganizacion = async (data) => {


    const camposFaltantes = [];


    if (!data.razon_social) {
      camposFaltantes.push(
        'Razón Social'
      );
    }


    if (!data.cuit) {
      camposFaltantes.push(
        'CUIT'
      );
    }


    if (!data.email) {
      camposFaltantes.push(
        'Correo'
      );
    }


    if (!data.password) {
      camposFaltantes.push(
        'Contraseña'
      );
    }


    if (camposFaltantes.length > 0) {

      showAlert(
        'error',
        'Campos Incompletos',
        `Faltan los siguientes campos: ${camposFaltantes.join(', ')}.`
      );

      return;
    }


    if (data.cuit.length !== 11) {

      showAlert(
        'error',
        'CUIT Inválido',
        'El CUIT debe contener exactamente 11 dígitos numéricos.'
      );

      return;
    }


    setLoading(true);


    try {

      await axios.post(
        `${API_URL}/register`,
        data
      );



      setLoading(false);


      showAlert(
        'success',
        '¡Organización Registrada!',
        'Tu cuenta fue creada con éxito. Su estado de verificación es PENDIENTE hasta ser revisada.'
      );


      setCurrentScreen(
        'A01'
      );


    } catch (error) {

      setLoading(false);


      console.error(
        'ERROR DEL BACKEND:'
      );

      console.error(
        error.response?.data ||
        error.message
      );


      const errorMsg =
        error.response?.data?.details ||
        error.response?.data?.error ||
        'No se pudo registrar la organización';


      showAlert(
        'error',
        'Error de Registro',
        errorMsg
      );

    }

  };



  // ======================================================
  // 4. RECUPERAR CONTRASEÑA (A02)
  // ======================================================

  const handleForgotPassword = async (email) => {

    setLoading(true);


    try {

      const response = await axios.post(
        `${API_URL}/forgot-password`,
        {
          email
        }
      );


      setLoading(false);


      showAlert(
        'success',
        'Solicitud Enviada',
        response.data.message
      );


      setCurrentScreen(
        'A01'
      );


    } catch (error) {

      setLoading(false);


      const errorMsg =
        error.response?.data?.error ||
        'No se pudo procesar la solicitud.';


      showAlert(
        'error',
        'Error',
        errorMsg
      );

    }

  };

  ///CARGAR OPORTUNIDADES ORGANIZACION
const cargarOportunidades = async () => {

  setLoading(true);

  try {

    const token = await obtenerToken();

    if (!token) {
      await eliminarToken();
      setOportunidades([]);
      setCurrentScreen('A01');

      showAlert(
        'error',
        'Sesión finalizada',
        'Tu sesión no es válida. Iniciá sesión nuevamente.'
      );

      return;
    }

    const response = await axios.get(
      'http://192.168.0.93:3000/api/oportunidades/mias',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setOportunidades(
      response.data.oportunidades
    );

  } catch (error) {

  if (error.response?.status === 401) {

    await eliminarToken();

    setOportunidades([]);
    setTiposActividad([]);
    setOportunidadEditando(null);

    setCurrentScreen('A01');

    showAlert(
      'error',
      'Sesión finalizada',
      'Tu sesión venció. Iniciá sesión nuevamente.'
    );

    return;
  }

    const errorMsg =
      error.response?.data?.error ||
      'No se pudieron cargar las oportunidades';

    showAlert(
      'error',
      'Error',
      errorMsg
    );

  } finally {

    setLoading(false);

  }

};


  // ======================================================
  // 5. CERRAR SESIÓN
  // ======================================================

  const handleLogout = () => {

    setLogoutVisible(true);

  };


  const confirmarLogout = async () => {

  await eliminarToken();

  setOportunidades([]);
  setTiposActividad([]);
  setOportunidadEditando(null);

  setLogoutVisible(false);

  setCurrentScreen('A01');

  };

///TIPOOS DE ACTIVIDAD ORGANIZACION 
  const cargarTiposActividad = async () => {
  try {
    const token = await obtenerToken();

    if (!token) {

        await eliminarToken();

        setOportunidades([]);
        setTiposActividad([]);
        setOportunidadEditando(null);

        setCurrentScreen('A01');


        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión no es válida. Iniciá sesión nuevamente.'
        );

        return false;
      }

    const response = await axios.get(
      'http://192.168.0.93:3000/api/tipos-actividad',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );


  
    

    const tipos = response.data?.tiposActividad;

      if (!Array.isArray(tipos)) {

        showAlert(
          'error',
          'Error',
          'La respuesta de tipos de actividad no es válida.'
        );

        return false;
      }

      setTiposActividad(tipos);

      return true;
  } catch (error) {

    if (error.response?.status === 401) {

      await eliminarToken();

      setOportunidades([]);
      setTiposActividad([]);
      setOportunidadEditando(null);

      setCurrentScreen('A01');

      showAlert(
        'error',
        'Sesión finalizada',
        'Tu sesión venció. Iniciá sesión nuevamente.'
      );

      return false;
    }

    console.log(
      'Error cargando tipos de actividad:',
      error.response?.data || error.message
    );
    showAlert(
    'error',
    'Error',
    error.response?.data?.error ||
      'No se pudieron cargar los tipos de actividad.'
    );
    return false;
  }
};


//Oportunidades voluntario
const cargarOportunidadesVoluntario = async (filtros={}) => {

  setLoading(true);

  try {

    const token = await obtenerToken();

    if (!token) {

      await eliminarToken();

      setOportunidadesVoluntario([]);
      setCurrentScreen('A01');

      showAlert(
        'error',
        'Sesión finalizada',
        'Tu sesión no es válida. Iniciá sesión nuevamente.'
      );

      return;
    }

    const response = await axios.get(
      'http://192.168.0.93:3000/api/oportunidades',
      {
        params:filtros,
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

   
    setOportunidadesVoluntario(
      response.data.oportunidades
    );

  } catch (error) {

    if (error.response?.status === 401) {

      await eliminarToken();

      setOportunidadesVoluntario([]);
      setCurrentScreen('A01');

      showAlert(
        'error',
        'Sesión finalizada',
        'Tu sesión venció. Iniciá sesión nuevamente.'
      );

      return;
    }

    console.log(
      'Error cargando oportunidades para voluntario:',
      error.response?.data || error.message
    );

    showAlert(
      'error',
      'Error',
      error.response?.data?.error ||
        'No se pudieron cargar las oportunidades.'
    );

  } finally {

    setLoading(false);

  }

};

const cargarDetalleOportunidadVoluntario = async (
  idOportunidad
) => {

  setLoadingDetalle(true);

  try {

    const token = await obtenerToken();

    if (!token) {

      await eliminarToken();

      setOportunidadSeleccionada(null);
      setCurrentScreen('A01');

      showAlert(
        'error',
        'Sesión finalizada',
        'Tu sesión no es válida. Iniciá sesión nuevamente.'
      );

      return false;
    }

    const response = await axios.get(
      `http://192.168.0.93:3000/api/oportunidades/${idOportunidad}/detalle`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setOportunidadSeleccionada(
      response.data.oportunidad
    );

    setCurrentScreen(
      'OPORTUNIDAD_DETALLE'
    );

    return true;

  } catch (error) {

    if (error.response?.status === 401) {

      await eliminarToken();

      setOportunidadSeleccionada(null);
      setCurrentScreen('A01');

      showAlert(
        'error',
        'Sesión finalizada',
        'Tu sesión venció. Iniciá sesión nuevamente.'
      );

      return false;
    }

    console.log(
      'Error cargando detalle de oportunidad:',
      error.response?.data || error.message
    );

    showAlert(
      'error',
      'Error',
      error.response?.data?.error ||
        'No se pudo cargar la oportunidad.'
    );

    return false;

  } finally {

    setLoadingDetalle(false);

  }

};

const buscarUbicaciones = async (texto) => {

  try {

    const token = await obtenerToken();

    if (!token) {

      await eliminarToken();

      setCurrentScreen('A01');

      showAlert(
        'error',
        'Sesión finalizada',
        'Tu sesión no es válida. Iniciá sesión nuevamente.'
      );

      return [];
    }

    const response = await axios.get(
      'http://192.168.0.93:3000/api/ubicaciones/buscar',
      {
        params: {
          q: texto
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const resultados = response.data?.resultados;

    if (!Array.isArray(resultados)) {

      showAlert(
        'error',
        'Error',
        'La respuesta de búsqueda de ubicaciones no es válida.'
      );

      return [];
    }

    return resultados;

  } catch (error) {

    if (error.response?.status === 401) {

      await eliminarToken();

      setCurrentScreen('A01');

      showAlert(
        'error',
        'Sesión finalizada',
        'Tu sesión venció. Iniciá sesión nuevamente.'
      );

      return [];
    }

    console.log(
      'Error buscando ubicaciones:',
      error.response?.data || error.message
    );

    showAlert(
      'error',
      'Error',
      error.response?.data?.error ||
        'No se pudieron buscar ubicaciones.'
    );

    return [];
  }

};


  // ======================================================
  // RENDER PRINCIPAL
  // ======================================================

  return (

    <View style={styles.mainContainer}>

      <ImageBackground
        source={require('./assets/fondo.png')}
        style={styles.backgroundImage}
        imageStyle={{
          opacity: 0.22
        }}
      >

        <ScrollView
          contentContainerStyle={
            styles.scrollContainer
          }
        >


          {/* ==================================================
              A01 - INICIO DE SESIÓN
          ================================================== */}

          {currentScreen === 'A01' && (

            <LoginScreen

              onLogin={handleLogin}

              onNavigateRegister={() =>
                setCurrentScreen('A04')
              }

              onNavigateForgotPassword={() =>
                setCurrentScreen('A02')
              }

              loading={loading}

            />

          )}



          {/* ==================================================
              A02 - RECUPERAR CONTRASEÑA
          ================================================== */}

          {currentScreen === 'A02' && (

            <ForgotPasswordScreen

              onSendResetLink={
                handleForgotPassword
              }

              onBack={() =>
                setCurrentScreen('A01')
              }

              loading={loading}

              showAlert={showAlert}

            />

          )}



          {/* ==================================================
              A04 - SELECCIÓN DE ROL
          ================================================== */}

          {currentScreen === 'A04' && (

            <RoleSelectionScreen

              onSelectRole={(screen) =>
                setCurrentScreen(screen)
              }

              onBack={() =>
                setCurrentScreen('A01')
              }

            />

          )}



          {/* ==================================================
              A05 - REGISTRO VOLUNTARIO
          ================================================== */}

          {currentScreen === 'A05' && (

            <RegisterVoluntario

              onRegister={
                handleRegisterVoluntario
              }

              onBack={() =>
                setCurrentScreen('A04')
              }

              loading={loading}

              showAlert={showAlert}

            />

          )}



          {/* ==================================================
              A06 - REGISTRO ORGANIZACIÓN
          ================================================== */}

          {currentScreen === 'A06' && (

            <RegisterOrganizacion

              onRegister={
                handleRegisterOrganizacion
              }

              onBack={() =>
                setCurrentScreen('A04')
              }

              loading={loading}

              showAlert={showAlert}

            />

          )}



          {/* ==================================================
              HOME TEMPORAL
          ================================================== */}

        {/* ==================================================
    HOME TEMPORAL - VOLUNTARIO
================================================== */}

    {currentScreen === 'VOLUNTARIO_HOME' && (

      <BuscarOportunidadesScreen

        oportunidades={oportunidadesVoluntario}
        tiposActividad={tiposActividad}
        loading={loading}
          onFiltrar={async (filtros) => {
          await cargarOportunidadesVoluntario(filtros);
          } }
        onBuscarUbicacion={buscarUbicaciones}  
        onLogout={handleLogout}
        onVerDetalle={async (idOportunidad) => {
           await cargarDetalleOportunidadVoluntario(idOportunidad );
        }}

      />)}

        
    {currentScreen === 'OPORTUNIDAD_DETALLE' && (

        <DetalleOportunidadScreen

          oportunidad={oportunidadSeleccionada}

          loading={loadingDetalle}

          onVolver={() => {
            setOportunidadSeleccionada(null);
            setCurrentScreen('VOLUNTARIO_HOME');
          }}

        />

      )}
  


    {/* ==================================================
    HOME TEMPORAL - ORGANIZACIÓN
================================================== */}

    {currentScreen === 'ORGANIZACION_HOME' && (

  <MisOportunidadesScreen

    oportunidades={oportunidades}

    loading={loading}

    onNuevaOportunidad={async () => {
      setOportunidadEditando(null)
      const tiposCargados= await cargarTiposActividad();
      if (!tiposCargados) {
    return;
    }
      setCurrentScreen('OPORTUNIDAD_FORM');
    }}


    onEditar={async (idOportunidad) => {
    try {
      setLoading(true);

      const token = await obtenerToken();

      if (!token) {

        await eliminarToken();

        setOportunidades([]);
        setTiposActividad([]);
        setOportunidadEditando(null);

        setCurrentScreen('A01');

        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión no es válida. Iniciá sesión nuevamente.'
        );

        return;
      }

      const response = await axios.get(
        `http://192.168.0.93:3000/api/oportunidades/${idOportunidad}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const tiposCargados =
        await cargarTiposActividad();

      if (!tiposCargados) {
        return;
      }

      

      setOportunidadEditando(
        response.data.oportunidad
      );


      setCurrentScreen('OPORTUNIDAD_FORM');

    } catch (error) {

      if (error.response?.status === 401) {

        await eliminarToken();

        setOportunidades([]);
        setTiposActividad([]);
        setOportunidadEditando(null);

        setCurrentScreen('A01');

        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );

        return;
      }

      console.log(
        'Error cargando oportunidad:',
        error.response?.data || error.message
      );

      showAlert(
        'error',
        'Error',
        'No se pudo cargar la oportunidad.'
      );

    } finally {
      setLoading(false);
    }
  }}

    onPublicar={async (idOportunidad) => {
          try {
        setLoading(true);

        const token = await obtenerToken();

        if (!token) {

          await eliminarToken();

          setOportunidades([]);
          setTiposActividad([]);
          setOportunidadEditando(null);

          setCurrentScreen('A01');

          showAlert(
            'error',
            'Sesión finalizada',
            'Tu sesión no es válida. Iniciá sesión nuevamente.'
          );

          return;
        }

        await axios.patch(
          `http://192.168.0.93:3000/api/oportunidades/${idOportunidad}/publicar`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        showAlert(
          'success',
          'Oportunidad publicada',
          'La oportunidad se publicó correctamente.'
        );

        await cargarOportunidades();

      } catch (error) {

        if (error.response?.status === 401) {

          await eliminarToken();

          setOportunidades([]);
          setTiposActividad([]);
          setOportunidadEditando(null);

          setCurrentScreen('A01');

          showAlert(
            'error',
            'Sesión finalizada',
            'Tu sesión venció. Iniciá sesión nuevamente.'
          );

          return;
        }

        console.log(
          'Error publicando oportunidad:',
          error.response?.data || error.message
        );

        showAlert(
          'error',
          'No se pudo publicar',
          error.response?.data?.error ||
            'Ocurrió un error al publicar la oportunidad.'
        );

      } finally {
        setLoading(false);
      }
    }}

    onCancelar={async (idOportunidad) => {
    try {
      setLoading(true);

      const token = await obtenerToken();

      if (!token) {

        await eliminarToken();

        setOportunidades([]);
        setTiposActividad([]);
        setOportunidadEditando(null);

        setCurrentScreen('A01');

        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión no es válida. Iniciá sesión nuevamente.'
        );

        return;
      }

      await axios.patch(
        `http://192.168.0.93:3000/api/oportunidades/${idOportunidad}/cancelar`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showAlert(
        'success',
        'Oportunidad cancelada',
        'La oportunidad se canceló correctamente.'
      );

      await cargarOportunidades();

    } catch (error) {

      if (error.response?.status === 401) {

        await eliminarToken();

        setOportunidades([]);
        setTiposActividad([]);
        setOportunidadEditando(null);

        setCurrentScreen('A01');

        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión venció. Iniciá sesión nuevamente.'
        );

        return;
      }

      console.log(
        'Error cancelando oportunidad:',
        error.response?.data || error.message
      );

      showAlert(
        'error',
        'No se pudo cancelar',
        error.response?.data?.error ||
          'Ocurrió un error al cancelar la oportunidad.'
      );

    } finally {
      setLoading(false);
    }
  }}


  onCerrar={async (idOportunidad) => {
  try {
    setLoading(true);

    const token = await obtenerToken();

    if (!token) {

        await eliminarToken();

        setOportunidades([]);
        setTiposActividad([]);
        setOportunidadEditando(null);

        setCurrentScreen('A01');

        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión no es válida. Iniciá sesión nuevamente.'
        );

        return;
    }

    await axios.patch(
      `http://192.168.0.93:3000/api/oportunidades/${idOportunidad}/cerrar`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    showAlert(
      'success',
      'Oportunidad cerrada',
      'La oportunidad se cerró correctamente.'
    );

    await cargarOportunidades();

  } catch (error) {

    if (error.response?.status === 401) {

      await eliminarToken();

      setOportunidades([]);
      setTiposActividad([]);
      setOportunidadEditando(null);

      setCurrentScreen('A01');

      showAlert(
        'error',
        'Sesión finalizada',
        'Tu sesión venció. Iniciá sesión nuevamente.'
      );

      return;
    }

    console.log(
      'Error cerrando oportunidad:',
      error.response?.data || error.message
    );

    showAlert(
      'error',
      'No se pudo cerrar',
      error.response?.data?.error ||
        'Ocurrió un error al cerrar la oportunidad.'
    );

  } finally {
    setLoading(false);
  }
}}

onFinalizar={async (idOportunidad) => {
  try {
    setLoading(true);

    const token = await obtenerToken();

    if (!token) {

        await eliminarToken();

        setOportunidades([]);
        setTiposActividad([]);
        setOportunidadEditando(null);

        setCurrentScreen('A01');

        showAlert(
          'error',
          'Sesión finalizada',
          'Tu sesión no es válida. Iniciá sesión nuevamente.'
        );

        return;
    }

    await axios.patch(
      `http://192.168.0.93:3000/api/oportunidades/${idOportunidad}/finalizar`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    showAlert(
      'success',
      'Oportunidad finalizada',
      'La oportunidad se finalizó correctamente.'
    );

    await cargarOportunidades();

  } catch (error) {

    if (error.response?.status === 401) {

      await eliminarToken();

      setOportunidades([]);
      setTiposActividad([]);
      setOportunidadEditando(null);

      setCurrentScreen('A01');

      showAlert(
        'error',
        'Sesión finalizada',
        'Tu sesión venció. Iniciá sesión nuevamente.'
      );

      return;
    }

    console.log(
      'Error finalizando oportunidad:',
      error.response?.data || error.message
    );

    showAlert(
      'error',
      'No se pudo finalizar',
      error.response?.data?.error ||
        'Ocurrió un error al finalizar la oportunidad.'
    );

  } finally {
    setLoading(false);
  }
}}

    onLogout={handleLogout}

  />

)}


{currentScreen === 'OPORTUNIDAD_FORM' && (
  <OportunidadFormScreen  tiposActividad={tiposActividad} oportunidadEditando={oportunidadEditando}
    onVolver={() =>{
      setOportunidadEditando(null);
      setCurrentScreen('ORGANIZACION_HOME');
    }}
    onGuardado={async () => {
    await cargarOportunidades();
    setOportunidadEditando(null);
    setCurrentScreen('ORGANIZACION_HOME');
    }}

  showAlert={showAlert}
  />
)}



    {
    
    /* ==================================================
    HOME TEMPORAL - ADMIN
================================================== */}

      {currentScreen === 'ADMIN_HOME' && (

        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >

          <Text
            style={{
              fontSize: 22,
              marginBottom: 10
            }}
          >
            Inicio Administrador
          </Text>

          <Text
            style={{
              fontSize: 15,
              marginBottom: 20
            }}
          >
            Rol: ADMIN
          </Text>

          <TouchableOpacity
            onPress={handleLogout}
          >
            <Text style={{ fontSize: 18 }}>
              Cerrar sesión
            </Text>
          </TouchableOpacity>

        </View>

      )}


        </ScrollView>

      </ImageBackground>



      {/* ======================================================
          MODAL PERSONALIZADO GENERAL
      ====================================================== */}

      <Modal

        animationType="fade"

        transparent={true}

        visible={modalVisible}

        onRequestClose={() =>
          setModalVisible(false)
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

                modalType === 'success'
                  ? styles.headerSuccess
                  : styles.headerError
              ]}
            >

              <Text
                style={
                  styles.modalHeaderIcon
                }
              >

                {modalType === 'success'
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

                  modalType === 'success'
                    ? styles.btnSuccess
                    : styles.btnError
                ]}

                onPress={() =>
                  setModalVisible(false)
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
          MODAL CIERRE DE SESIÓN
      ====================================================== */}

      <Modal

        visible={logoutVisible}

        transparent={true}

        animationType="fade"

        onRequestClose={() =>
          setLogoutVisible(false)
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
                  setLogoutVisible(false)
                }

                activeOpacity={0.8}

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

                activeOpacity={0.8}

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

  );

}



// ======================================================
// ESTILOS
// ======================================================

const styles = StyleSheet.create({


  mainContainer: {
    flex: 1,
    backgroundColor: '#F6F8F7'
  },


  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%'
  },


  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20
  },



  // ======================================================
  // MODAL GENERAL
  // ======================================================

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30
  },


  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 10
  },


  modalHeader: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center'
  },


  headerSuccess: {
    backgroundColor: '#1F6F5C'
  },


  headerError: {
    backgroundColor: '#C62828'
  },


  modalHeaderIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold'
  },


  modalBody: {
    padding: 20,
    alignItems: 'center'
  },


  modalTitleText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 6
  },


  modalMessageText: {
    fontSize: 13,
    color: '#5F6B76',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 18
  },


  modalButton: {
    width: '100%',
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },


  btnSuccess: {
    backgroundColor: '#1F6F5C'
  },


  btnError: {
    backgroundColor: '#C62828'
  },


  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold'
  },



  // ======================================================
  // MODAL CIERRE DE SESIÓN
  // ======================================================

  logoutOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30
  },


  logoutModal: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,

    elevation: 10,

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: 4
    },

    shadowOpacity: 0.18,
    shadowRadius: 10
  },


  logoutModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#164C40',
    textAlign: 'center',
    marginBottom: 10
  },


  logoutModalText: {
    fontSize: 14,
    color: '#5F6B76',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22
  },


  logoutModalButtons: {
    flexDirection: 'row',
    gap: 10
  },


  cancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F6F5C',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },


  cancelButtonText: {
    color: '#1F6F5C',
    fontSize: 14,
    fontWeight: 'bold'
  },


  confirmLogoutButton: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#C62828',
    alignItems: 'center',
    justifyContent: 'center'
  },


  confirmLogoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold'
  }

});