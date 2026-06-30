import { syncClockWithSocket } from '../../shared/sync/clock.js';
import { executePattern } from '../../shared/patterns/index.js';
import { parseLayout } from '../../shared/layout/parseLayout.js';
import { buildTableWaveIndex } from '../../shared/layout/waveOrder.js';

const params = new URLSearchParams(window.location.search);
const eventId = params.get('event') || 'hipico-demo';

let socket;
let layout;
let clockOffset = 0;
let mySeat = null;
let sessionToken = localStorage.getItem(`sl_token_${eventId}`);
let selectedSection = null;
let selectedTable = null;
let occupancy = new Set();

const screens = {
  welcome: document.getElementById('welcomeScreen'),
  section: document.getElementById('sectionScreen'),
  table: document.getElementById('tableScreen'),
  seat: document.getElementById('seatScreen'),
  waiting: document.getElementById('waitingScreen')
};

function showScreen(name) {
  Object.values(screens).forEach((el) => el.classList.remove('active'));
  if (screens[name]) screens[name].classList.add('active');
}

async function loadLayout() {
  const res = await fetch(`/api/layout/${eventId}`);
  if (!res.ok) throw new Error('No se pudo cargar el evento');
  layout = parseLayout(await res.json());
  if (layout.branding?.primaryColor) {
    document.querySelector('meta[name="theme-color"]').content =
      layout.branding.primaryColor;
  }
}

function renderSections() {
  const list = document.getElementById('sectionList');
  list.innerHTML = '';
  for (const section of layout.sections) {
    const btn = document.createElement('button');
    btn.className = 'section-btn';
    btn.textContent = `${section.label} (${section.tables.length} mesas)`;
    btn.onclick = () => {
      selectedSection = section;
      renderTables();
      showScreen('table');
    };
    list.appendChild(btn);
  }
}

function renderTables() {
  document.getElementById('tableScreenTitle').textContent =
    selectedSection.label;
  const map = document.getElementById('tableMap');
  map.innerHTML = '';

  const maxCol =
    Math.max(...selectedSection.tables.map((t) => t.col), 0) + 1;
  map.style.gridTemplateColumns = `repeat(${Math.min(maxCol, 4)}, 1fr)`;

  for (const table of selectedSection.tables) {
    const cell = document.createElement('button');
    cell.className = 'table-cell';
    cell.textContent = table.label || table.id;

    const fullyOccupied = isTableFull(selectedSection.id, table);
    if (fullyOccupied) cell.classList.add('occupied');

    cell.onclick = () => {
      if (fullyOccupied) return;
      selectedTable = table;
      renderSeats();
      showScreen('seat');
    };
    map.appendChild(cell);
  }
}

function isTableFull(sectionId, table) {
  for (let i = 0; i < table.seats; i++) {
    if (!occupancy.has(`${sectionId}:${table.id}:${i}`)) return false;
  }
  return true;
}

function renderSeats() {
  document.getElementById('seatScreenTitle').textContent =
    `${selectedTable.label || selectedTable.id}`;
  const picker = document.getElementById('seatPicker');
  picker.innerHTML = '';
  document.getElementById('joinError').style.display = 'none';

  for (let i = 0; i < selectedTable.seats; i++) {
    const key = `${selectedSection.id}:${selectedTable.id}:${i}`;
    const btn = document.createElement('button');
    btn.className = 'seat-btn';
    btn.textContent = i + 1;
    if (occupancy.has(key)) btn.classList.add('occupied');
    btn.onclick = () => joinSeat(i);
    picker.appendChild(btn);
  }
}

function connectSocket() {
  socket = io({ reconnection: true, reconnectionDelay: 1000 });

  socket.on('connect', async () => {
    document.getElementById('infoOverlay').textContent = '🟢 Conectado';
    clockOffset = await syncClockWithSocket(socket);
    socket.emit('get_occupancy', { eventId });

    if (sessionToken) {
      tryReconnect();
    }
  });

  socket.on('disconnect', () => {
    document.getElementById('infoOverlay').textContent = '🔴 Desconectado';
  });

  socket.on('occupancy_update', (data) => {
    occupancy = new Set((data.occupancy || []).map((o) => o.seatKey));
    if (screens.seat.classList.contains('active')) renderSeats();
    if (screens.table.classList.contains('active')) renderTables();
  });

  socket.on('join_error', (data) => {
    const err = document.getElementById('joinError');
    err.textContent = data.error || 'Error al unirse';
    err.style.display = 'block';
    sessionToken = null;
    localStorage.removeItem(`sl_token_${eventId}`);
  });

  socket.on('joined', (data) => {
    mySeat = data;
    sessionToken = data.sessionToken;
    localStorage.setItem(`sl_token_${eventId}`, sessionToken);

    showScreen('waiting');
    document.getElementById('positionBadge').textContent = data.label;
    document.getElementById('statusText').textContent =
      `${data.participantCount} participantes conectados`;
    requestWakeLock();
  });

  socket.on('pattern', (data) => {
    runPattern(data);
  });

  socket.on('pixel', (data) => {
    showColor(data.color);
  });
}

function tryReconnect() {
  socket.emit('join_event', {
    eventId,
    sessionToken
  });
}

function joinSeat(seatIndex) {
  socket.emit('join_event', {
    eventId,
    sectionId: selectedSection.id,
    tableId: selectedTable.id,
    seatIndex
  });
}

function autoJoinSeat() {
  socket.emit('join_event', {
    eventId,
    sectionId: selectedSection.id,
    tableId: selectedTable.id,
    autoAssignSeat: true
  });
}

async function runPattern(pattern) {
  const seat = {
    sectionId: mySeat.sectionId,
    tableId: mySeat.tableId,
    seatIndex: mySeat.seatIndex,
    row: mySeat.row,
    col: mySeat.col,
    seatKey: mySeat.seatKey
  };
  const enriched = { ...pattern, grid: layout?.grid || pattern.grid };
  if (pattern.action === 'wave' && pattern.direction === 'table-order' && layout) {
    const waveIndex = buildTableWaveIndex(layout);
    enriched.waveStep = waveIndex.get(`${seat.sectionId}:${seat.tableId}`) ?? 0;
  }
  await executePattern(seat, enriched, clockOffset, { showColor, hideColor });
}

function showColor(color) {
  const show = document.getElementById('showScreen');
  show.style.display = 'block';
  show.style.backgroundColor = color;
  document.querySelector('meta[name="theme-color"]').content = color;
}

function hideColor() {
  document.getElementById('showScreen').style.display = 'none';
  const brand = layout?.branding?.primaryColor || '#1a472a';
  document.querySelector('meta[name="theme-color"]').content = brand;
}

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      await navigator.wakeLock.request('screen');
    }
  } catch {
    // ignore
  }
}

document.getElementById('startBtn').onclick = () => {
  renderSections();
  showScreen('section');
};

document.getElementById('autoSeatBtn').onclick = autoJoinSeat;

document.querySelectorAll('[data-back]').forEach((btn) => {
  btn.onclick = () => showScreen(btn.dataset.back);
});

async function init() {
  try {
    await loadLayout();
    connectSocket();
  } catch (err) {
    document.getElementById('infoOverlay').textContent = '❌ ' + err.message;
  }
}

init();
