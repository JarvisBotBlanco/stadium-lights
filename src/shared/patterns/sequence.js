/**
 * @param {import('../layout/parseLayout.js').ParsedSeat} seat
 * @param {object} pattern
 * @param {number} elapsedMs
 * @returns {string|null}
 */
export function computeSequenceColor(seat, pattern, elapsedMs) {
  const { frames = [], intervalMs = 500 } = pattern;
  if (!frames.length) return null;

  let t = 0;
  for (const frame of frames) {
    const duration = frame.intervalMs ?? intervalMs;
    if (elapsedMs >= t && elapsedMs < t + duration) {
      if (frame.all) return frame.all;
      if (frame.cells) {
        const cell = frame.cells.find(
          (c) => c[0] === seat.row && c[1] === seat.col
        );
        return cell ? cell[2] : null;
      }
      return null;
    }
    t += duration;
  }
  return null;
}

/**
 * @param {import('../layout/parseLayout.js').ParsedSeat} seat
 * @param {object} pattern
 * @param {{ showColor: Function, hideColor: Function }} callbacks
 */
export async function executeSequence(seat, pattern, { showColor, hideColor }) {
  const { frames = [], intervalMs = 500 } = pattern;
  for (const frame of frames) {
    if (frame.all) {
      showColor(frame.all);
    } else if (frame.cells) {
      const cell = frame.cells.find(
        (c) => c[0] === seat.row && c[1] === seat.col
      );
      if (cell) showColor(cell[2]);
      else hideColor();
    }
    await new Promise((r) =>
      setTimeout(r, frame.intervalMs ?? intervalMs)
    );
  }
  hideColor();
}

export function getSequenceDuration(pattern) {
  const { frames = [], intervalMs = 500 } = pattern;
  return frames.reduce(
    (sum, f) => sum + (f.intervalMs ?? intervalMs),
    0
  );
}
