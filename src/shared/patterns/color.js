/**
 * @param {import('../layout/parseLayout.js').ParsedSeat} seat
 * @param {object} pattern
 * @param {number} elapsedMs
 * @returns {string|null}
 */
export function computeColorAt(seat, pattern, elapsedMs) {
  void seat;
  void elapsedMs;
  return pattern.color || '#FFFFFF';
}

/**
 * @param {import('../layout/parseLayout.js').ParsedSeat} seat
 * @param {object} pattern
 * @param {number} elapsedMs
 * @returns {string|null}
 */
export function computeFlashColor(seat, pattern, elapsedMs) {
  void seat;
  const duration = pattern.duration || 500;
  if (elapsedMs < duration) return pattern.color || '#FFFFFF';
  return null;
}

export async function executeFlash(pattern, { showColor, hideColor }) {
  showColor(pattern.color || '#FFFFFF');
  await new Promise((r) => setTimeout(r, pattern.duration || 500));
  hideColor();
}

export function getFlashDuration(pattern) {
  return pattern.duration || 500;
}
