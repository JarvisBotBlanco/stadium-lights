/**
 * @param {import('../layout/parseLayout.js').ParsedSeat} seat
 * @param {{ rows: number, cols: number }} grid
 * @param {object} pattern
 * @param {number} elapsedMs
 * @returns {string|null}
 */
export function computeWaveColor(seat, grid, pattern, elapsedMs) {
  const { direction = 'left-right', speed = 200, color = '#007AFF' } = pattern;
  const delay = speed;
  const holdMs = delay * 3;
  let steps;

  if (direction === 'left-right') {
    steps = seat.col;
  } else if (direction === 'right-left') {
    steps = grid.cols - 1 - seat.col;
  } else if (direction === 'top-bottom') {
    steps = seat.row;
  } else if (direction === 'bottom-top') {
    steps = grid.rows - 1 - seat.row;
  } else if (direction === 'table-order') {
    steps = pattern.waveStep ?? 0;
  } else {
    steps = seat.col;
  }

  const startMs = steps * delay;
  if (elapsedMs < startMs) return null;
  if (elapsedMs < startMs + holdMs) return color;
  return null;
}

/**
 * @param {import('../layout/parseLayout.js').ParsedSeat} seat
 * @param {object} pattern
 * @param {number} elapsedMs
 * @returns {Promise<void>}
 */
export async function runWave(seat, pattern, elapsedMs, { showColor, hideColor }) {
  const grid = pattern.grid || { rows: 6, cols: 8 };
  const color = computeWaveColor(seat, grid, pattern, elapsedMs);
  if (color) {
    showColor(color);
    const holdMs = (pattern.speed || 200) * 3;
    await new Promise((r) => setTimeout(r, holdMs));
  }
  hideColor();
}

export async function executeWave(seat, pattern, { showColor, hideColor }) {
  const grid = pattern.grid || { rows: 6, cols: 8 };
  const { direction = 'left-right', speed = 200, color = '#007AFF' } = pattern;
  let steps;

  if (direction === 'left-right') steps = seat.col;
  else if (direction === 'right-left') steps = grid.cols - 1 - seat.col;
  else if (direction === 'top-bottom') steps = seat.row;
  else if (direction === 'bottom-top') steps = grid.rows - 1 - seat.row;
  else if (direction === 'table-order') steps = pattern.waveStep ?? 0;
  else steps = seat.col;

  await new Promise((r) => setTimeout(r, steps * speed));
  showColor(color);
  await new Promise((r) => setTimeout(r, speed * 3));
  hideColor();
}
