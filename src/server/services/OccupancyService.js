import {
  serializeClients,
  serializeOccupancy,
  createSessionToken
} from '../domain/Event.js';
import { resolveSeat } from '../../shared/layout/seatToGrid.js';

const SEAT_HOLD_MS = 5 * 60 * 1000;

export class OccupancyService {
  /**
   * @param {ReturnType<typeof createEventState>} event
   * @param {object} data
   */
  tryJoin(event, data) {
    const {
      sectionId,
      tableId,
      seatIndex,
      sessionToken,
      autoAssignSeat
    } = data;

    if (sessionToken && event.tokenIndex.has(sessionToken)) {
      return this._reconnect(event, sessionToken);
    }

    if (sectionId && tableId !== undefined && seatIndex !== undefined) {
      return this._joinSeat(event, sectionId, tableId, seatIndex);
    }

    if (sectionId && tableId && autoAssignSeat) {
      return this._autoAssignSeatInTable(event, sectionId, tableId);
    }

    return { ok: false, error: 'Selecciona sección, mesa y asiento' };
  }

  _reconnect(event, sessionToken) {
    const existing = event.tokenIndex.get(sessionToken);
    if (!existing) {
      return { ok: false, error: 'Sesión expirada, elige tu asiento de nuevo' };
    }

    const seat = resolveSeat(
      event.layout,
      existing.sectionId,
      existing.tableId,
      existing.seatIndex
    );
    if (!seat) {
      return { ok: false, error: 'Layout cambió, elige asiento de nuevo' };
    }

    return {
      ok: true,
      sessionToken,
      seat,
      reconnected: true
    };
  }

  _joinSeat(event, sectionId, tableId, seatIndex) {
    const seat = resolveSeat(event.layout, sectionId, tableId, seatIndex);
    if (!seat) {
      return { ok: false, error: 'Asiento no válido' };
    }

    if (event.seatIndex.has(seat.seatKey)) {
      const holder = event.seatIndex.get(seat.seatKey);
      if (Date.now() - holder.disconnectedAt < SEAT_HOLD_MS) {
        return { ok: false, error: 'Este asiento ya está ocupado' };
      }
      event.seatIndex.delete(seat.seatKey);
      if (holder.sessionToken) {
        event.tokenIndex.delete(holder.sessionToken);
      }
    }

    const sessionToken = createSessionToken();
    return { ok: true, sessionToken, seat, reconnected: false };
  }

  _autoAssignSeatInTable(event, sectionId, tableId) {
    const tableSeats = event.layout.seats.filter(
      (s) => s.sectionId === sectionId && s.tableId === tableId
    );
    for (const seat of tableSeats) {
      if (!event.seatIndex.has(seat.seatKey)) {
        return this._joinSeat(event, sectionId, tableId, seat.seatIndex);
      }
    }
    return { ok: false, error: 'Todos los asientos de esta mesa están ocupados' };
  }

  /**
   * @param {ReturnType<typeof createEventState>} event
   * @param {string} socketId
   * @param {object} joinResult
   */
  registerClient(event, socketId, joinResult) {
    const { seat, sessionToken, reconnected } = joinResult;

    if (reconnected) {
      for (const [oldId, oldClient] of event.clients) {
        if (oldClient.sessionToken === sessionToken) {
          event.clients.delete(oldId);
        }
      }
      const hold = event.seatIndex.get(seat.seatKey);
      if (hold) {
        hold.socketId = socketId;
        hold.disconnectedAt = 0;
      }
    }

    const client = {
      sectionId: seat.sectionId,
      tableId: seat.tableId,
      seatIndex: seat.seatIndex,
      seatKey: seat.seatKey,
      row: seat.row,
      col: seat.col,
      label: seat.label,
      sessionToken,
      connectedAt: Date.now(),
      isSimulated: false
    };

    event.clients.set(socketId, client);
    event.seatIndex.set(seat.seatKey, {
      socketId,
      sessionToken,
      sectionId: seat.sectionId,
      tableId: seat.tableId,
      seatIndex: seat.seatIndex,
      disconnectedAt: 0
    });
    event.tokenIndex.set(sessionToken, {
      sectionId: seat.sectionId,
      tableId: seat.tableId,
      seatIndex: seat.seatIndex,
      seatKey: seat.seatKey
    });

    return client;
  }

  /**
   * @param {ReturnType<typeof createEventState>} event
   * @param {string} socketId
   */
  disconnectClient(event, socketId) {
    const client = event.clients.get(socketId);
    if (!client) return null;

    event.clients.delete(socketId);

    const seatHold = event.seatIndex.get(client.seatKey);
    if (seatHold && seatHold.socketId === socketId) {
      seatHold.disconnectedAt = Date.now();
      seatHold.socketId = null;
    }

    return client;
  }

  getCoverage(event) {
    const tablesWithPeople = new Set();
    for (const client of event.clients.values()) {
      tablesWithPeople.add(`${client.sectionId}:${client.tableId}`);
    }
    const totalTables = event.layout.sections.reduce(
      (sum, s) => sum + s.tables.length,
      0
    );
    return {
      tablesWithPeople: tablesWithPeople.size,
      totalTables,
      percent: totalTables
        ? Math.round((tablesWithPeople.size / totalTables) * 100)
        : 0
    };
  }

  buildParticipantUpdate(event) {
    return {
      count: event.clients.size,
      clients: serializeClients(event),
      occupancy: serializeOccupancy(event),
      coverage: this.getCoverage(event)
    };
  }
}
