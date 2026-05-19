import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Video from 'react-native-video';
import api from '../services/api';

interface MediaItem {
  id: string;
  type: 'video' | 'image';
  url: string;
  duration: number;
  title?: string;
}

export default function PlayerScreen({ navigation, route }: any) {
  const { pairingId } = route.params || {};
  const [currentMedia, setCurrentMedia] = useState<MediaItem | null>(null);
  const [playing, setPlaying] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const videoRef = useRef<Video>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!pairingId) { navigation.goBack(); return; }
    connectWebSocket();
    fetchCurrentMedia();
    return () => {
      wsRef.current?.close();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pairingId]);

  const connectWebSocket = () => {
    const token = ''; // get from storage
    const ws = new WebSocket(`ws://localhost:8080/ws/player?pairingId=${pairingId}`);
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      handleWsMessage(msg);
    };
    ws.onclose = () => { setTimeout(connectWebSocket, 3000); };
    wsRef.current = ws;
  };

  const handleWsMessage = (msg: any) => {
    switch (msg.type) {
      case 'play':
        setCurrentMedia(msg.media);
        setPlaying(true);
        break;
      case 'block':
        setBlocked(true);
        setCountdown(msg.duration || 0);
        startCountdown(msg.duration || 0);
        break;
      case 'unblock':
        setBlocked(false);
        setCountdown(0);
        break;
      case 'sync':
        setCurrentMedia(msg.media);
        break;
    }
  };

  const startCountdown = (seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); setBlocked(false); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const fetchCurrentMedia = async () => {
    try {
      const { data } = await api.get(`/player/${pairingId}/current`);
      if (data.media) setCurrentMedia(data.media);
      if (data.blocked) { setBlocked(true); setCountdown(data.countdown || 0); }
    } catch {}
  };

  const handleEnd = () => {
    // Wait for next WS message
  };

  const handleError = () => {
    Alert.alert('Erro', 'Erro ao reproduzir mídia');
  };

  return (
    <View style={styles.container}>
      {currentMedia?.type === 'video' ? (
        <Video
          ref={videoRef}
          source={{ uri: `http://localhost:8080${currentMedia.url}` }}
          style={styles.video}
          resizeMode="contain"
          paused={!playing || blocked}
          onEnd={handleEnd}
          onError={handleError}
          repeat
        />
      ) : currentMedia?.type === 'image' ? (
        <ImageBackground style={styles.image} source={{ uri: `http://localhost:8080${currentMedia.url}` }} resizeMode="contain" />
      ) : null}
      {blocked && (
        <View style={styles.blockOverlay}>
          <Text style={styles.blockTitle}>TV Bloqueada</Text>
          <Text style={styles.countdown}>{countdown}s</Text>
        </View>
      )}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  video: { flex: 1 },
  image: { flex: 1 },
  blockOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  blockTitle: { fontSize: 36, fontWeight: '800', color: '#ef4444', marginBottom: 16 },
  countdown: { fontSize: 72, fontWeight: '700', color: '#fff' },
  backButton: { position: 'absolute', top: 50, left: 16, backgroundColor: 'rgba(0,0,0,0.6)', padding: 12, borderRadius: 8 },
  backText: { color: '#fff', fontSize: 16 },
});
