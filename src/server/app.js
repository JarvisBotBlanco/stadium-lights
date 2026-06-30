import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  createHealthRouter,
  createEventsRouter,
  createLayoutsRouter,
  createTriggerRouter
} from './routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '../../public');

export function createApp(services) {
  const app = express();
  app.use(express.json());
  app.use(express.static(publicDir));

  createHealthRouter(services.eventService).apply(app, '/health');
  createEventsRouter(services.eventService, services.layoutService).apply(
    app,
    '/api/events'
  );
  createLayoutsRouter(services.layoutService).apply(app, '/api/layout');
  createLayoutsRouter(services.layoutService).apply(app, '/api/layouts');
  createTriggerRouter(services.eventService, services.patternService).apply(
    app,
    '/api/trigger'
  );

  return app;
}
