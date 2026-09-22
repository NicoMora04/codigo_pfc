import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';


export default function VoluntarioBottomNav({
  opcionActiva,
  onInicio,
  onBuscar,
  onMisInscripciones,
}) {

const insets = useSafeAreaInsets();



  return (

    <View
        style={[
            styles.container,
            {
            paddingBottom: Math.max(insets.bottom, 8),
            },
        ]}
        >

      <TouchableOpacity
        style={styles.item}
        onPress={onInicio}
      >

        <Text
          style={[
            styles.icon,
            opcionActiva === 'INICIO' &&
              styles.activeText
          ]}
        >
          🗺️
        </Text>

        <Text
          style={[
            styles.label,
            opcionActiva === 'INICIO' &&
              styles.activeText
          ]}
        >
          Inicio
        </Text>

      </TouchableOpacity>


      <TouchableOpacity
        style={styles.item}
        onPress={onBuscar}
      >

        <Text
          style={[
            styles.icon,
            opcionActiva === 'BUSCAR' &&
              styles.activeText
          ]}
        >
          🔍
        </Text>

        <Text
          style={[
            styles.label,
            opcionActiva === 'BUSCAR' &&
              styles.activeText
          ]}
        >
          Buscar
        </Text>

      </TouchableOpacity>


      <TouchableOpacity
        style={styles.item}
        onPress={onMisInscripciones}
      >

        <Text
          style={[
            styles.icon,
            opcionActiva === 'INSCRIPCIONES' &&
              styles.activeText
          ]}
        >
          📋
        </Text>

        <Text
          style={[
            styles.label,
            opcionActiva === 'INSCRIPCIONES' &&
              styles.activeText
          ]}
        >
          Mis inscripciones
        </Text>

      </TouchableOpacity>

    </View>


  );

}


const styles =
  StyleSheet.create({

    container: {
      flexDirection: 'row',

      backgroundColor: '#FFFFFF',

      borderTopWidth: 1,
      borderTopColor: '#DDE5E2',

      paddingTop: 8,

      elevation: 12,

      shadowColor: '#000000',

      shadowOffset: {
        width: 0,
        height: -2,
      },

      shadowOpacity: 0.08,

      shadowRadius: 5,
    },


    item: {
      flex: 1,

      alignItems: 'center',
      justifyContent: 'center',

      paddingHorizontal: 4,
    },


    icon: {
      fontSize: 20,

      opacity: 0.55,
    },


    label: {
      fontSize: 11,

      color: '#5F6B76',

      marginTop: 3,

      textAlign: 'center',
    },


    activeText: {
      color: '#1F6F5C',

      fontWeight: '700',

      opacity: 1,
    },

  });