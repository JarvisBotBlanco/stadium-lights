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

// ===== Estado del evento =====
const events = new Map();

function getEvent(eventId) {
  if (!events.has(eventId)) {
    events.set(eventId, {
      clients: new Map(),       // socketId → { zone, row, col }
      grid: { rows: 6, cols: 8 },
      currentPattern: null
    });
  }
  return events.get(eventId);
}

// ===== Socket.io =====
io.on('connection', (socket) => {
  console.log(`🔌 Conectado: ${socket.id}`);

  // --- Público: unirse al evento ---
  socket.on('join_event', (data) => {
    const { eventId, row, col, autoAssign } = data;
    const event = getEvent(eventId);
    socket.data.eventId = eventId;

    let assignedRow = row;
    let assignedCol = col;

    // Auto-asignar si no eligió posición
    if (autoAssign || row === undefined || col === undefined) {
      const pos = autoAssignPosition(event);
      assignedRow = pos.row;
      assignedCol = pos.col;
    }

    socket.data.row = assignedRow;
    socket.data.col = assignedCol;

    event.clients.set(socket.id, {
      row: assignedRow,
      col: assignedCol,
      connectedAt: Date.now()
    });

    socket.join(eventId);

    socket.emit('joined', {
      eventId,
      row: assignedRow,
      col: assignedCol,
      grid: event.grid,
      serverTime: Date.now(),
      participantCount: event.clients.size
    });

    // Notificar al operador
    io.to(`${eventId}_ops`).emit('participant_update', {
      count: event.clients.size,
      clients: Array.from(event.clients.entries()).map(([id, c]) => ({
        id, row: c.row, col: c.col
      }))
    });

    console.log(`👤 ${socket.id} → evento "${eventId}" [${assignedRow},${assignedCol}] (${event.clients.size} conectados)`);
  });

  // --- Operador: unirse como controlador ---
  socket.on('join_ops', (data) => {
    const { eventId } = data;
    const event = getEvent(eventId);
    socket.data.eventId = eventId;
    socket.data.isOps = true;
    socket.join(`${eventId}_ops`);

    socket.emit('ops_ready', {
      participantCount: event.clients.size,
      clients: Array.from(event.clients.entries()).map(([id, c]) => ({
        id, row: c.row, col: c.col
      })),
      grid: event.grid
    });

    console.log(`🎛️ Operador conectado al evento "${eventId}"`);
  });

  // --- Operador: enviar patrón ---
  socket.on('trigger_pattern', (data) => {
    const { eventId, pattern } = data;
    const event = getEvent(eventId);

    const payload = {
      ...pattern,
      serverTime: Date.now(),
      executeAt: Date.now() + 300  // 300ms buffer para sync
    };

    event.currentPattern = payload;

    // Broadcast a todos los participantes
    io.to(eventId).emit('pattern', payload);
    io.to(`${eventId}_ops`).emit('pattern_sent', payload);

    console.log(`🎨 Patrón "${pattern.name}" disparado en "${eventId}"`);
  });

  // --- Operador: enviar color a celda específica ---
  socket.on('set_pixel', (data) => {
    const { eventId, row, col, color } = data;
    const event = getEvent(eventId);

    // Encontrar socket en esa posición
    for (const [socketId, client] of event.clients) {
      if (client.row === row && client.col === col) {
        io.to(socketId).emit('pixel', { color, row, col });
        break;
      }
    }
  });

  // --- NTP time sync ---
  socket.on('time_ping', (data, callback) => {
    callback({ serverTime: Date.now() });
  });

  // --- Desconexión ---
  socket.on('disconnect', () => {
    const eventId = socket.data.eventId;
    if (eventId) {
      const event = events.get(eventId);
      if (event) {
        event.clients.delete(socket.id);

        // Notificar al operador
        io.to(`${eventId}_ops`).emit('participant_update', {
          count: event.clients.size,
          clients: Array.from(event.clients.entries()).map(([id, c]) => ({
            id, row: c.row, col: c.col
          }))
        });

        console.log(`👋 ${socket.id} desconectado de "${eventId}" (${event.clients.size} restantes)`);
      }
    }
  });
});

// Auto-asignar posición (rellenar de izq a der, arriba a abajo)
function autoAssignPosition(event) {
  const occupied = new Set();
  for (const [, client] of event.clients) {
    occupied.add(`${client.row},${client.col}`);
  }

  for (let r = 0; r < event.grid.rows; r++) {
    for (let c = 0; c < event.grid.cols; c++) {
      if (!occupied.has(`${r},${c}`)) {
        return { row: r, col: c };
      }
    }
  }

  // Si todo está lleno, asignar aleatorio
  return {
    row: Math.floor(Math.random() * event.grid.rows),
    col: Math.floor(Math.random() * event.grid.cols)
  };
}

// ===== Health check =====
app.get('/health', (req, res) => {
  const stats = {};
  for (const [id, event] of events) {
    stats[id] = { participants: event.clients.size };
  }
  res.json({ status: 'ok', events: stats });
});

// ===== Endpoints HTTP para patrones =====
app.post('/api/trigger/:eventId', express.json(), (req, res) => {
  const { eventId } = req.params;
  const pattern = req.body;
  const event = getEvent(eventId);

  const payload = {
    ...pattern,
    serverTime: Date.now(),
    executeAt: Date.now() + 300
  };

  io.to(eventId).emit('pattern', payload);
  res.json({ ok: true, participants: event.clients.size });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🏟️ Stadium Lights corriendo en http://localhost:${PORT}`);
  console.log(`📱 App pública:     http://localhost:${PORT}/`);
  console.log(`🎛️ Operador:        http://localhost:${PORT}/operator.html`);
  console.log(`❤️ Health:          http://localhost:${PORT}/health\n`);
});
