import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, StyleSheet, ScrollView, Alert } from 'react-native';
import api from '../services/api';
import { logout } from '../services/auth';

export default function SettingsScreen({ navigation }: any) {
  const [serverUrl, setServerUrl] = useState('http://localhost:8080');
  const [notifications, setNotifications] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const handleSave = () => {
    Alert.alert('Sucesso', 'Configurações salvas');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Servidor</Text>
        <TextInput style={styles.input} value={serverUrl} onChangeText={setServerUrl} placeholder="URL do servidor" placeholderTextColor="#64748b" autoCapitalize="none" />
        <Text style={styles.sectionTitle}>Notificações</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Receber notificações</Text>
          <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: '#334155', true: '#166534' }} thumbColor={notifications ? '#22c55e' : '#64748b'} />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Salvar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24, backgroundColor: '#1e293b' },
  title: { fontSize: 24, fontWeight: '700', color: '#fff' },
  content: { padding: 24 },
  sectionTitle: { color: '#94a3b8', fontSize: 14, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8, marginTop: 24 },
  input: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, marginBottom: 8 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 8 },
  switchLabel: { color: '#fff', fontSize: 16 },
  button: { backgroundColor: '#16a34a', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  logoutButton: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: '#ef4444' },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
});
