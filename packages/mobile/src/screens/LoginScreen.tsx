import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { login } from '../services/auth';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Erro', 'Preencha email e senha'); return; }
    setLoading(true);
    try {
      await login(email, password);
      navigation.replace('Home');
    } catch (err: any) {
      Alert.alert('Erro', err.response?.data?.message || 'Erro ao fazer login');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        <Text style={styles.logo}>AdegaTV</Text>
        <Text style={styles.subtitle}>Live</Text>
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#64748b" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#64748b" value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Criar conta</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center' },
  content: { padding: 32, alignItems: 'center' },
  logo: { fontSize: 40, fontWeight: '800', color: '#22c55e' },
  subtitle: { fontSize: 18, color: '#94a3b8', marginBottom: 40 },
  input: { width: '100%', backgroundColor: '#1e293b', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, marginBottom: 12 },
  button: { width: '100%', backgroundColor: '#16a34a', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#22c55e', marginTop: 16, fontSize: 14 },
});
