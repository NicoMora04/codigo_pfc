import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import ConfirmModal from '../components/ConfirmModal';

export default function MisOportunidadesScreen({
  oportunidades,
  loading,
  onNuevaOportunidad,
  onEditar,
  onPublicar,
  onCancelar,
  onCerrar,
  onFinalizar,
  onLogout
}) {
  const [filtroEstado, setFiltroEstado] = React.useState('TODAS');
  const [busqueda, setBusqueda] = React.useState('');
  const [confirmacion, setConfirmacion] = React.useState(null);
  
  
  const cerrarConfirmacion = () => {setConfirmacion(null);} ;

  const confirmarAccion = () => {if (!confirmacion) 
    {return;
  }
  const accion = confirmacion.onConfirm;

  setConfirmacion(null);

  accion();
  };
  
  const oportunidadesFiltradas = oportunidades.filter((oportunidad) => {
  const coincideEstado =
    filtroEstado === 'TODAS' ||
    oportunidad.estado === filtroEstado;

  const coincideBusqueda =
    oportunidad.titulo
      .toLowerCase()
      .includes(busqueda.trim().toLowerCase());

  return coincideEstado && coincideBusqueda;
  });

  return (
    <View style={styles.container}>

    
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Mis oportunidades
          </Text>

          <Text style={styles.subtitle}>
            Gestioná las oportunidades de tu organización
          </Text>
        </View>

        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logoutText}>
            Cerrar sesión
          </Text>
        </TouchableOpacity>
      </View>


      <TouchableOpacity
        style={styles.btnPrimary}
        onPress={onNuevaOportunidad}
      >
        <Text style={styles.btnPrimaryText}>
          + Nueva oportunidad
        </Text>
      </TouchableOpacity>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por título..."
        value={busqueda}
        onChangeText={setBusqueda}
        autoFocus={false}
      />
      
      <View style={styles.filters}>

  {[
    ['TODAS', 'Todas'],
    ['BORRADOR', 'Borradores'],
    ['PUBLICADA', 'Publicadas'],
    ['CERRADA', 'Cerradas'],
    ['FINALIZADA', 'Finalizadas'],
    ['CANCELADA', 'Canceladas']
  ].map(([valor, etiqueta]) => (

    <TouchableOpacity
      key={valor}
      style={[
        styles.filterButton,
        filtroEstado === valor &&
          styles.filterButtonActive
      ]}
      onPress={() =>
        setFiltroEstado(valor)
      }
    >

        <Text
          style={[
            styles.filterText,
            filtroEstado === valor &&
              styles.filterTextActive
          ]}
        >
          {etiqueta}
        </Text>

      </TouchableOpacity>

    ))}

</View>

      {loading ? (

        <ActivityIndicator
          size="large"
          color="#1F6F5C"
          style={styles.loader}
        />

      ) : oportunidades.length === 0 ? (

        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            Todavía no hay oportunidades
          </Text>

          <Text style={styles.emptyText}>
            Creá tu primera oportunidad de voluntariado.
          </Text>
        </View>

      ) : (

        oportunidadesFiltradas.map((oportunidad) => (

          <View
            key={oportunidad.id_oportunidad}
            style={styles.card}
          >

            <Text style={styles.cardTitle}>
              {oportunidad.titulo}
            </Text>

            <Text style={styles.cardType}>
              {oportunidad.tipo_actividad}
            </Text>

            <Text style={styles.cardState}>
              Estado: {oportunidad.estado}
            </Text>

            <Text style={styles.cardInfo}>
              Cupo: {oportunidad.cupo_total}
            </Text>

            <Text style={styles.cardInfo}>
              Urgencia: {oportunidad.urgencia}
            </Text>

            <Text style={styles.cardInfo}>
              Inicio: {
                new Date(
                  oportunidad.fecha_inicio
                ).toLocaleString('es-AR')
              }
            </Text>
            
            {oportunidad.estado === 'FINALIZADA' && (
            <Text style={styles.cardInfo}>
              Fin Previsto: {
                new Date(
                  oportunidad.fecha_fin
                ).toLocaleString('es-AR')
              }
            </Text>
          )}

            {(oportunidad.direccion || oportunidad.localidad) && (
              <Text style={styles.cardInfo}>
                Ubicación:{' '}
                {oportunidad.direccion
                  ? `${oportunidad.direccion}, `
                  : ''}
                {oportunidad.localidad}
                {oportunidad.provincia
                  ? `, ${oportunidad.provincia}`
                  : ''}
              </Text>
            )}

            <View style={styles.actions}>

                {oportunidad.estado === 'BORRADOR' && (
                  <>
                    <TouchableOpacity
                      style={styles.btnSecondary}
                      onPress={() =>
                        onEditar(oportunidad.id_oportunidad)
                      }
                    >
                      <Text style={styles.btnSecondaryText}>
                        Editar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.btnPublish}
                      onPress={() => {
                        setConfirmacion({
                          title: 'Publicar oportunidad',
                          message:
                            'La oportunidad quedará visible para los voluntarios y ya no podrá modificarse. ¿Deseás continuar?',
                          confirmText: 'Publicar',
                          destructive: false,
                          onConfirm: () =>
                            onPublicar(oportunidad.id_oportunidad),
                        });
                      }}
                    >
                      <Text style={styles.btnActionText}>
                        Publicar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.btnCancel}
                     onPress={() => {
                        setConfirmacion({
                          title: 'Cancelar oportunidad',
                          message:
                            'La oportunidad quedará cancelada y dejará de estar disponible. ¿Deseás continuar?',
                          confirmText: 'Cancelar',
                          destructive: true,
                          onConfirm: () =>
                            onCancelar(oportunidad.id_oportunidad),
                        });
                      }}
                    >
                      <Text style={styles.btnActionText}>
                        Cancelar
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                {oportunidad.estado === 'PUBLICADA' && (
                  <>
                    <TouchableOpacity
                      style={styles.btnSecondary}
                      onPress={() => {
                        setConfirmacion({
                          title: 'Cerrar oportunidad',
                          message:
                            'La oportunidad dejará de aceptar nuevas inscripciones. ¿Deseás continuar?',
                          confirmText: 'Cerrar',
                          destructive: false,
                          onConfirm: () =>
                            onCerrar(oportunidad.id_oportunidad),
                        });
                      }}
                    >
                      <Text style={styles.btnSecondaryText}>
                        Cerrar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.btnCancel}
                      onPress={() => {
                        setConfirmacion({
                          title: 'Cancelar oportunidad',
                          message:
                            'La oportunidad quedará cancelada y dejará de estar disponible. ¿Deseás continuar?',
                          confirmText: 'Cancelar',
                          destructive: true,
                          onConfirm: () =>
                            onCancelar(oportunidad.id_oportunidad),
                        });
                      }}
                    >
                      <Text style={styles.btnActionText}>
                        Cancelar
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                {oportunidad.estado === 'CERRADA' && (
                  <TouchableOpacity
                    style={styles.btnPublish}
                    onPress={() => {
                        setConfirmacion({
                          title: 'Finalizar oportunidad',
                          message:
                            'La oportunidad quedará registrada como finalizada. ¿Deseás continuar?',
                          confirmText: 'Finalizar',
                          destructive: false,
                          onConfirm: () =>
                            onFinalizar(oportunidad.id_oportunidad),
                        });
                      }}
                  >
                    <Text style={styles.btnActionText}>
                      Finalizar
                    </Text>
                  </TouchableOpacity>
                )}

              </View>

          </View>

        ))

      )}

      <ConfirmModal
      visible={confirmacion !== null}
      title={confirmacion?.title}
      message={confirmacion?.message}
      confirmText={confirmacion?.confirmText}
      cancelText="Volver"
      destructive={confirmacion?.destructive}
      onCancel={cerrarConfirmacion}
      onConfirm={confirmarAccion}
      />

    </View>
  );
}


