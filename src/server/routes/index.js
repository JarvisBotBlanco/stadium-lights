export function createHealthRouter(eventService) {
  const router = expressRouter();

  router.get('/', (req, res) => {
    res.json({
      status: 'ok',
      events: eventService.getStats()
    });
  });

  return router;
}

function expressRouter() {
  const routes = [];

  return {
    get(path, handler) {
      routes.push({ method: 'get', path, handler });
    },
    post(path, handler) {
      routes.push({ method: 'post', path, handler });
    },
    apply(app, basePath) {
      for (const r of routes) {
        app[r.method](`${basePath}${r.path}`, r.handler);
      }
    }
  };
}

export function createEventsRouter(eventService, layoutService) {
  const router = expressRouter();

  router.get('/:eventId', (req, res) => {
    try {
      const event = eventService.getOrCreate(req.params.eventId);
      res.json({
        eventId: event.eventId,
        name: event.layout.name,
        layout: event.layout,
        participants: event.clients.size
      });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  });

  router.post('/', (req, res) => {
    const { eventId, presetId, layout } = req.body || {};
    if (!eventId) {
      return res.status(400).json({ error: 'eventId requerido' });
    }

    try {
      let event;
      if (layout) {
        event = eventService.createEventWithLayout(eventId, layout);
      } else {
        event = eventService.createEvent(eventId, presetId || 'hipico-demo');
      }
      res.json({
        ok: true,
        eventId: event.eventId,
        layout: event.layout,
        seatCount: event.layout.seatCount
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  return router;
}

export function createLayoutsRouter(layoutService) {
  const router = expressRouter();

  router.get('/presets', (req, res) => {
    res.json({ presets: layoutService.listPresets() });
  });

  router.get('/:eventId', (req, res) => {
    try {
      const layout = layoutService.getLayout(req.params.eventId);
      res.json(layout);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  });

  return router;
}

export function createTriggerRouter(eventService, patternService) {
  const router = expressRouter();

  router.post('/:eventId', (req, res) => {
    const event = eventService.getOrCreate(req.params.eventId);
    const payload = patternService.trigger(event, req.body || {});
    res.json({
      ok: true,
      participants: event.clients.size,
      pattern: payload
    });
  });

  return router;
}
