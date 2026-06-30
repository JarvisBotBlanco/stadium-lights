# Hipico Light Show Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mapped seat/grid demo with a simple one-QR crowd light show using screen output, optional torch, and optional haptics.

**Architecture:** Keep Node, Express, Socket.IO, and vanilla browser JavaScript. Add a simple server-side participant/scene model and a client-side scene runner with capability wrappers for screen, torch, and haptics. Remove grid and seat selection from the default audience/operator flows.

**Tech Stack:** Node.js ESM, Express, Socket.IO, esbuild, node:test, web-haptics.

---

## File Structure

- Create `test/shared/sceneValidator.test.js`: unit tests for scene normalization.
- Create `test/server/simpleShow.test.js`: unit tests for participant join/capability state.
- Create `src/shared/show/sceneValidator.js`: validates and normalizes scene commands.
- Create `src/server/services/SimpleShowService.js`: tracks event participants, capabilities, groups, and scene payloads.
- Create `src/client/audience/lights/ScreenLight.js`: screen color output.
- Create `src/client/audience/lights/TorchLight.js`: best-effort torch wrapper.
- Create `src/client/audience/lights/HapticsFeedback.js`: web-haptics wrapper with no-op fallback.
- Create `src/client/audience/show/SceneRunner.js`: executes scenes on screen/torch/haptics.
- Replace `src/client/audience/main.js`: simple one-button join flow.
- Replace `src/client/operator/main.js`: simple scene controller.
- Replace `src/client/audience/index.html`, `src/client/operator/operator.html`, `src/client/styles/audience.css`, `src/client/styles/operator.css`: simplified UI.
- Modify `src/server/socket/handlers.js`: add simple show socket events.
- Leave `src/server/routes/index.js` unchanged for this implementation; the simple show flow uses Socket.IO.
- Modify `package.json`: add `test` script and `web-haptics`.

## Task 1: Shared Scene Validation

- [ ] **Step 1: Write failing tests**

Create `test/shared/sceneValidator.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeScene } from '../../src/shared/show/sceneValidator.js';

test('normalizes supported strobe scene with bounded duration and executeAt', () => {
  const scene = normalizeScene(
    { action: 'strobe', color: '#fff', duration: 90000, useTorch: true },
    { now: 1000, leadMs: 1000 }
  );

  assert.equal(scene.action, 'strobe');
  assert.equal(scene.color, '#ffffff');
  assert.equal(scene.duration, 15000);
  assert.equal(scene.useTorch, true);
  assert.equal(scene.executeAt, 2000);
});

test('rejects unsupported scene actions', () => {
  assert.throws(
    () => normalizeScene({ action: 'flag' }, { now: 1000, leadMs: 1000 }),
    /Unsupported scene/
  );
});
```

- [ ] **Step 2: Verify tests fail**

Run: `npm test -- test/shared/sceneValidator.test.js`

Expected: FAIL because `src/shared/show/sceneValidator.js` does not exist.

- [ ] **Step 3: Implement validator**

Create `src/shared/show/sceneValidator.js` with `normalizeScene(scene, options)`.

- [ ] **Step 4: Verify tests pass**

Run: `npm test -- test/shared/sceneValidator.test.js`

Expected: PASS.

## Task 2: Simple Show Server Model

- [ ] **Step 1: Write failing tests**

Create `test/server/simpleShow.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { SimpleShowService } from '../../src/server/services/SimpleShowService.js';

test('joins participant with stable group and capability counts', () => {
  const service = new SimpleShowService({ groupCount: 8 });
  const joined = service.join('hipico-demo', 'socket-1', {
    sessionToken: 'abc',
    capabilities: { screen: true, torch: true, haptics: false }
  });

  assert.equal(joined.eventId, 'hipico-demo');
  assert.equal(joined.groupId >= 0 && joined.groupId < 8, true);

  const stats = service.getStats('hipico-demo');
  assert.equal(stats.readyCount, 1);
  assert.equal(stats.torchCount, 1);
  assert.equal(stats.screenOnlyCount, 0);
});

test('removes active participant on disconnect but preserves token group', () => {
  const service = new SimpleShowService({ groupCount: 8 });
  const first = service.join('hipico-demo', 'socket-1', {
    sessionToken: 'abc',
    capabilities: { screen: true, torch: false }
  });
  service.disconnect('socket-1');
  const second = service.join('hipico-demo', 'socket-2', {
    sessionToken: 'abc',
    capabilities: { screen: true, torch: true }
  });

  assert.equal(second.groupId, first.groupId);
  assert.equal(service.getStats('hipico-demo').torchCount, 1);
});
```

- [ ] **Step 2: Verify tests fail**

Run: `npm test -- test/server/simpleShow.test.js`

Expected: FAIL because `SimpleShowService` does not exist.

- [ ] **Step 3: Implement service**

Create `src/server/services/SimpleShowService.js`.

- [ ] **Step 4: Verify tests pass**

Run: `npm test -- test/server/simpleShow.test.js`

Expected: PASS.

## Task 3: Socket Integration

- [ ] **Step 1: Wire services**

Modify `src/server/index.js` to instantiate `SimpleShowService` and pass it into socket handlers.

- [ ] **Step 2: Add socket events**

Modify `src/server/socket/handlers.js`:

- audience emits `join_show` with `{ eventId, sessionToken, capabilities }`;
- server emits `show_joined` with `{ eventId, sessionToken, groupId, stats, serverTime }`;
- operator emits `trigger_scene` with `{ eventId, scene, dryRun }`;
- server emits `scene` to audience and `scene_sent` to operator;
- server emits `show_stats` to operator on join/disconnect.

- [ ] **Step 3: Verify build**

Run: `npm run build`

Expected: build succeeds.

## Task 4: Client Light Capabilities And Scene Runner

- [ ] **Step 1: Implement capability wrappers**

Create `ScreenLight`, `TorchLight`, and `HapticsFeedback` modules with safe fallbacks.

- [ ] **Step 2: Implement `SceneRunner`**

Create `src/client/audience/show/SceneRunner.js` supporting `solid`, `off`, `flash`, `pulse`, `strobe`, `sparkle`, and `burst`.

- [ ] **Step 3: Wire audience app**

Replace `src/client/audience/main.js` with simple event join, capability preparation, clock sync, and scene execution.

- [ ] **Step 4: Verify build**

Run: `npm run build`

Expected: build succeeds.

## Task 5: Simplified UI

- [ ] **Step 1: Replace audience HTML/CSS**

Audience page shows one CTA, ready status, and full-screen show surface.

- [ ] **Step 2: Replace operator HTML/CSS/JS**

Operator page shows event URL, QR, stats, dry-run toggle, color picker, large scene buttons, and `Apagar`.

- [ ] **Step 3: Verify build**

Run: `npm run build`

Expected: build succeeds.

## Task 6: Final Verification

- [ ] **Step 1: Run tests**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 2: Run build**

Run: `npm run build`

Expected: build succeeds.

- [ ] **Step 3: Smoke server**

Run server locally and check `/health` returns `status: ok`.
