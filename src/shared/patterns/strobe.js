/**
 * @param {object} pattern
 * @param {number} elapsedMs
 * @returns {string|null|'off'}
 */
export function computeStrobeState(pattern, elapsedMs) {
  const interval = pattern.interval || 150;
  const duration = pattern.duration || 3000;
  const color = pattern.color || '#FFFFFF';

  if (elapsedMs >= duration) return null;
  const phase = Math.floor(elapsedMs / interval);
  return phase % 2 === 0 ? color : 'off';
}

export async function executeStrobe(pattern, { showColor, hideColor }) {
  const interval = pattern.interval || 150;
  const duration = pattern.duration || 3000;
  const color = pattern.color || '#FFFFFF';
  const start = Date.now();

  while (Date.now() - start < duration) {
    showColor(color);
    await new Promise((r) => setTimeout(r, interval));
    hideColor();
    await new Promise((r) => setTimeout(r, interval));
  }
  hideColor();
}

export function getStrobeDuration(pattern) {
  return pattern.duration || 3000;
}
