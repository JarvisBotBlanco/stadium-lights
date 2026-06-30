import { normalizeScene } from '../../shared/show/sceneValidator.js';

const DEFAULT_EVENT_ID = 'hipico-demo';

export function registerSimpleShowHandlers(io, services) {
  const { simpleShowService } = services;

  io.on('connection', (socket) => {
    socket.on('join_show', (data = {}) => {
      const eventId = data.eventId || DEFAULT_EVENT_ID;
      const joined = simpleShowService.join(eventId, socket.id, data);

      socket.data.simpleEventId = eventId;
      socket.data.simpleSessionToken = joined.sessionToken;
      socket.join(eventId);

      socket.emit('show_joined', {
        eventId,
        sessionToken: joined.sessionToken,
        groupId: joined.groupId,
        capabilities: joined.capabilities,
        stats: joined.stats,
        serverTime: Date.now()
      });

      emitShowStats(io, simpleShowService, eventId);
    });

    socket.on('join_show_ops', (data = {}) => {
      const eventId = data.eventId || DEFAULT_EVENT_ID;
      socket.data.simpleOpsEventId = eventId;
      socket.join(`${eventId}_show_ops`);
      socket.emit('show_ops_ready', {
        eventId,
        stats: simpleShowService.getStats(eventId),
        serverTime: Date.now()
      });
    });

    socket.on('trigger_scene', (data = {}) => {
      const eventId = data.eventId || DEFAULT_EVENT_ID;
      try {
        const scene = normalizeScene(data.scene || {}, {
          now: Date.now(),
          leadMs: Number(process.env.SCENE_LEAD_MS) || 1000
        });

        if (data.dryRun) {
          socket.emit('scene_dry_run', { eventId, scene });
          return;
        }

        io.to(eventId).emit('scene', scene);
        io.to(`${eventId}_show_ops`).emit('scene_sent', {
          eventId,
          scene,
          stats: simpleShowService.getStats(eventId)
        });
      } catch (err) {
        socket.emit('show_error', { error: err.message });
      }
    });

    socket.on('disconnect', () => {
      const eventId = socket.data.simpleEventId;
      if (!eventId) return;
      simpleShowService.disconnect(socket.id);
      emitShowStats(io, simpleShowService, eventId);
    });
  });
}

function emitShowStats(io, simpleShowService, eventId) {
  io.to(`${eventId}_show_ops`).emit('show_stats', {
    eventId,
    stats: simpleShowService.getStats(eventId)
  });
}

export function registerParticipantHandlers(io, services) {
  const { eventService, occupancyService, patternService } = services;

  io.on('connection', (socket) => {
    console.log(`🔌 Conectado: ${socket.id}`);

    socket.on('join_event', (data) => {
      const { eventId } = data || {};
      if (!eventId) {
        socket.emit('join_error', { error: 'eventId requerido' });
        return;
      }

      let event;
      try {
        event = eventService.getOrCreate(eventId);
      } catch (err) {
        socket.emit('join_error', { error: err.message });
        return;
      }

      const result = occupancyService.tryJoin(event, data);
      if (!result.ok) {
        socket.emit('join_error', { error: result.error });
        return;
      }

      const client = occupancyService.registerClient(event, socket.id, result);
      socket.data.eventId = eventId;
      socket.data.sessionToken = result.sessionToken;
      socket.data.seatKey = client.seatKey;

      socket.join(eventId);

      socket.emit('joined', {
        eventId,
        sessionToken: result.sessionToken,
        sectionId: client.sectionId,
        tableId: client.tableId,
        seatIndex: client.seatIndex,
        seatKey: client.seatKey,
        row: client.row,
        col: client.col,
        label: client.label,
        layout: {
          eventId: event.layout.eventId,
          name: event.layout.name,
          branding: event.layout.branding,
          sections: event.layout.sections,
          grid: event.layout.grid,
          seatCount: event.layout.seatCount
        },
        grid: event.layout.grid,
        serverTime: Date.now(),
        participantCount: event.clients.size,
        reconnected: result.reconnected
      });

      const update = occupancyService.buildParticipantUpdate(event);
      io.to(eventId).emit('occupancy_update', {
        occupancy: update.occupancy
      });
      io.to(`${eventId}_ops`).emit('participant_update', update);

      console.log(
        `👤 ${socket.id} → "${eventId}" ${client.label} (${event.clients.size} conectados)`
      );
    });

    socket.on('get_occupancy', (data) => {
      const { eventId } = data || {};
      if (!eventId) return;
      try {
        const event = eventService.getOrCreate(eventId);
        socket.emit('occupancy_update', {
          occupancy: occupancyService.buildParticipantUpdate(event).occupancy
        });
      } catch {
        // ignore
      }
    });

    socket.on('time_ping', (data, callback) => {
      callback({ serverTime: Date.now() });
    });

    socket.on('disconnect', () => {
      const eventId = socket.data.eventId;
      if (!eventId) return;

      const event = eventService.events.get(eventId);
      if (!event) return;

      occupancyService.disconnectClient(event, socket.id);

      const update = occupancyService.buildParticipantUpdate(event);
      io.to(eventId).emit('occupancy_update', {
        occupancy: update.occupancy
      });
      io.to(`${eventId}_ops`).emit('participant_update', update);

      console.log(
        `👋 ${socket.id} desconectado de "${eventId}" (${event.clients.size} restantes)`
      );
    });
  });
}

export function registerOperatorHandlers(io, services) {
  const { eventService, occupancyService, patternService } = services;

  io.on('connection', (socket) => {
    socket.on('join_ops', (data) => {
      const { eventId } = data || {};
      if (!eventId) return;

      let event;
      try {
        event = eventService.getOrCreate(eventId);
      } catch (err) {
        socket.emit('ops_error', { error: err.message });
        return;
      }

      socket.data.eventId = eventId;
      socket.data.isOps = true;
      socket.join(`${eventId}_ops`);

      const update = occupancyService.buildParticipantUpdate(event);
      socket.emit('ops_ready', {
        eventId,
        participantCount: update.count,
        clients: update.clients,
        occupancy: update.occupancy,
        coverage: update.coverage,
        layout: event.layout,
        grid: event.layout.grid
      });

      console.log(`🎛️ Operador conectado al evento "${eventId}"`);
    });

    socket.on('trigger_pattern', (data) => {
      const { eventId, pattern, dryRun } = data || {};
      if (!eventId || !pattern) return;

      const event = eventService.getOrCreate(eventId);
      const payload = patternService.trigger(event, pattern, !!dryRun);
      console.log(
        `🎨 Patrón "${pattern.name || pattern.action}" ${dryRun ? '(preview)' : ''} en "${eventId}"`
      );
      return payload;
    });

    socket.on('set_pixel', (data) => {
      const { eventId, row, col, color, sectionId, tableId, seatIndex } =
        data || {};
      if (!eventId) return;

      const event = eventService.getOrCreate(eventId);
      if (sectionId && tableId !== undefined && seatIndex !== undefined) {
        patternService.setPixel(event, sectionId, tableId, seatIndex, color);
      } else if (row !== undefined && col !== undefined) {
        patternService.setPixelByGrid(event, row, col, color);
      }
    });
  });
}
