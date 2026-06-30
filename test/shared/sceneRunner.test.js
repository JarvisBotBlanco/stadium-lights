import test from 'node:test';
import assert from 'node:assert/strict';
import { SceneRunner } from '../../src/client/audience/show/SceneRunner.js';

test('flash turns screen and torch on then off', async () => {
  const calls = [];
  const runner = new SceneRunner({
    screen: {
      show: (color) => calls.push(['screen:show', color]),
      off: () => calls.push(['screen:off'])
    },
    torch: {
      set: (enabled) => calls.push(['torch:set', enabled])
    },
    haptics: { trigger: () => calls.push(['haptics']) },
    wait: () => Promise.resolve(),
    now: () => 1000
  });

  await runner.run({
    action: 'flash',
    color: '#ffffff',
    duration: 100,
    useTorch: true,
    executeAt: 900
  });

  assert.deepEqual(calls, [
    ['screen:show', '#ffffff'],
    ['torch:set', true],
    ['haptics'],
    ['torch:set', false],
    ['screen:off']
  ]);
});

test('off clears screen and torch', async () => {
  const calls = [];
  const runner = new SceneRunner({
    screen: {
      show: (color) => calls.push(['screen:show', color]),
      off: () => calls.push(['screen:off'])
    },
    torch: {
      set: (enabled) => calls.push(['torch:set', enabled])
    },
    haptics: { trigger: () => calls.push(['haptics']) },
    wait: () => Promise.resolve(),
    now: () => 1000
  });

  await runner.run({ action: 'off', executeAt: 900 });

  assert.deepEqual(calls, [['torch:set', false], ['screen:off']]);
});

