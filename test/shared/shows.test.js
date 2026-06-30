import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BUILT_IN_SHOWS,
  expandShow,
  getShowDuration,
  parseCustomShow
} from '../../src/shared/show/shows.js';

test('expands show cues with absolute times and continuous hold scenes', () => {
  const cues = expandShow({
    cues: [
      { at: 0, scene: { action: 'solid', color: '#1f8f4d' } },
      { at: 1200, scene: { action: 'sparkle', duration: 2500 } },
      { at: 3700, scene: { action: 'solid', color: '#ffffff' } }
    ]
  });

  assert.deepEqual(
    cues.map((cue) => cue.at),
    [0, 1200, 3700]
  );
  assert.equal(cues[1].scene.action, 'sparkle');
});

test('calculates show duration from cue time plus scene duration', () => {
  const duration = getShowDuration({
    cues: [
      { at: 0, scene: { action: 'solid', color: '#1f8f4d' } },
      { at: 1000, scene: { action: 'strobe', duration: 2500 } },
      { at: 3800, scene: { action: 'off' } }
    ]
  });

  assert.equal(duration, 3800);
});

test('built-in opening show has summary and duration', () => {
  const opening = BUILT_IN_SHOWS.find((show) => show.id === 'opening');

  assert.equal(opening.summary.length > 10, true);
  assert.equal(getShowDuration(opening) > 10000, true);
});

test('parses custom show JSON into a runnable show', () => {
  const show = parseCustomShow(
    JSON.stringify({
      label: 'Custom largo',
      summary: 'Verde, sparkle y final blanco',
      cues: [
        { at: 0, scene: { action: 'solid', color: '#1f8f4d' } },
        { at: 2000, scene: { action: 'sparkle', duration: 3000 } }
      ]
    })
  );

  assert.equal(show.label, 'Custom largo');
  assert.equal(show.cues.length, 2);
});
