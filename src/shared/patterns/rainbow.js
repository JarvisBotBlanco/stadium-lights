/**
 * @param {import('../layout/parseLayout.js').ParsedSeat} seat
 * @param {{ rows: number, cols: number }} grid
 * @param {object} pattern
 * @returns {string|null}
 */
export function computeRainbowColor(seat, grid, pattern) {
  const hue =
    ((seat.col / Math.max(grid.cols, 1)) * 360 +
      (seat.row / Math.max(grid.rows, 1)) * 30) %
    360;
  return `hsl(${hue}, 100%, 50%)`;
}
