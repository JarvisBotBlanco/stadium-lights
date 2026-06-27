const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  pingTimeout: 30000,
  pingInterval: 10000
});

app.use(express.static(path.join(__dirname, 'public')));

// ===== Estado =====
const events = new Map();

function getEvent(eventId) {
  if (!events.has(eventId)) {
    events.set(eventId, {
      clients: new Map(),  // socketId → { zone }
      zones: new Map()     // zone → Set(socketId)
    });
  }
  return events.get(eventId);
}

function getZoneCounts(eventId) {
  const event = getEvent(eventId);
  const counts = {};
  for (const [zone, sockets] of event.zones) {
    counts[zone] = sockets.size;
  }
  return counts;
}

function getClients(eventId) {
  const event = getEvent(eventId);
  return Array.from(event.clients.entries()).map(([id, c]) => ({
    id, zone: c.zone
  }));
}

// ===== Socket.io =====
io.on('connection', (socket) => {
  console.log(`🔌 ${socket.id}`);

  // --- Join event ---
  socket.on('join_event', (data) => {
    const { eventId, zone, autoAssign } = data;
    const event = getEvent(eventId);
    socket.data.eventId = eventId;

    let assignedZone = zone;

    if (autoAssign || !zone) {
      // Auto-asignar a la zona con menos gente
      const counts = getZoneCounts(eventId);
      const allZones = ['N','NE','E','SE','S','SO','O','NO'];
      let minCount = Infinity;
      assignedZone = allZones[0];
      allZones.forEach(z => {
        const c = counts[z] || 0;
        if (c < minCount) { minCount = c; assignedZone = z; }
      });
    }

    socket.data.zone = assignedZone;
    event.clients.set(socket.id, { zone: assignedZone });

    if (!event.zones.has(assignedZone)) event.zones.set(assignedZone, new Set());
    event.zones.get(assignedZone).add(socket.id);

    socket.join(eventId);

    socket.emit('joined', {
      eventId,
      zone: assignedZone,
      serverTime: Date.now(),
      participantCount: event.clients.size
    });

    io.to(`${eventId}_ops`).emit('participant_update', {
      count: event.clients.size,
      clients: getClients(eventId),
      zones: getZoneCounts(eventId)
    });

    console.log(`👤 ${socket.id} → "${eventId}" [${assignedZone}] (${event.clients.size})`);
  });

  // --- Join as operator ---
  socket.on('join_ops', (data) => {
    const { eventId } = data;
    socket.data.eventId = eventId;
    socket.data.isOps = true;
    socket.join(`${eventId}_ops`);

    socket.emit('ops_ready', {
      participantCount: getEvent(eventId).clients.size,
      clients: getClients(eventId),
      zones: getZoneCounts(eventId)
    });

    console.log(`🎛️ Ops → "${eventId}"`);
  });

  // --- Trigger pattern ---
  socket.on('trigger_pattern', (data) => {
    const { eventId, pattern } = data;
    const payload = { ...pattern, serverTime: Date.now(), executeAt: Date.now() + 300 };
    io.to(eventId).emit('pattern', payload);
    io.to(`${eventId}_ops`).emit('pattern_sent', payload);
    console.log(`🎨 "${pattern.name}" → "${eventId}"`);
  });

  // --- Set color for specific zone ---
  socket.on('set_zone_color', (data) => {
    const { eventId, zone, color } = data;
    const event = getEvent(eventId);
    const zoneSockets = event.zones.get(zone);
    if (zoneSockets) {
      zoneSockets.forEach(socketId => {
        io.to(socketId).emit('pixel', { color, zone });
      });
    }
  });

  // --- NTP sync ---
  socket.on('time_ping', (data, callback) => {
    callback({ serverTime: Date.now() });
  });

  // --- Disconnect ---
  socket.on('disconnect', () => {
    const eventId = socket.data.eventId;
    if (!eventId) return;
    const event = events.get(eventId);
    if (!event) return;

    event.clients.delete(socket.id);
    const zone = socket.data.zone;
    if (zone && event.zones.has(zone)) {
      event.zones.get(zone).delete(socket.id);
    }

    io.to(`${eventId}_ops`).emit('participant_update', {
      count: event.clients.size,
      clients: getClients(eventId),
      zones: getZoneCounts(eventId)
    });

    console.log(`👋 ${socket.id} ← "${eventId}" (${event.clients.size})`);
  });
});

// ===== Health =====
app.get('/health', (req, res) => {
  const stats = {};
  for (const [id, event] of events) {
    stats[id] = { participants: event.clients.size, zones: getZoneCounts(id) };
  }
  res.json({ status: 'ok', events: stats });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🏟️ Stadium Lights → http://localhost:${PORT}`);
  console.log(`📱 Público:  http://localhost:${PORT}/`);
  console.log(`🎛️ Operador: http://localhost:${PORT}/operator.html`);
  console.log(`❤️ Health:   http://localhost:${PORT}/health\n`);
});
