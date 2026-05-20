const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const PORT = process.env.PORT || 3005;
const API_URL = process.env.API_URL || 'http://api:3001';
const STREAMS_DIR = process.env.STREAMS_DIR || '/data/streams';
const REFRESH_INTERVAL = parseInt(process.env.REFRESH_INTERVAL || '60000');

const app = express();

if (!fs.existsSync(STREAMS_DIR)) fs.mkdirSync(STREAMS_DIR, { recursive: true });

const processes = {};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function refreshStreams() {
  try {
    const streams = await fetchJson(`${API_URL}/streams`);
    const activeCodes = new Set(streams.map(s => s.code));

    for (const code of activeCodes) {
      if (!processes[code] || !processes[code].running) {
        startStream(code);
      }
    }

    for (const code of Object.keys(processes)) {
      if (!activeCodes.has(code)) {
        stopStream(code);
      }
    }
  } catch (err) {
    console.error('Failed to refresh streams:', err.message);
  }
}

async function startStream(code) {
  const streamDir = path.join(STREAMS_DIR, code);
  if (!fs.existsSync(streamDir)) fs.mkdirSync(streamDir, { recursive: true });

  const playlistPath = path.join(streamDir, 'filelist.txt');
  const hlsPath = path.join(streamDir, 'index.m3u8');

  processes[code] = { running: false, ffmpeg: null };

  try {
    const data = await fetchJson(`${API_URL}/streams/${code}`);
    if (data.blocked || !data.videos || data.videos.length === 0) {
      console.log(`Stream ${code}: no videos available`);
      return;
    }

    const fileList = data.videos.map(v => `file '${v.url}'`).join('\n');
    fs.writeFileSync(playlistPath, fileList);

    console.log(`Starting stream ${code} with ${data.videos.length} videos`);

    const ffmpeg = spawn('ffmpeg', [
      '-stream_loop', '-1',
      '-f', 'concat',
      '-safe', '0',
      '-i', playlistPath,
      '-c', 'libx264',
      '-preset', 'veryfast',
      '-crf', '23',
      '-g', '30',
      '-sc_threshold', '0',
      '-f', 'hls',
      '-hls_time', '6',
      '-hls_list_size', '0',
      '-hls_segment_filename', path.join(streamDir, 'seg_%03d.ts'),
      '-hls_flags', 'delete_segments+independent_segments',
      hlsPath,
    ], { stdio: ['ignore', 'pipe', 'pipe'] });

    ffmpeg.stdout.on('data', d => process.stdout.write(`[stream-${code}] ${d}`));
    ffmpeg.stderr.on('data', d => process.stderr.write(`[stream-${code}] ${d}`));

    ffmpeg.on('exit', (code_, signal) => {
      console.log(`Stream ${code} exited (code=${code_}, signal=${signal})`);
      processes[code].running = false;
      setTimeout(() => { if (processes[code] && !processes[code].running) startStream(code); }, 5000);
    });

    processes[code] = { running: true, ffmpeg };
  } catch (err) {
    console.error(`Failed to start stream ${code}:`, err.message);
  }
}

function stopStream(code) {
  if (processes[code] && processes[code].ffmpeg) {
    console.log(`Stopping stream ${code}`);
    processes[code].ffmpeg.kill('SIGTERM');
    setTimeout(() => { if (processes[code]?.ffmpeg) processes[code].ffmpeg.kill('SIGKILL'); }, 5000);
  }
  delete processes[code];
}

app.use('/hls', express.static(STREAMS_DIR, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.m3u8')) res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    if (filePath.endsWith('.ts')) res.setHeader('Content-Type', 'video/mp2t');
  },
}));

app.get('/playlist.m3u', async (req, res) => {
  try {
    const streams = await fetchJson(`${API_URL}/streams`);
    const baseUrl = process.env.PUBLIC_URL || req.protocol + '://' + req.get('host');
    let m3u = '#EXTM3U\n';
    for (const s of streams) {
      m3u += `#EXTINF:-1 tvg-id="${s.code}" tvg-name="${s.name}",${s.name}\n`;
      m3u += `${baseUrl}/hls/${s.code}/index.m3u8\n`;
    }
    res.setHeader('Content-Type', 'audio/x-mpegurl');
    res.send(m3u);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Stream service running on port ${PORT}`);
  refreshStreams();
  setInterval(refreshStreams, REFRESH_INTERVAL);
});