const styles = StyleSheet.create({

  container: {
    width: '100%',
    maxWidth: 500
  },

  header: {
    marginBottom: 20
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#164C40'
  },

  subtitle: {
    fontSize: 13,
    color: '#5F6B76',
    marginTop: 4
  },

  logoutText: {
    color: '#C62828',
    fontWeight: '600',
    marginTop: 10
  },

  btnPrimary: {
    height: 48,
    backgroundColor: '#1F6F5C',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18
  },

  btnPrimaryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15
  },

  loader: {
    marginTop: 30
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center'
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#164C40'
  },

  emptyText: {
    fontSize: 13,
    color: '#5F6B76',
    marginTop: 5
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6F2EF'
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#164C40'
  },

  cardType: {
    fontSize: 13,
    color: '#5F6B76',
    marginTop: 4
  },

  cardState: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8
  },

  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14
  },

  btnSecondary: {
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F6F5C',
    justifyContent: 'center'
  },

  btnSecondaryText: {
    color: '#1F6F5C',
    fontWeight: '600'
  },

  btnPublish: {
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#1F6F5C',
    justifyContent: 'center'
  },

  btnCancel: {
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#C62828',
    justifyContent: 'center'
  },

  btnActionText: {
    color: '#FFFFFF',
    fontWeight: '600'
  },

  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18
  },

  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7DEDA'
  },

  filterButtonActive: {
    backgroundColor: '#1F6F5C',
    borderColor: '#1F6F5C'
  },

  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5F6B76'
  },

  filterTextActive: {
    color: '#FFFFFF'
  },
  cardInfo: {
  fontSize: 12,
  color: '#5F6B76',
  marginTop: 5
  },
  searchInput: {
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#D9DEE3',
  borderRadius: 10,
  paddingHorizontal: 14,
  paddingVertical: 10,
  marginBottom: 12,
  fontSize: 14,
},

});