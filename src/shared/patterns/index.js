import { computeRainbowColor } from './rainbow.js';
import { computeWaveColor } from './wave.js';
import { computeSequenceColor, getSequenceDuration } from './sequence.js';
import { computeStrobeState, getStrobeDuration } from './strobe.js';
import { computeColorAt, computeFlashColor, getFlashDuration } from './color.js';
import { executeWave } from './wave.js';
import { executeSequence } from './sequence.js';
import { executeStrobe } from './strobe.js';
import { executeFlash } from './color.js';
import { waitUntilExecute } from '../sync/clock.js';

/**
 * @param {import('../layout/parseLayout.js').ParsedSeat} seat
 * @param {{ rows: number, cols: number }} grid
 * @param {object} pattern
 * @param {number} elapsedMs
 * @param {Map<string, number>} [tableWaveIndex]
 * @returns {string|null}
 */
export function computeSeatColor(seat, grid, pattern, elapsedMs, tableWaveIndex) {
  const enriched = { ...pattern, grid };
  if (pattern.action === 'wave' && pattern.direction === 'table-order' && tableWaveIndex) {
    enriched.waveStep = tableWaveIndex.get(`${seat.sectionId}:${seat.tableId}`) ?? 0;
  }

  switch (pattern.action) {
    case 'color':
      return computeColorAt(seat, enriched, elapsedMs);
    case 'off':
      return null;
    case 'flash':
      return computeFlashColor(seat, enriched, elapsedMs);
    case 'strobe':
      return computeStrobeState(enriched, elapsedMs) === 'off'
        ? null
        : computeStrobeState(enriched, elapsedMs);
    case 'wave':
      return computeWaveColor(seat, grid, enriched, elapsedMs);
    case 'sequence':
      return computeSequenceColor(seat, enriched, elapsedMs);
    case 'rainbow':
      return computeRainbowColor(seat, grid, enriched);
    default:
      return null;
  }
}

/**
 * @returns {number}
 */
export function getPatternDuration(pattern, grid) {
  switch (pattern.action) {
    case 'strobe':
      return getStrobeDuration(pattern);
    case 'flash':
      return getFlashDuration(pattern);
    case 'sequence':
      return getSequenceDuration(pattern);
    case 'rainbow':
      return pattern.duration || 5000;
    case 'wave': {
      const speed = pattern.speed || 200;
      if (pattern.direction === 'table-order') {
        const tableCount = pattern.tableCount || grid.cols;
        return tableCount * speed + speed * 3;
      }
      const steps =
        pattern.direction === 'left-right' || pattern.direction === 'right-left'
          ? grid.cols
          : grid.rows;
      return steps * speed + speed * 3;
    }
    case 'color':
    case 'off':
    default:
      return 0;
  }
}

/**
 * @param {import('../layout/parseLayout.js').ParsedSeat} seat
 * @param {object} pattern
 * @param {number} clockOffset
 * @param {{ showColor: Function, hideColor: Function }} callbacks
 */
export async function executePattern(seat, pattern, clockOffset, callbacks) {
  if (pattern.executeAt) {
    await waitUntilExecute(pattern.executeAt, clockOffset);
  }

  const ctx = { ...callbacks, seat, grid: pattern.grid };

  switch (pattern.action) {
    case 'color':
      callbacks.showColor(pattern.color || '#FFFFFF');
      break;
    case 'off':
      callbacks.hideColor();
      break;
    case 'flash':
      await executeFlash(pattern, callbacks);
      break;
    case 'strobe':
      await executeStrobe(pattern, callbacks);
      break;
    case 'wave':
      await executeWave(seat, pattern, callbacks);
      break;
    case 'sequence':
      await executeSequence(seat, pattern, callbacks);
      break;
    case 'rainbow':
      callbacks.showColor(computeRainbowColor(seat, pattern.grid, pattern));
      await new Promise((r) => setTimeout(r, pattern.duration || 5000));
      callbacks.hideColor();
      break;
    default:
      break;
  }

  return ctx;
}

export { buildPresetPatterns } from './presets.js';
