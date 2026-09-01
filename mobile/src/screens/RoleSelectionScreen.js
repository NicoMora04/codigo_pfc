import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function RoleSelectionScreen({ onSelectRole, onBack }) {
  return (
    <View style={styles.cardContainer}>
      {/* BLOQUE BLANCO INDEPENDIENTE PARA EL BOTÓN "VOLVER" */}
      <View style={styles.backCardContainer}>
        <TouchableOpacity style={styles.btnBack} onPress={onBack} activeOpacity={0.8}>
          <View style={styles.btnBackCircle}>
            <Text style={styles.btnBackArrow}>←</Text>
          </View>
          <Text style={styles.btnBackText}>Volver al inicio de sesión</Text>
        </TouchableOpacity>
      </View>

      {/* TARJETA BLANCA CONTENEDORA PARA LA SELECCIÓN DE ROL */}
      <View style={styles.formCard}>
        <Text style={styles.title}>Crear una cuenta</Text>
        <Text style={styles.subtitle}>Seleccioná cómo vas a participar</Text>

        {/* Option Voluntario */}
        <TouchableOpacity style={styles.roleCard} onPress={() => onSelectRole('A05')} activeOpacity={0.8}>
          <View style={styles.roleIconContainer}>
            <View style={styles.personBody}>
              <View style={styles.personHead} />
              <View style={styles.personTorso} />
              <View style={styles.personRaisedArm} />
            </View>
          </View>
          <View style={styles.roleTextContainer}>
            <Text style={styles.roleTitle}>Quiero ser voluntario</Text>
            <Text style={styles.roleDesc}>Buscá oportunidades, inscribite y colaborá con la comunidad.</Text>
          </View>
          <Text style={styles.roleChevron}>›</Text>
        </TouchableOpacity>

        {/* Option Organización */}
        <TouchableOpacity style={styles.roleCard} onPress={() => onSelectRole('A06')} activeOpacity={0.8}>
          <View style={styles.roleIconContainer}>
            <View style={styles.houseOutline}>
              <View style={styles.houseRoof} />
              <View style={styles.houseBase} />
            </View>
          </View>
          <View style={styles.roleTextContainer}>
            <Text style={styles.roleTitle}>Represento una organización</Text>
            <Text style={styles.roleDesc}>Publicá oportunidades y gestioná participantes y donaciones.</Text>
          </View>
          <Text style={styles.roleChevron}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: { width: '100%', maxWidth: 400, alignItems: 'center' },
  
  // Contenedor blanco para el botón atrás
  backCardContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#164C40',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#E6F2EF',
  },
  btnBack: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  btnBackCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#E6F2EF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  btnBackArrow: { color: '#1F6F5C', fontSize: 16, fontWeight: 'bold' },
  btnBackText: { color: '#1F6F5C', fontSize: 14, fontWeight: '700' },

  // Tarjeta contenedora
  formCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#164C40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#E6F2EF',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#164C40', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#5F6B76', marginBottom: 18, textAlign: 'center' },
  roleCard: { width: '100%', backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#D7DEDA' },
  roleIconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#E6F2EF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  roleTextContainer: { flex: 1 },
  roleTitle: { fontSize: 15, fontWeight: 'bold', color: '#164C40', marginBottom: 2 },
  roleDesc: { fontSize: 12, color: '#5F6B76', lineHeight: 16 },
  roleChevron: { fontSize: 22, color: '#1F6F5C', fontWeight: 'bold', marginLeft: 8 },
  personBody: { width: 20, height: 22, alignItems: 'center', justifyContent: 'flex-end', position: 'relative' },
  personHead: { width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, borderColor: '#164C40', position: 'absolute', top: 0 },
  personTorso: { width: 10, height: 10, borderTopLeftRadius: 4, borderTopRightRadius: 4, borderWidth: 1.5, borderColor: '#164C40', borderBottomWidth: 0, position: 'absolute', bottom: 0 },
  personRaisedArm: { position: 'absolute', right: -2, top: 6, width: 6, height: 1.5, backgroundColor: '#164C40', transform: [{ rotate: '-45deg' }] },
  houseOutline: { width: 20, height: 20, alignItems: 'center' },
  houseRoof: { width: 14, height: 14, borderWidth: 1.5, borderColor: '#164C40', borderBottomWidth: 0, borderRightWidth: 0, transform: [{ rotate: '45deg' }], marginTop: 2 },
  houseBase: { width: 14, height: 10, borderWidth: 1.5, borderColor: '#164C40', borderTopWidth: 0, marginTop: -4 }
});