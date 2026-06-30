import { randomUUID } from 'crypto';

/**
 * @param {string} eventId
 * @param {object} layout
 */
export function createEventState(eventId, layout) {
  return {
    eventId,
    layout,
    clients: new Map(),
    seatIndex: new Map(),
    tokenIndex: new Map(),
    currentPattern: null,
    createdAt: Date.now()
  };
}

/**
 * @param {ReturnType<typeof createEventState>} event
 */
export function serializeClients(event) {
  return Array.from(event.clients.entries()).map(([id, client]) => ({
    id,
    sectionId: client.sectionId,
    tableId: client.tableId,
    seatIndex: client.seatIndex,
    seatKey: client.seatKey,
    row: client.row,
    col: client.col,
    label: client.label,
    isSimulated: client.isSimulated || false
  }));
}

/**
 * @param {ReturnType<typeof createEventState>} event
 */
export function serializeOccupancy(event) {
  const occupied = [];
  for (const [seatKey, data] of event.seatIndex) {
    occupied.push({
      seatKey,
      sectionId: data.sectionId,
      tableId: data.tableId,
      seatIndex: data.seatIndex
    });
  }
  return occupied;
}

export function createSessionToken() {
  return randomUUID();
}
