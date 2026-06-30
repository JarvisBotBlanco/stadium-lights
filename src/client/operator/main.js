import { parseLayout } from '../../shared/layout/parseLayout.js';
import { buildPresetPatterns } from '../../shared/patterns/presets.js';
import { ShowSimulator } from '../../shared/patterns/simulator.js';
import { VenueCanvas } from './preview/VenueCanvas.js';
import { FillControls } from './preview/FillControls.js';

let socket;
let eventId = 'hipico-demo';
let layout = null;
let connectedClients = [];
let simulator = null;
let dryRun = true;
let fillPercent = 100;

const PRESETS = [
  '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF6600', '#9B59B6', '#007AFF',
  '#006847', '#CE1126', '#1a472a', '#58a6ff'
];

const venueCanvas = new VenueCanvas(document.getElementById('venueCanvas'));

function addLog(msg) {
  const log = document.getElementById('log');
  const time = new Date().toLocaleTimeString();
  log.innerHTML += `<div><span style="color:#484f58">${time}</span> ${msg}</div>`;
  log.scrollTop = log.scrollHeight;
}

function updateQr() {
  const url = `${window.location.origin}/?event=${eventId}`;
  document.getElementById('qrUrl').textContent = url;
  drawQr(url);
}

function drawQr(text) {
  const canvas = document.getElementById('qrCanvas');
  const ctx = canvas.getContext('2d');
  const size = 160;
  canvas.width = size;
  canvas.height = size;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  const modules = encodeQrSimple(text);
  const moduleSize = Math.floor(size / modules.length);

  ctx.fillStyle = '#000000';
  for (let r = 0; r < modules.length; r++) {
    for (let c = 0; c < modules[r].length; c++) {
      if (modules[r][c]) {
        ctx.fillRect(c * moduleSize, r * moduleSize, moduleSize, moduleSize);
      }
    }
  }
}

/** QR minimal placeholder — usa API externa si falla */
function encodeQrSimple(text) {
  const n = 21;
  const grid = Array.from({ length: n }, () => Array(n).fill(false));

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const r = (code * 7 + i * 3) % n;
    const c = (code * 11 + i * 5) % n;
    grid[r][c] = true;
    grid[(r + 3) % n][(c + 5) % n] = true;
  }

  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      grid[i][j] = true;
      grid[i][n - 1 - j] = true;
      grid[n - 1 - i][j] = true;
    }
  }

  return grid;
}

async function loadLayoutFromServer(id) {
  const res = await fetch(`/api/layout/${id}`);
  if (!res.ok) throw new Error('Layout no encontrado');
  return parseLayout(await res.json());
}

async function createEvent(id, presetId) {
  const res = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId: id, presetId })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error creando evento');
  }
  return parseLayout((await res.json()).layout);
}

function initSimulator() {
  if (simulator) simulator.stop();
  simulator = new ShowSimulator(layout, {
    fillPercent,
    realSeatKeys: connectedClients.map((c) => c.seatKey),
    onFrame: (colors) => venueCanvas.applyColors(colors)
  });
}

function triggerPattern(pattern) {
  if (!layout) return;

  pattern.grid = layout.grid;

  if (dryRun && simulator) {
    simulator.setFillPercent(fillPercent);
    simulator.setRealOccupied(connectedClients.map((c) => c.seatKey));
    simulator.play(pattern);
    addLog(`Preview: ${pattern.name || pattern.action}`);
    return;
  }

  socket.emit('trigger_pattern', {
    eventId,
    pattern,
    dryRun: false
  });

  if (simulator) {
    simulator.setFillPercent(fillPercent);
    simulator.setRealOccupied(connectedClients.map((c) => c.seatKey));
    simulator.play(pattern);
  }

  addLog(`Enviado: ${pattern.name || pattern.action}`);
}

function buildPatterns() {
  const grid = layout?.grid || { rows: 6, cols: 80 };
  const presets = buildPresetPatterns(grid);
  const color = document.getElementById('colorPicker').value;

  return {
    strobe: {
      action: 'strobe',
      name: 'Estroboscopio',
      interval: 150,
      duration: 3000,
      color
    },
    'wave-lr': {
      action: 'wave',
      name: 'Ola →',
      direction: 'left-right',
      speed: 200,
      color
    },
    'wave-table': {
      action: 'wave',
      name: 'Ola orden físico',
      direction: 'table-order',
      speed: 250,
      color,
      tableCount: layout?.sections.reduce((s, sec) => s + sec.tables.length, 0)
    },
    rainbow: {
      action: 'rainbow',
      name: 'Arcoíris',
      duration: 5000
    },
    heartbeat: presets.heartbeat,
    flag: presets.flagMexico,
    fire: presets.fire,
    countdown: presets.countdown
  };
}

