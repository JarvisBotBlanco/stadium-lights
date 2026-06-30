/**
 * @param {import('./parseLayout.js').ParsedSeat} seat
 * @returns {{ row: number, col: number }}
 */
export function seatToGrid(seat) {
  return { row: seat.row, col: seat.col };
}

/**
 * @param {ReturnType<import('./parseLayout.js').parseLayout>} layout
 * @param {string} sectionId
 * @param {string} tableId
 * @param {number} seatIndex
 * @returns {import('./parseLayout.js').ParsedSeat|undefined}
 */
export function resolveSeat(layout, sectionId, tableId, seatIndex) {
  return layout.seats.find(
    (s) =>
      s.sectionId === sectionId &&
      s.tableId === tableId &&
      s.seatIndex === seatIndex
  );
}
