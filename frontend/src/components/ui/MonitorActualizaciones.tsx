import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useUpdates } from 'expo-updates';
import * as Updates from 'expo-updates';

export const MonitorActualizaciones = () => {
  const {
    isUpdateAvailable,
    isDownloading,
    isUpdatePending,
  } = useUpdates();

  if (isDownloading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#0000ff" />
        <Text style={styles.text}>Descargando parche de actualización...</Text>
      </View>
    );
  }

  if (isUpdatePending) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Actualización lista en caché local.</Text>
        <TouchableOpacity onPress={() => Updates.reloadAsync()} style={styles.button}>
          <Text style={styles.buttonText}>Reiniciar Aplicación</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: '5%',
    width: '90%',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: { marginLeft: 10, flex: 1, fontSize: 14, color: '#333' },
  button: { backgroundColor: '#007bff', padding: 10, borderRadius: 5 },
  buttonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});