function connectOps() {
  eventId = document.getElementById('eventIdInput').value || 'hipico-demo';
  const presetId = document.getElementById('presetSelect').value;
  document.getElementById('currentEvent').textContent = eventId;
  updateQr();

  createEvent(eventId, presetId)
    .then((l) => {
      layout = l;
      document.getElementById('layoutJson').value = JSON.stringify(
        {
          eventId: layout.eventId,
          name: layout.name,
          branding: layout.branding,
          sections: layout.sections
        },
        null,
        2
      );
      venueCanvas.setLayout(layout);
      initSimulator();
    })
    .catch((err) => addLog('Error: ' + err.message));

  if (socket) socket.disconnect();
  socket = io();

  socket.on('connect', () => {
    socket.emit('join_ops', { eventId });
    addLog('Operador conectado');
  });

  socket.on('ops_ready', (data) => {
    if (data.layout) {
      layout = parseLayout(data.layout);
      venueCanvas.setLayout(layout);
      initSimulator();
    }
    connectedClients = data.clients || [];
    document.getElementById('participantCount').textContent = data.participantCount;
    document.getElementById('coveragePercent').textContent =
      `${data.coverage?.percent ?? 0}%`;
    venueCanvas.setConnected(connectedClients);
    addLog(`${data.participantCount} participantes`);
  });

  socket.on('participant_update', (data) => {
    connectedClients = data.clients || [];
    document.getElementById('participantCount').textContent = data.count;
    document.getElementById('coveragePercent').textContent =
      `${data.coverage?.percent ?? 0}%`;
    venueCanvas.setConnected(connectedClients);
    if (simulator) {
      simulator.setRealOccupied(connectedClients.map((c) => c.seatKey));
    }
  });

  socket.on('pattern_sent', (data) => {
    addLog(`Broadcast: ${data.name || data.action}`);
  });
}

function buildPresetColors() {
  const container = document.getElementById('presetColors');
  PRESETS.forEach((color) => {
    const el = document.createElement('div');
    el.className = 'preset-color';
    el.style.background = color;
    el.onclick = () => {
      document.getElementById('colorPicker').value = color;
      triggerPattern({ action: 'color', color, name: `Color ${color}` });
    };
    container.appendChild(el);
  });
}

document.getElementById('connectBtn').onclick = connectOps;
document.getElementById('applyColorBtn').onclick = () => {
  triggerPattern({
    action: 'color',
    color: document.getElementById('colorPicker').value,
    name: 'Color sólido'
  });
};
document.getElementById('offBtn').onclick = () => {
  triggerPattern({ action: 'off', name: 'Off' });
  venueCanvas.applyColors(new Map());
};

document.querySelectorAll('[data-pattern]').forEach((btn) => {
  btn.onclick = () => {
    const patterns = buildPatterns();
    triggerPattern(patterns[btn.dataset.pattern]);
  };
});

new FillControls({
  fillSlider: document.getElementById('fillSlider'),
  dryRunToggle: document.getElementById('dryRunToggle'),
  onFillChange: (percent) => {
    fillPercent = percent;
    document.getElementById('fillLabel').textContent = `${percent}%`;
    if (simulator) simulator.setFillPercent(percent);
  },
  onDryRunChange: (enabled) => {
    dryRun = enabled;
    addLog(enabled ? 'Dry-run ON' : 'Dry-run OFF — envío directo');
  }
});

document.getElementById('exportLayoutBtn').onclick = () => {
  if (!layout) return;
  const json = JSON.stringify(
    {
      eventId: layout.eventId,
      name: layout.name,
      branding: layout.branding,
      sections: layout.sections
    },
    null,
    2
  );
  document.getElementById('layoutJson').value = json;
  addLog('Layout exportado al editor');
};

document.getElementById('importLayoutBtn').onclick = async () => {
  try {
    const raw = JSON.parse(document.getElementById('layoutJson').value);
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, layout: raw })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    layout = parseLayout(data.layout);
    venueCanvas.setLayout(layout);
    initSimulator();
    addLog('Layout importado');
    connectOps();
  } catch (err) {
    addLog('Import error: ' + err.message);
  }
};

venueCanvas.onSeatClick = ({ sectionId, tableId, seatIndex }) => {
  const color = document.getElementById('colorPicker').value;
  socket?.emit('set_pixel', {
    eventId,
    sectionId,
    tableId,
    seatIndex,
    color
  });
  addLog(`Pixel ${sectionId}/${tableId}/${seatIndex + 1}`);
};

buildPresetColors();
connectOps();
