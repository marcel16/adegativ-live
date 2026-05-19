import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import api from '../services/api';

export default function PairingScreen({ navigation, route }: any) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'input' | 'pairing' | 'success'>('input');
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (route.params?.code) {
      setCode(route.params.code);
      pairDevice(route.params.code);
    }
  }, [route.params?.code]);

  const pairDevice = async (pairCode: string) => {
    setLoading(true);
    setStatus('pairing');
    try {
      const { data } = await api.post('/player/pair', { code: pairCode, deviceName: 'Mobile App', deviceType: 'mobile' });
      if (data.success) {
        setStatus('success');
        setTimeout(() => navigation.navigate('Player', { pairingId: data.pairingId }), 1000);
      } else {
        Alert.alert('Erro', 'Código inválido ou expirado');
        setStatus('input');
      }
    } catch (err: any) {
      Alert.alert('Erro', err.response?.data?.message || 'Erro ao parear');
      setStatus('input');
    }
    setLoading(false);
  };

  const handleDigit = (text: string, index: number) => {
    const digits = code.split('');
    digits[index] = text.replace(/[^0-9]/g, '').slice(-1);
    const newCode = digits.join('');
    setCode(newCode);
    if (text && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleSubmit = () => {
    if (code.length !== 6) { Alert.alert('Erro', 'Digite o código de 6 dígitos'); return; }
    pairDevice(code);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>📺</Text>
        <Text style={styles.title}>Vincular TV</Text>
        <Text style={styles.subtitle}>Digite o código exibido na TV</Text>
        <View style={styles.codeRow}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <TextInput
              key={i}
              ref={(ref) => { inputRefs.current[i] = ref; }}
              style={[styles.codeInput, code[i] ? styles.codeFilled : null]}
              value={code[i] || ''}
              onChangeText={(t) => handleDigit(t, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>
        {status === 'pairing' && <ActivityIndicator size="large" color="#22c55e" style={{ marginTop: 24 }} />}
        {status === 'success' && <Text style={styles.success}>Pareado com sucesso!</Text>}
        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.buttonText}>Vincular</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center' },
  content: { padding: 32, alignItems: 'center' },
  icon: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#94a3b8', marginBottom: 32 },
  codeRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  codeInput: { width: 48, height: 64, backgroundColor: '#1e293b', borderRadius: 12, borderWidth: 2, borderColor: '#334155', color: '#fff', fontSize: 28, fontWeight: '700', textAlign: 'center' },
  codeFilled: { borderColor: '#22c55e', backgroundColor: '#1a3a2a' },
  button: { backgroundColor: '#16a34a', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 48, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  success: { color: '#22c55e', fontSize: 18, fontWeight: '600', marginTop: 24 },
});
