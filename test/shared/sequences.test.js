import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SHOW_SEQUENCES,
  expandSequence
} from '../../src/shared/show/sequences.js';

test('expands sequence steps with accumulated delays', () => {
  const steps = expandSequence({
    steps: [
      { delay: 0, scene: { action: 'off' } },
      { delay: 500, scene: { action: 'pulse', color: '#ffffff' } },
      { delay: 1200, scene: { action: 'solid', color: '#1f8f4d' } }
    ]
  });

  assert.deepEqual(
    steps.map((step) => step.at),
    [0, 500, 1700]
  );
  assert.equal(steps[2].scene.action, 'solid');
});

test('built-in finale sequence ends with off', () => {
  const finale = SHOW_SEQUENCES.find((sequence) => sequence.id === 'finale');
  const steps = expandSequence(finale);

  assert.equal(steps.at(-1).scene.action, 'off');
});
