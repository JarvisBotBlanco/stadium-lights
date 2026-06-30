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

