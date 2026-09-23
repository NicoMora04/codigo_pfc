import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import {
  useSafeAreaInsets
} from 'react-native-safe-area-context';


export default function OrganizacionBottomNav({
  opcionActiva,
  onInicio,
  onMisOportunidades,
  onMiOrganizacion,
}) {

  const insets =
    useSafeAreaInsets();


  return (

    <View
      style={[
        styles.container,
        {
          paddingBottom:
            Math.max(
              insets.bottom,
              8
            ),
        },
      ]}
    >


      <TouchableOpacity
        style={styles.item}
        onPress={
          onInicio
        }
      >

        <Text
          style={[
            styles.icon,

            opcionActiva ===
              'INICIO' &&
              styles.activeText
          ]}
        >
          🏠
        </Text>


        <Text
          style={[
            styles.label,

            opcionActiva ===
              'INICIO' &&
              styles.activeText
          ]}
        >
          Inicio
        </Text>

      </TouchableOpacity>


      <TouchableOpacity
        style={styles.item}
        onPress={
          onMisOportunidades
        }
      >

        <Text
          style={[
            styles.icon,

            opcionActiva ===
              'OPORTUNIDADES' &&
              styles.activeText
          ]}
        >
          📋
        </Text>


        <Text
          style={[
            styles.label,

            opcionActiva ===
              'OPORTUNIDADES' &&
              styles.activeText
          ]}
        >
          Mis oportunidades
        </Text>

      </TouchableOpacity>


      <TouchableOpacity
        style={styles.item}
        onPress={
          onMiOrganizacion
        }
      >

        <Text
          style={[
            styles.icon,

            opcionActiva ===
              'ORGANIZACION' &&
              styles.activeText
          ]}
        >
          🏢
        </Text>


        <Text
          style={[
            styles.label,

            opcionActiva ===
              'ORGANIZACION' &&
              styles.activeText
          ]}
        >
          Mi organización
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