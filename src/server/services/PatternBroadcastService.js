import { buildTableWaveIndex } from '../../shared/layout/waveOrder.js';

export class PatternBroadcastService {
  /**
   * @param {import('socket.io').Server} io
   */
  constructor(io) {
    this.io = io;
  }

  /**
   * @param {ReturnType<import('../domain/Event.js').createEventState>} event
   * @param {object} pattern
   * @param {boolean} [dryRun=false]
   */
  trigger(event, pattern, dryRun = false) {
    const tableWaveIndex = buildTableWaveIndex(event.layout);
    const payload = {
      ...pattern,
      grid: event.layout.grid,
      tableCount: tableWaveIndex.size,
      serverTime: Date.now(),
      executeAt: Date.now() + 300
    };

    event.currentPattern = payload;

    if (dryRun) {
      this.io.to(`${event.eventId}_ops`).emit('pattern_preview', payload);
      return payload;
    }

    this.io.to(event.eventId).emit('pattern', payload);
    this.io.to(`${event.eventId}_ops`).emit('pattern_sent', payload);
    return payload;
  }

  /**
   * @param {ReturnType<import('../domain/Event.js').createEventState>} event
   */
  setPixel(event, sectionId, tableId, seatIndex, color) {
    for (const [socketId, client] of event.clients) {
      if (
        client.sectionId === sectionId &&
        client.tableId === tableId &&
        client.seatIndex === seatIndex
      ) {
        this.io.to(socketId).emit('pixel', {
          color,
          sectionId,
          tableId,
          seatIndex,
          row: client.row,
          col: client.col
        });
        return true;
      }
    }
    return false;
  }

  /** Compatibilidad row/col */
  setPixelByGrid(event, row, col, color) {
    for (const [socketId, client] of event.clients) {
      if (client.row === row && client.col === col) {
        this.io.to(socketId).emit('pixel', { color, row, col });
        return true;
      }
    }
    return false;
  }
}
