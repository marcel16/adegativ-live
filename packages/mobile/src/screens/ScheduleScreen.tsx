import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../services/api';

interface ScheduleItem {
  id: string;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  status: string;
}

export default function ScheduleScreen({ navigation }: any) {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const { data } = await api.get('/schedule/current');
      setItems(data.items || []);
    } catch {}
    setLoading(false);
  };

  const renderItem = ({ item }: { item: ScheduleItem }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title || `Mídia #${item.id.slice(0, 8)}`}</Text>
      <Text style={styles.cardType}>{item.type === 'video' ? '🎬 Vídeo' : '🖼️ Imagem'}</Text>
      <Text style={styles.cardTime}>{item.startTime} - {item.endTime}</Text>
      <View style={[styles.badge, item.status === 'active' ? styles.activeBadge : styles.pendingBadge]}>
        <Text style={styles.badgeText}>{item.status === 'active' ? 'Exibindo' : 'Agendado'}</Text>
      </View>
    </View>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#22c55e" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Programação</Text>
      </View>
      <FlatList data={items} renderItem={renderItem} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>Nenhuma mídia agendada</Text>} />
      <TouchableOpacity style={styles.refresh} onPress={fetchSchedule}>
        <Text style={styles.refreshText}>Atualizar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24, backgroundColor: '#1e293b' },
  title: { fontSize: 24, fontWeight: '700', color: '#fff' },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#334155' },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardType: { color: '#94a3b8', fontSize: 14, marginBottom: 2 },
  cardTime: { color: '#64748b', fontSize: 12, marginBottom: 8 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  activeBadge: { backgroundColor: '#166534' },
  pendingBadge: { backgroundColor: '#1e3a5f' },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 48, fontSize: 16 },
  refresh: { position: 'absolute', bottom: 32, right: 24, backgroundColor: '#16a34a', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24 },
  refreshText: { color: '#fff', fontWeight: '600' },
});
