import crypto from 'crypto';

export class SimpleShowService {
  constructor(options = {}) {
    this.groupCount = options.groupCount || 8;
    this.events = new Map();
    this.socketIndex = new Map();
  }

  join(eventId, socketId, data = {}) {
    const event = this.getOrCreateEvent(eventId);
    const sessionToken = data.sessionToken || createToken();
    const existing = event.tokens.get(sessionToken);
    const groupId = existing?.groupId ?? groupForToken(sessionToken, this.groupCount);

    if (existing?.socketId) {
      event.participants.delete(existing.socketId);
      this.socketIndex.delete(existing.socketId);
    }

    const participant = {
      eventId,
      socketId,
      sessionToken,
      groupId,
      capabilities: normalizeCapabilities(data.capabilities),
      joinedAt: Date.now()
    };

    event.participants.set(socketId, participant);
    event.tokens.set(sessionToken, {
      groupId,
      socketId,
      lastSeenAt: participant.joinedAt
    });
    this.socketIndex.set(socketId, eventId);

    return {
      ...participant,
      stats: this.getStats(eventId)
    };
  }

  disconnect(socketId) {
    const eventId = this.socketIndex.get(socketId);
    if (!eventId) return null;

    const event = this.events.get(eventId);
    if (!event) return null;

    const participant = event.participants.get(socketId);
    event.participants.delete(socketId);
    this.socketIndex.delete(socketId);

    if (participant) {
      const token = event.tokens.get(participant.sessionToken);
      if (token) {
        token.socketId = null;
        token.lastSeenAt = Date.now();
      }
    }

    return participant;
  }

  getStats(eventId) {
    const event = this.getOrCreateEvent(eventId);
    let torchCount = 0;
    let hapticsCount = 0;

    for (const participant of event.participants.values()) {
      if (participant.capabilities.torch) torchCount++;
      if (participant.capabilities.haptics) hapticsCount++;
    }

    const readyCount = event.participants.size;
    return {
      eventId,
      readyCount,
      torchCount,
      hapticsCount,
      screenOnlyCount: Math.max(0, readyCount - torchCount)
    };
  }

  getOrCreateEvent(eventId) {
    const id = eventId || 'hipico-demo';
    if (!this.events.has(id)) {
      this.events.set(id, {
        eventId: id,
        participants: new Map(),
        tokens: new Map()
      });
    }
    return this.events.get(id);
  }
}

function normalizeCapabilities(capabilities = {}) {
  return {
    screen: true,
    torch: Boolean(capabilities.torch),
    haptics: Boolean(capabilities.haptics),
    wakeLock: Boolean(capabilities.wakeLock),
    fullscreen: Boolean(capabilities.fullscreen)
  };
}

function groupForToken(token, groupCount) {
  let hash = 0;
  for (const ch of String(token)) {
    hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  }
  return hash % groupCount;
}

function createToken() {
  return crypto.randomBytes(16).toString('hex');
}

