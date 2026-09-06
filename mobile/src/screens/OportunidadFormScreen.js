import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker'
import axios from 'axios';
import {obtenerToken} from '../services/authStorage';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView
} from 'react-native';
import ConfirmModal from '../components/ConfirmModal';

export default function OportunidadFormScreen({tiposActividad,
  onVolver,onGuardado,showAlert,oportunidadEditando,loading
}) {
    const [titulo, setTitulo] = React.useState('');
    const [descripcion, setDescripcion] = React.useState('');
    const [requisitos, setRequisitos] = React.useState('');
    const [cupo, setCupo] = React.useState('');
    const [idTipoActividad,setIdTipoActividad] = React.useState(null);
    const [urgencia, setUrgencia] = React.useState('');
    const [fechaInicio, setFechaInicio] = React.useState(null);
    const [fechaFin, setFechaFin] = React.useState(null);
    const [mostrarFechaInicio, setMostrarFechaInicio] =React.useState(false);
    const [mostrarHoraInicio, setMostrarHoraInicio] =React.useState(false);
    const [mostrarFechaFin, setMostrarFechaFin] =React.useState(false);
    const [mostrarHoraFin, setMostrarHoraFin] =React.useState(false);
    const [tipoUbicacion, setTipoUbicacion] = React.useState('');
    const [radioKm, setRadioKm] = React.useState('');
    const [busquedaUbicacion, setBusquedaUbicacion] =React.useState('');const [resultadosUbicacion, setResultadosUbicacion] = React.useState([]);
    const [ubicacionSeleccionada, setUbicacionSeleccionada] = React.useState(null);
    const [buscandoUbicacion, setBuscandoUbicacion] = React.useState(false);
    const [confirmacionPublicar, setConfirmacionPublicar] = React.useState(false);
    const buscarUbicacion = async (texto) => {
    const busqueda = texto.trim();

    if (busqueda.length < 3) {
        setResultadosUbicacion([]);
        return;
    }

    try {
        setBuscandoUbicacion(true);

        const token = await obtenerToken();

        const response = await axios.get(
        'http://192.168.0.93:3000/api/ubicaciones/buscar',
        {
            params: {
            q: busqueda,
            },
            headers: {
            Authorization: `Bearer ${token}`,
            },
        }
        );

        setResultadosUbicacion(
        response.data.resultados
        );

    } catch (error) {
        console.log(
        'Error buscando ubicación:',
        error.response?.data || error.message
        );

        setResultadosUbicacion([]);
    } finally {
        setBuscandoUbicacion(false);
    }
    };

    const obtenerIdUbicacion = async () => {

    if (!ubicacionSeleccionada) {
        return null;
    }

    try {
        const token = await obtenerToken();

        const response = await axios.post(
        'http://192.168.0.93:3000/api/ubicaciones',
        {
            latitud: ubicacionSeleccionada.latitud,
            longitud: ubicacionSeleccionada.longitud,
            localidad: ubicacionSeleccionada.localidad,
            provincia: ubicacionSeleccionada.provincia,
            esAproximada: false,
            direccion: ubicacionSeleccionada.nombre,
        },
        {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        }
        );

        return response.data.ubicacion.id_ubicacion;

    } catch (error) {

        console.log(
        'Error registrando ubicación:',
        error.response?.data || error.message
        );

        throw error;
    }
    };

    const validarFormulario = (paraPublicar = false) => {

    if (!titulo.trim()) {
        showAlert(
        'error',
        'Campo incompleto',
        'Ingresá un título para la oportunidad.'
        );
        return false;
    }

    if (titulo.trim().length > 150) {
    showAlert(
        'error',
        'Campo inválido',
        'El título no puede superar los 150 caracteres.'
    );
    return false;
    }

    if (!descripcion.trim()) {
        showAlert(
        'error',
        'Campo incompleto',
        'Ingresá una descripción.'
        );
        return false;
    }

    if (!idTipoActividad) {
        showAlert(
        'error',
        'Campo incompleto',
        'Seleccioná un tipo de actividad.'
        );
        return false;
    }

    const cupoNumerico = Number(cupo);

    if ( !cupo || !Number.isInteger(cupoNumerico) || cupoNumerico <= 0 ) {
    showAlert(
        'error',
        'Campo inválido',
        'Ingresá un cupo entero mayor a 0.'
    );
    return false;
    }

    if (!fechaInicio) {
        showAlert(
        'error',
        'Campo incompleto',
        'Seleccioná la fecha de inicio.'
        );
        return false;
    }

    if (!fechaFin) {
        showAlert(
        'error',
        'Campo incompleto',
        'Seleccioná la fecha de fin.'
        );
        return false;
    }

    if (fechaFin <= fechaInicio) {
        showAlert(
        'error',
        'Fechas inválidas',
        'La fecha de fin debe ser posterior a la fecha de inicio.'
        );
        return false;
    }

    if (!urgencia) {
        showAlert(
        'error',
        'Campo incompleto',
        'Seleccioná el nivel de urgencia.'
        );
        return false;
    }

    if (paraPublicar) {

        if (!tipoUbicacion) {
        showAlert(
            'error',
            'Campo incompleto',
            'Seleccioná el tipo de ubicación.'
        );
        return false;
        }

        if (!ubicacionSeleccionada) {
        showAlert(
            'error',
            'Campo incompleto',
            'Seleccioná una ubicación.'
        );
        return false;
        }
    }

    const radioNumerico = Number(radioKm);

        if ( tipoUbicacion === 'RADIO' && (
            !radioKm ||
            !Number.isFinite(radioNumerico) ||
            radioNumerico <= 0 ||
            radioNumerico > 999.99
        )
        ) {
        showAlert(
            'error',
            'Campo inválido',
            'Ingresá un radio mayor a 0 y menor o igual a 999,99 km.'
        );
        return false;
        }
    

    return true;
    };
    const guardarBorrador = async () => {
        if (!validarFormulario(false)) {
            return;
        }

    try {
        const token = await obtenerToken();

        const idUbicacion =
        await obtenerIdUbicacion();

        await axios.post(
        'http://192.168.0.93:3000/api/oportunidades',
        {
            idTipoActividad: idTipoActividad,
            idUbicacion: idUbicacion,
            titulo: titulo,
            descripcion: descripcion,
            requisitos: requisitos || null,
            cupoTotal: Number(cupo),
            fechaInicio: fechaInicio
            ? fechaInicio.toISOString()
            : null,
            fechaFin: fechaFin
            ? fechaFin.toISOString()
            : null,
            urgencia: urgencia,
            tipoUbicacion: tipoUbicacion || null,
            radioKm:
            tipoUbicacion === 'RADIO'
                ? Number(radioKm)
                : null,
        },
        {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        }
        );

        showAlert(
        'success',
        'Borrador guardado',
        'La oportunidad se guardó correctamente como borrador.'
        );

    await onGuardado();

    } catch (error) {

        console.log(
            'Error guardando borrador:',
            error.response?.data || error.message
        );

        showAlert(
            'error',
            'Error',
            error.response?.data?.error ||
            'No se pudo guardar el borrador.'
        );
    }
    };

    const publicarOportunidad = async () => {
        if (!validarFormulario(true)) {
        return;
        }

    try {
        const token = await obtenerToken();

        // 1. Registrar o reutilizar la ubicación
        const idUbicacion =
        await obtenerIdUbicacion();

        // 2. Crear la oportunidad como BORRADOR
        const responseCreacion = await axios.post(
        'http://192.168.0.93:3000/api/oportunidades',
        {
            idTipoActividad: idTipoActividad,
            idUbicacion: idUbicacion,
            titulo: titulo,
            descripcion: descripcion,
            requisitos: requisitos || null,
            cupoTotal: Number(cupo),
            fechaInicio: fechaInicio
            ? fechaInicio.toISOString()
            : null,
            fechaFin: fechaFin
            ? fechaFin.toISOString()
            : null,
            urgencia: urgencia,
            tipoUbicacion: tipoUbicacion || null,
            radioKm:
            tipoUbicacion === 'RADIO'
                ? Number(radioKm)
                : null,
        },
        {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        }
        );

        const idOportunidad =
        responseCreacion.data.oportunidad.id_oportunidad;

        // 3. Cambiar oficialmente BORRADOR → PUBLICADA
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

        await onGuardado();

    } catch (error) {

        console.log(
        'Error publicando oportunidad:',
        error.response?.data || error.message
        );

        showAlert(
        'error',
        'Error',
        error.response?.data?.error ||
            'No se pudo publicar la oportunidad.'
        );
    }
    };

    const guardarCambios = async () => {

        if (!validarFormulario(false)) {
            return;
        }

        try {
            const token = await obtenerToken();

            const idUbicacion =
            await obtenerIdUbicacion();

            await axios.put(
            `http://192.168.0.93:3000/api/oportunidades/${oportunidadEditando.id_oportunidad}`,
            {
                idTipoActividad,
                idUbicacion,
                titulo,
                descripcion,
                requisitos: requisitos || null,
                cupoTotal: Number(cupo),

                fechaInicio: fechaInicio
                ? fechaInicio.toISOString()
                : null,

                fechaFin: fechaFin
                ? fechaFin.toISOString()
                : null,

                urgencia,

                tipoUbicacion:
                tipoUbicacion || null,

                radioKm:
                tipoUbicacion === 'RADIO'
                    ? Number(radioKm)
                    : null,
            },
            {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            }
            );

            showAlert(
            'success',
            'Cambios guardados',
            'La oportunidad se modificó correctamente.'
            );

            await onGuardado();

        } catch (error) {

            console.log(
            'Error modificando oportunidad:',
            error.response?.data || error.message
            );

            showAlert(
            'error',
            'Error',
            error.response?.data?.error ||
                'No se pudo modificar la oportunidad.'
            );
        }
        };

    React.useEffect(() => {

        if (busquedaUbicacion.trim().length < 3) {
            setResultadosUbicacion([]);
            return;
        }

        if (ubicacionSeleccionada) {
            return;
        }

        const temporizador = setTimeout(() => {
            buscarUbicacion(busquedaUbicacion);
        }, 600);

        return () => {
            clearTimeout(temporizador);
        };

        }, [busquedaUbicacion, ubicacionSeleccionada]);

    React.useEffect(() => {

        if (!oportunidadEditando) {
            return;
        }

        setTitulo(
            oportunidadEditando.titulo || ''
        );

        setDescripcion(
            oportunidadEditando.descripcion || ''
        );

        setRequisitos(
            oportunidadEditando.requisitos || ''
        );

        setCupo(
            oportunidadEditando.cupo_total
            ? String(oportunidadEditando.cupo_total)
            : ''
        );

        setIdTipoActividad(
            oportunidadEditando.id_tipo_actividad
        );

        setUrgencia(
            oportunidadEditando.urgencia || ''
        );

        setFechaInicio(
            oportunidadEditando.fecha_inicio
            ? new Date(oportunidadEditando.fecha_inicio)
            : null
        );

        setFechaFin(
            oportunidadEditando.fecha_fin
            ? new Date(oportunidadEditando.fecha_fin)
            : null
        );

        setTipoUbicacion(
            oportunidadEditando.tipo_ubicacion || ''
        );

        setRadioKm(
            oportunidadEditando.radio_km
            ? String(oportunidadEditando.radio_km)
            : ''
        );

        if (oportunidadEditando.id_ubicacion) {
            const ubicacion = {
                idUbicacion: oportunidadEditando.id_ubicacion,

                nombre:
                oportunidadEditando.direccion ||
                oportunidadEditando.localidad ||
                'Ubicación seleccionada',

                detalle: [
                oportunidadEditando.localidad,
                oportunidadEditando.provincia
                ]
                .filter(Boolean)
                .join(', '),

                latitud:
                Number(oportunidadEditando.latitud),

                longitud:
                Number(oportunidadEditando.longitud),

                localidad:
                oportunidadEditando.localidad,

                provincia:
                oportunidadEditando.provincia,

                esAproximada:
                oportunidadEditando.es_aproximada
            };

            setUbicacionSeleccionada(ubicacion);

            setBusquedaUbicacion(
                oportunidadEditando.direccion||
                [
                oportunidadEditando.localidad,
                oportunidadEditando.provincia
                ]
                .filter(Boolean)
                .join(', ')
            );
            }

    }, [oportunidadEditando]);
 
  return (

    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
    <View style={styles.formContainer}>   
        <View style={styles.titleContainer}>
        <Text style={styles.title}>
        {oportunidadEditando
            ? 'Editar oportunidad'
            : 'Nueva Oportunidad'}
        </Text>


        <Text style={styles.subtitle}>
        {oportunidadEditando
            ? 'Modificá los datos del borrador'
            : 'Completá los datos de la actividad'}
        </Text>
    </View>

        <Text style={styles.label}>
        Título *
        </Text>
        

        <TextInput
        style={styles.input}
        placeholder="Ej. Colecta de alimentos"
        value={titulo}
        onChangeText={setTitulo}
        />

        <Text style={styles.label}>
        Descripción *
        </Text>

        <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describí la actividad"
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
        />


        <Text style={styles.label}>
        Tipo de actividad *
        </Text>

        <View style={styles.typeContainer}>
        {tiposActividad.map((tipo) => (
            <TouchableOpacity
            key={tipo.id_tipo_actividad}
            style={[
                styles.typeButton,
                idTipoActividad ===
                tipo.id_tipo_actividad &&
                styles.typeButtonActive
            ]}
            onPress={() =>
                setIdTipoActividad(
                tipo.id_tipo_actividad
                )
            }
            >
            <Text
                style={[
                styles.typeButtonText,
                idTipoActividad ===
                    tipo.id_tipo_actividad &&
                    styles.typeButtonTextActive
                ]}
            >
                {tipo.nombre}
            </Text>
            </TouchableOpacity>
        ))}
        </View>

        <Text style={styles.label}>
        Urgencia *
        </Text>

        <View style={styles.urgencyContainer}>
        {['BAJA', 'MEDIA', 'ALTA'].map((nivel) => (
            <TouchableOpacity
            key={nivel}
            style={[
                styles.urgencyButton,
                urgencia === nivel &&
                styles.urgencyButtonActive
            ]}
            onPress={() => setUrgencia(nivel)}
            >
            <Text
                style={[
                styles.urgencyText,
                urgencia === nivel &&
                    styles.urgencyTextActive
                ]}
            >
                {nivel.charAt(0) +
                nivel.slice(1).toLowerCase()}
            </Text>
            </TouchableOpacity>
        ))}
        </View>

       
        <Text style={styles.label}>
        Requisitos
        </Text>

        <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Ej. Ser mayor de 18 años"
        value={requisitos}
        onChangeText={setRequisitos}
        multiline
        />

        <Text style={styles.label}>
        Cupo *
        </Text>

        <TextInput
        style={styles.input}
        placeholder="Ej. 20"
        value={cupo}
        onChangeText={setCupo}
        keyboardType="numeric"
        />

    <Text style={styles.label}>
    Fecha de inicio *
    </Text>

    <TouchableOpacity
    style={styles.input}
    onPress={() => setMostrarFechaInicio(true)}
    >
    <Text
        style={{
        color: fechaInicio ? '#1F2937' : '#777777'
        }}
    >
        {fechaInicio
        ? fechaInicio.toLocaleString('es-AR')
        : 'Seleccionar fecha y hora'}
    </Text>
    </TouchableOpacity>

    {mostrarFechaInicio && (
    <DateTimePicker
        value={fechaInicio || new Date()}
        mode="date"
        onChange={(event, dateSeleccionada) => {
        setMostrarFechaInicio(false);

        if (
            event.type === 'dismissed' ||
            !dateSeleccionada
        ) {
            return;
        }

        setFechaInicio(dateSeleccionada);
        setMostrarHoraInicio(true);
        }}
    />
    )}

    {mostrarHoraInicio && (
    <DateTimePicker
        value={fechaInicio || new Date()}
        mode="time"
        is24Hour={true}
        onChange={(event, horaSeleccionada) => {
        setMostrarHoraInicio(false);

        if (
            event.type === 'dismissed' ||
            !horaSeleccionada
        ) {
            return;
        }

        setFechaInicio((fechaActual) => {
            const nuevaFecha =
            new Date(fechaActual || new Date());

            nuevaFecha.setHours(
            horaSeleccionada.getHours()
            );

            nuevaFecha.setMinutes(
            horaSeleccionada.getMinutes()
            );

            nuevaFecha.setSeconds(0);
            nuevaFecha.setMilliseconds(0);

            return nuevaFecha;
        });
        }}
        />
    )}

    <Text style={styles.label}>
    Fecha de fin *
    </Text>

    <TouchableOpacity
    style={styles.input}
    onPress={() => setMostrarFechaFin(true)}
    >
    <Text
        style={{
        color: fechaFin ? '#1F2937' : '#777777',
        }}
    >
        {fechaFin
        ? fechaFin.toLocaleString('es-AR')
        : 'Seleccionar fecha y hora'}
    </Text>
    </TouchableOpacity>

    {mostrarFechaFin && (
    <DateTimePicker
        value={fechaFin || new Date()}
        mode="date"
        onChange={(event, dateSeleccionada) => {
        setMostrarFechaFin(false);

        if (
            event.type === 'dismissed' ||
            !dateSeleccionada
        ) {
            return;
        }

        setFechaFin(dateSeleccionada);
        setMostrarHoraFin(true);
        }}
    />
    )}

    {mostrarHoraFin && (
    <DateTimePicker
        value={fechaFin || new Date()}
        mode="time"
        is24Hour={true}
        onChange={(event, horaSeleccionada) => {
        setMostrarHoraFin(false);

        if (
            event.type === 'dismissed' ||
            !horaSeleccionada
        ) {
            return;
        }

        setFechaFin((fechaActual) => {
            const nuevaFecha =
            new Date(fechaActual || new Date());

            nuevaFecha.setHours(
            horaSeleccionada.getHours()
            );

            nuevaFecha.setMinutes(
            horaSeleccionada.getMinutes()
            );

            nuevaFecha.setSeconds(0);
            nuevaFecha.setMilliseconds(0);

            return nuevaFecha;
        });
        }}
    />
    )}

    <Text style={styles.label}>
    Tipo de ubicación *
    </Text>

    <View style={styles.locationTypeContainer}>
    {[
        ['EXACTA', 'Ubicación exacta'],
        ['RADIO', 'Por radio'],
    ].map(([valor, etiqueta]) => (
        <TouchableOpacity
        key={valor}
        style={[
            styles.locationTypeButton,
            tipoUbicacion === valor &&
            styles.locationTypeButtonActive
        ]}
        onPress={() => {
            setTipoUbicacion(valor);

            if (valor === 'EXACTA') {
            setRadioKm('');
            }
        }}
        >
        <Text
            style={[
            styles.locationTypeText,
            tipoUbicacion === valor &&
                styles.locationTypeTextActive
            ]}
        >
            {etiqueta}
        </Text>
        </TouchableOpacity>
    ))}
    </View>

    {tipoUbicacion === 'RADIO' && (
    <>
        <Text style={styles.label}>
        Radio de cobertura (km) *
        </Text>

        <TextInput
        style={styles.input}
        placeholder="Ej. 5"
        value={radioKm}
        onChangeText={setRadioKm}
        keyboardType="decimal-pad"
        />
    </>
    )}


    <Text style={styles.label}>
    Ubicación *
    </Text>

    <View style={styles.locationSearchContainer}>
    <TextInput
        style={styles.input}
        placeholder="Buscar dirección o lugar..."
        value={busquedaUbicacion}
        onChangeText={(texto) => {
        setBusquedaUbicacion(texto);
        setUbicacionSeleccionada(null);
        }}
    />

    </View>

    {buscandoUbicacion && (
    <Text style={styles.searchingText}>
        Buscando...
    </Text>
    )}

    {resultadosUbicacion.map((resultado) => (
    <TouchableOpacity
        key={resultado.placeId}
        style={styles.locationResult}
        onPress={() => {
        setUbicacionSeleccionada(resultado);
        setBusquedaUbicacion(resultado.nombre);
        setResultadosUbicacion([]);
        }}
    >
    <View>
        <Text style={styles.locationResultText}>
            {resultado.nombre}
        </Text>

        <Text style={styles.locationResultDetail}>
            {resultado.detalle}
        </Text>
    </View>
    </TouchableOpacity>
    ))}

    {ubicacionSeleccionada && (
    <View style={styles.selectedLocation}>
        <Text style={styles.selectedLocationTitle}>
        Ubicación seleccionada
        </Text>

        <Text style={styles.selectedLocationText}>
        {ubicacionSeleccionada.nombre}
        </Text>

        <Text style={styles.locationResultDetail}>
        {ubicacionSeleccionada.detalle}
        </Text>
    </View>
    )}

    {!oportunidadEditando && (
    <TouchableOpacity
        style={styles.publishButton}
        onPress={() => { if (!validarFormulario(true)) {
            return;
             }

            setConfirmacionPublicar(true);
        }}
    >
        <Text style={styles.publishButtonText}>
        Publicar oportunidad
        </Text>
    </TouchableOpacity>
    )}
        
    {oportunidadEditando ? (
        <TouchableOpacity
            style={styles.saveButton}
            onPress={guardarCambios}
        >
            <Text style={styles.saveButtonText}>
            Guardar cambios
            </Text>
        </TouchableOpacity>
        ) : (
        <TouchableOpacity
            style={styles.saveButton}
            onPress={guardarBorrador}
        >
            <Text style={styles.saveButtonText}>
            Guardar borrador
            </Text>
        </TouchableOpacity>
        )}
      <TouchableOpacity
        style={styles.backButton}
        onPress={onVolver}
      >
        <Text style={styles.backButtonText}>
          Volver
        </Text>
      </TouchableOpacity>

        <ConfirmModal
        visible={confirmacionPublicar}
        title="Publicar oportunidad"
        message="La oportunidad quedará visible para los voluntarios y ya no podrá modificarse. ¿Deseás continuar?"
        confirmText="Publicar"
        cancelText="Volver"
        destructive={false}
        onCancel={() => setConfirmacionPublicar(false)}
        onConfirm={() => {
            setConfirmacionPublicar(false);
            publicarOportunidad();
        }}
        loading={loading}
        />
        
      </View>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },

  formContainer: {
    backgroundColor: '#F5F7F8',
    borderRadius: 24,
    padding: 18,
  },

  titleContainer: {
  backgroundColor:  '#1F6F5C',
  borderRadius: 14,
  paddingVertical: 14,
  paddingHorizontal: 16,
  marginBottom: 20,
},

    title: {
  fontSize: 24,
  fontWeight: '700',
  color: '#FFFFFF',
},

    subtitle: {
  fontSize: 12,
  marginTop: 6,
  textAlign: 'center',
  color: '#FFFFFF',
},

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DEE3',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
  },

  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

  backButton: {
    backgroundColor: '#1F6F5C',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },

  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

    typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent:'space-between',
    rowgap: 10,
    marginTop: 4,
    },

    
    typeButton: {
    width: '48%',
    minHeight: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7DEDA',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    },

    typeButtonActive: {
    backgroundColor: '#1F6F5C',
    borderColor: '#1F6F5C',
    },

    typeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5F6B76',
    textAlign:'center',
    },

    typeButtonTextActive: {
    color: '#FFFFFF',
    },

    urgencyContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    },

    urgencyButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7DEDA',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    },

    urgencyButtonActive: {
    backgroundColor: '#1F6F5C',
    borderColor: '#1F6F5C',
    },

    urgencyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5F6B76',
    },

    urgencyTextActive: {
    color: '#FFFFFF',
    },

    locationTypeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    },

    locationTypeButton: {
    flex: 1,
    minHeight: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7DEDA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    },

    locationTypeButtonActive: {
    backgroundColor: '#1F6F5C',
    borderColor: '#1F6F5C',
    },

    locationTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5F6B76',
    textAlign: 'center',
    },

    locationTypeTextActive: {
    color: '#FFFFFF',
    },

    searchingText: {
    marginTop: 8,
    color: '#5F6B76',
    },

    locationResult: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DEE3',
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
    },

    locationResultText: {
    fontSize: 12,
    color: '#374151',
    },

    selectedLocation: {
    backgroundColor: '#E8F3EF',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    },

    selectedLocationTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F6F5C',
    marginBottom: 4,
    },

    selectedLocationText: {
    fontSize: 12,
    color: '#374151',
    },

    locationResultDetail: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 3,
    },
    saveButton: {
    backgroundColor: '#1F6F5C',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
    },

    saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    },
    publishButton: {
    backgroundColor: '#1F6F5C',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
    },

    publishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    },
});