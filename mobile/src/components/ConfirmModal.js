import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Volver',
  onConfirm,
  onCancel,
  destructive = false,
  loading=false,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>

          <Text style={styles.title}>
            {title}
          </Text>

          <Text style={styles.message}>
            {message}
          </Text>

          <View style={styles.actions}>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                destructive && styles.destructiveButton, loading && styles.disabledButton,
              ]}
              onPress={onConfirm}
              disabled={loading}
            >
              <Text style={styles.confirmButtonText}>
                {loading ? 'Procesando...' : confirmText}
              </Text>
            </TouchableOpacity>

          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
  },

  title: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
  },

  message: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 21,
    marginBottom: 22,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },

  cancelButton: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },

  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },

  confirmButton: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#1F6F5C',
  },

  destructiveButton: {
    backgroundColor: '#B91C1C',
  },

  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disabledButton: {
  opacity: 0.6,
  },

});