import QRCode from 'qrcode';
import { SHOW_SEQUENCES, expandSequence } from '../../shared/show/sequences.js';

let socket;
let eventId = 'hipico-demo';
let sequenceTimers = [];

const SCENES = [
  { id: 'color', label: 'Color', scene: { action: 'solid' } },
  { id: 'white', label: 'Blanco', scene: { action: 'solid', color: '#ffffff' } },
  { id: 'hipico', label: 'Color Hipico', scene: { action: 'solid', color: '#1f8f4d' } },
  { id: 'pulse', label: 'Pulso', scene: { action: 'pulse', color: '#ffffff', duration: 3200, useTorch: false } },
  { id: 'flash', label: 'Flash', scene: { action: 'flash', color: '#ffffff', duration: 160, useTorch: true } },
  { id: 'strobe', label: 'Estrobo', scene: { action: 'strobe', color: '#ffffff', duration: 2800, tempo: 180, useTorch: true } },
  { id: 'sparkle', label: 'Sparkle', scene: { action: 'sparkle', color: '#ffffff', duration: 4500, useTorch: true } },
  { id: 'burst', label: 'Rafaga', scene: { action: 'burst', color: '#ffffff', duration: 3600, useTorch: true } },
  { id: 'off', label: 'Apagar', danger: true, scene: { action: 'off' } }
];

const els = {
  eventInput: document.getElementById('eventIdInput'),
  connectBtn: document.getElementById('connectBtn'),
  sceneGrid: document.getElementById('sceneGrid'),
  sequenceGrid: document.getElementById('sequenceGrid'),
  colorPicker: document.getElementById('colorPicker'),
  dryRun: document.getElementById('dryRunToggle'),
  qrCanvas: document.getElementById('qrCanvas'),
  qrUrl: document.getElementById('qrUrl'),
  readyCount: document.getElementById('readyCount'),
  torchCount: document.getElementById('torchCount'),
  screenOnlyCount: document.getElementById('screenOnlyCount'),
  hapticsCount: document.getElementById('hapticsCount'),
  connectionState: document.getElementById('connectionState'),
  log: document.getElementById('log')
};

function addLog(message) {
  const time = new Date().toLocaleTimeString();
  els.log.insertAdjacentHTML(
    'beforeend',
    `<div><span>${time}</span> ${escapeHtml(message)}</div>`
  );
  els.log.scrollTop = els.log.scrollHeight;
}

function audienceUrl() {
  return `${window.location.origin}/?event=${encodeURIComponent(eventId)}`;
}

async function updateQr() {
  const url = audienceUrl();
  els.qrUrl.textContent = url;
  await QRCode.toCanvas(els.qrCanvas, url, {
    width: 180,
    margin: 1,
    color: { dark: '#050505', light: '#ffffff' }
  });
}

function connectOps() {
  eventId = els.eventInput.value.trim() || 'hipico-demo';
  updateQr();

  if (socket) socket.disconnect();
  socket = io();

  socket.on('connect', () => {
    els.connectionState.textContent = 'Conectado';
    socket.emit('join_show_ops', { eventId });
    addLog(`Operador conectado a ${eventId}`);
  });

  socket.on('disconnect', () => {
    els.connectionState.textContent = 'Reconectando';
  });

  socket.on('show_ops_ready', (data) => {
    updateStats(data.stats);
  });

  socket.on('show_stats', (data) => {
    updateStats(data.stats);
  });

  socket.on('scene_sent', (data) => {
    addLog(`Enviado: ${data.scene.action}`);
  });

  socket.on('scene_dry_run', (data) => {
    addLog(`Dry-run: ${data.scene.action}`);
  });

  socket.on('show_error', (data) => {
    addLog(`Error: ${data.error}`);
  });
}

function updateStats(stats = {}) {
  els.readyCount.textContent = stats.readyCount ?? 0;
  els.torchCount.textContent = stats.torchCount ?? 0;
  els.screenOnlyCount.textContent = stats.screenOnlyCount ?? 0;
  els.hapticsCount.textContent = stats.hapticsCount ?? 0;
}

function sendScene(baseScene) {
  if (!socket?.connected) {
    addLog('No conectado');
    return;
  }

  const scene = {
    ...baseScene,
    color: baseScene.color || els.colorPicker.value
  };

  socket.emit('trigger_scene', {
    eventId,
    scene,
    dryRun: els.dryRun.checked
  });
}

function runSequence(sequence) {
  if (!socket?.connected) {
    addLog('No conectado');
    return;
  }

  cancelSequence();
  const steps = expandSequence(sequence);
  addLog(`Secuencia: ${sequence.label}`);

  for (const step of steps) {
    const timer = setTimeout(() => {
      sendScene(step.scene);
    }, step.at);
    sequenceTimers.push(timer);
  }
}

function cancelSequence() {
  for (const timer of sequenceTimers) clearTimeout(timer);
  sequenceTimers = [];
}

function buildSceneButtons() {
  els.sceneGrid.innerHTML = '';
  for (const item of SCENES) {
    const button = document.createElement('button');
    button.className = item.danger ? 'scene-btn danger' : 'scene-btn';
    button.type = 'button';
    button.textContent = item.label;
    button.onclick = () => {
      cancelSequence();
      sendScene(item.scene);
    };
    els.sceneGrid.appendChild(button);
  }
}

function buildSequenceButtons() {
  els.sequenceGrid.innerHTML = '';
  for (const sequence of SHOW_SEQUENCES) {
    const button = document.createElement('button');
    button.className =
      sequence.id === 'safe-reset' ? 'sequence-btn danger' : 'sequence-btn';
    button.type = 'button';
    button.textContent = sequence.label;
    button.onclick = () => runSequence(sequence);
    els.sequenceGrid.appendChild(button);
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return entities[ch];
  });
}

els.connectBtn.onclick = connectOps;
buildSceneButtons();
buildSequenceButtons();
connectOps();
