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

