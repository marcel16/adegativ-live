# Guia de Desenvolvimento - Apps para TV

## Visão Geral

Os apps de TV são responsáveis por exibir o conteúdo programado nas TVs dos clientes.
Cada plataforma tem seu próprio SDK e linguagem, mas todas seguem o mesmo fluxo:

1. Abrir e verificar token local
2. Se não tiver token, gerar código de pareamento
3. Aguardar autorização via polling ou WebSocket
4. Obter playlist e exibir em loop
5. Sincronizar periodicamente
6. Bloquear se assinatura vencida

## Fluxo Padrão

```
1. Iniciar → Verificar localStorage/sessionStorage
2. Se existe sessionToken → GET /api/tv/playlist/:sessionToken
3. Se não existe → POST /api/tv/pairing/generate → mostrar código de 6 dígitos
4. Polling GET /api/tv/playlist/:deviceToken a cada 5 segundos
5. Quando pareado → salvar token → iniciar player
6. Player loop: exibir playlist, recarregar a cada 60s
7. Ping a cada 30s: POST /api/tv/:id/ping
```

## API Endpoints para TVs

### Gerar código de pareamento
```
POST /api/tv/pairing/generate
Body: { "platform": "SAMSUNG|LG|ANDROID_TV|ROKU|WEB", "model": "string" }
Response: { code: "123456", deviceToken: "uuid", tvDeviceId: "uuid", expiresAt: "ISO date" }
```

### Obter playlist (usado após pareamento)
```
GET /api/tv/playlist/:deviceToken
Response: {
  tvId: "uuid",
  name: "TV nome",
  blocked: false,
  schedule: [{ mediaFile: { url, type, duration }, priority, campaign }],
  fallback: [{ url, type, duration }]
}
```

### Ping (manter online)
```
POST /api/tv/:id/ping
```

## Samsung Tizen

- Linguagem: JavaScript (Web App)
- SDK: Tizen SDK 5.5+
- Resolução: 1920x1080
- Player: <video> element
- Armazenamento: localStorage
- Comunicação: HTTP + WebSocket (socket.io)

Estrutura:
```
tv-samsung-tizen/
  index.html
  js/
    app.js     - Lógica principal
    player.js  - Player de vídeo
    pairing.js - Fluxo de pareamento
    api.js     - HTTP client
  config.xml
```

## LG webOS

- Linguagem: JavaScript (Web App)
- SDK: webOS TV SDK
- Resolução: 1920x1080, 3840x2160
- Player: webOS video element
- Armazenamento: localStorage

Estrutura:
```
tv-lg-webos/
  index.html
  js/
    app.js
    player.js
    pairing.js
    api.js
  appinfo.json
```

## Android TV

- Linguagem: Kotlin
- SDK: Android TV SDK (API 21+)
- Resolução: Adaptável
- Player: ExoPlayer
- Armazenamento: SharedPreferences/Room
- Comunicação: Retrofit + OkHttp WebSocket

Estrutura:
```
tv-android/
  app/
    src/main/java/com/adegatv/
      MainActivity.kt
      player/
        TVPlayerService.kt
        PlaylistManager.kt
      pairing/
        PairingActivity.kt
        PairingViewModel.kt
      api/
        AdegaTVApi.kt
        WebSocketManager.kt
      model/
        Playlist.kt
        TVDevice.kt
```

## Roku

- Linguagem: BrightScript
- SDK: Roku SDK
- Resolução: Adaptável
- Player: roVideoPlayer
- Armazenamento: roRegistrySection
- Comunicação: roUrlTransfer

Estrutura:
```
tv-roku/
  source/
    main.brs
    player.brs
    pairing.brs
    api.brs
  components/
    VideoPlayer.xml
    PairingScreen.xml
    BlockedScreen.xml
  manifest
```

## Telas Comuns

1. **Tela de Pareamento** (código de 6 dígitos animado)
2. **Tela de Player** (vídeo/imagem em tela cheia)
3. **Tela de Bloqueio** (assinatura vencida)
4. **Tela de Carregamento** (buscando playlist)

## Player Loop

```javascript
async function playerLoop() {
  while (true) {
    const playlist = await getPlaylist(token);
    
    if (playlist.blocked) {
      showBlockedScreen();
      await sleep(60000);
      continue;
    }

    for (const item of playlist.schedule) {
      if (item.type === 'VIDEO') {
        playVideo(item.url, item.duration);
        await waitForVideoEnd();
      } else {
        showImage(item.url, item.duration);
        await sleep(item.duration * 1000);
      }
    }

    await sleep(60000); // Recarregar playlist
  }
}
```

## Considerações Técnicas

- Usar cache local para reduzir requisições
- Implementar fallback para conteúdo offline
- Tratar erros de rede com retry exponencial
- Usar resolução adequada para cada plataforma
- Implementar detecção de resolução automática
- Garantir loop infinito sem travamentos
- Atualizar conteúdo sem reiniciar o app

## WebSocket vs Polling

- TVs modernas (Samsung 2020+, LG webOS 5+): usar WebSocket
- TVs antigas: usar polling a cada 30s
- Android TV: suporta ambos
- Roku: polling apenas

## Tela de Bloqueio

Exibir quando a API retornar `blocked: true`:
- Mensagem: "Assinatura vencida. Renove seu plano para continuar exibindo."
- QR Code opcional para renovação
- Botão para verificar novamente após pagamento
- Tentar recarregar playlist a cada 60s
