import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import api from '../services/api';

export default function HomeScreen({ navigation }: any) {
  const handleStartPairing = () => navigation.navigate('Pairing');

  const handleManualCode = () => navigation.navigate('Pairing', { code: '' });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>AdegaTV Live</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Bem-vindo</Text>
        <Text style={styles.subtitle}>Vincule-se a uma TV para controlar o que está sendo exibido</Text>
        <TouchableOpacity style={styles.button} onPress={handleStartPairing}>
          <Text style={styles.buttonIcon}>📺</Text>
          <Text style={styles.buttonText}>Vincular Nova TV</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.scheduleButton} onPress={() => navigation.navigate('Schedule')}>
          <Text style={styles.buttonIcon}>📅</Text>
          <Text style={styles.buttonText}>Agenda de Mídias</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.buttonIcon}>⚙️</Text>
          <Text style={styles.buttonText}>Configurações</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24, backgroundColor: '#1e293b' },
  logo: { fontSize: 24, fontWeight: '800', color: '#22c55e', textAlign: 'center' },
  content: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 16, color: '#94a3b8', textAlign: 'center', marginBottom: 24 },
  button: { width: '100%', backgroundColor: '#16a34a', borderRadius: 16, padding: 24, flexDirection: 'row', alignItems: 'center', gap: 16 },
  scheduleButton: { width: '100%', backgroundColor: '#1e293b', borderRadius: 16, padding: 24, flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 1, borderColor: '#334155' },
  settingsButton: { width: '100%', backgroundColor: '#1e293b', borderRadius: 16, padding: 24, flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 1, borderColor: '#334155' },
  buttonIcon: { fontSize: 28 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
