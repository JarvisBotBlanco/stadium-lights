import http from 'http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { LayoutService } from './services/LayoutService.js';
import { EventService } from './services/EventService.js';
import { OccupancyService } from './services/OccupancyService.js';
import { PatternBroadcastService } from './services/PatternBroadcastService.js';
import { SimpleShowService } from './services/SimpleShowService.js';
import {
  registerSimpleShowHandlers,
  registerParticipantHandlers,
  registerOperatorHandlers
} from './socket/handlers.js';

const layoutService = new LayoutService();
const eventService = new EventService(layoutService);
const occupancyService = new OccupancyService();
const simpleShowService = new SimpleShowService();
const services = {
  layoutService,
  eventService,
  occupancyService,
  simpleShowService,
  patternService: null
};

const app = createApp(services);
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  pingTimeout: 30000,
  pingInterval: 10000
});

services.patternService = new PatternBroadcastService(io);

registerSimpleShowHandlers(io, services);
registerParticipantHandlers(io, services);
registerOperatorHandlers(io, services);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🏟️ Stadium Lights corriendo en http://localhost:${PORT}`);
  console.log(`📱 App pública:     http://localhost:${PORT}/`);
  console.log(`🎛️ Operador:        http://localhost:${PORT}/operator.html`);
  console.log(`❤️ Health:          http://localhost:${PORT}/health\n`);
});
