import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { register } from '../services/auth';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) { Alert.alert('Erro', 'Preencha todos os campos'); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      navigation.replace('Home');
    } catch (err: any) {
      Alert.alert('Erro', err.response?.data?.message || 'Erro ao cadastrar');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Criar Conta</Text>
        <TextInput style={styles.input} placeholder="Nome" placeholderTextColor="#64748b" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#64748b" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#64748b" value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Criar Conta</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Já tem conta? Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center' },
  content: { padding: 32, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 32 },
  input: { width: '100%', backgroundColor: '#1e293b', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, marginBottom: 12 },
  button: { width: '100%', backgroundColor: '#16a34a', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#22c55e', marginTop: 16, fontSize: 14 },
});
