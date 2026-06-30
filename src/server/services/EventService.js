import { createEventState } from '../domain/Event.js';

export class EventService {
  /** @type {Map<string, ReturnType<typeof createEventState>>} */
  events = new Map();

  /**
   * @param {import('./LayoutService.js').LayoutService} layoutService
   */
  constructor(layoutService) {
    this.layoutService = layoutService;
  }

  /**
   * @param {string} eventId
   */
  getOrCreate(eventId) {
    if (!this.events.has(eventId)) {
      const layout = this.layoutService.getLayout(eventId);
      this.events.set(eventId, createEventState(eventId, layout));
    }
    return this.events.get(eventId);
  }

  /**
   * @param {string} eventId
   * @param {string} [presetId]
   */
  createEvent(eventId, presetId) {
    const layout = this.layoutService.createFromPreset(eventId, presetId);
    const event = createEventState(eventId, layout);
    this.events.set(eventId, event);
    return event;
  }

  /**
   * @param {string} eventId
   * @param {object} rawLayout
   */
  createEventWithLayout(eventId, rawLayout) {
    const layout = this.layoutService.registerEventLayout(eventId, rawLayout);
    const event = createEventState(eventId, layout);
    this.events.set(eventId, event);
    return event;
  }

  getStats() {
    const stats = {};
    for (const [id, event] of this.events) {
      stats[id] = {
        participants: event.clients.size,
        seats: event.layout.seatCount,
        occupancy: event.seatIndex.size
      };
    }
    return stats;
  }
}
