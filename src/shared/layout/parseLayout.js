const SEAT_SPREAD = 10;

/**
 * @typedef {Object} ParsedSeat
 * @property {string} sectionId
 * @property {string} sectionLabel
 * @property {string} tableId
 * @property {string} tableLabel
 * @property {number} seatIndex
 * @property {number} tableRow
 * @property {number} tableCol
 * @property {number} row
 * @property {number} col
 * @property {string} seatKey
 * @property {string} label
 */

/**
 * @param {object} raw
 * @returns {object}
 */
export function parseLayout(raw) {
  if (!raw || !Array.isArray(raw.sections) || raw.sections.length === 0) {
    throw new Error('Layout inválido: se requiere al menos una sección');
  }

  /** @type {ParsedSeat[]} */
  const seats = [];
  let gridRows = 0;
  let gridCols = 0;

  for (const section of raw.sections) {
    if (!section.id || !Array.isArray(section.tables)) {
      throw new Error(`Sección inválida: ${section.id || 'sin id'}`);
    }

    for (const table of section.tables) {
      if (!table.id || typeof table.seats !== 'number' || table.seats < 1) {
        throw new Error(`Mesa inválida en ${section.id}: ${table.id || 'sin id'}`);
      }

      for (let seatIndex = 0; seatIndex < table.seats; seatIndex++) {
        const row = table.row;
        const col = table.col * SEAT_SPREAD + seatIndex;
        gridRows = Math.max(gridRows, row + 1);
        gridCols = Math.max(gridCols, col + 1);

        seats.push({
          sectionId: section.id,
          sectionLabel: section.label || section.id,
          tableId: table.id,
          tableLabel: table.label || table.id,
          seatIndex,
          tableRow: table.row,
          tableCol: table.col,
          row,
          col,
          seatKey: `${section.id}:${table.id}:${seatIndex}`,
          label: `${section.label || section.id} · ${table.label || table.id} · Asiento ${seatIndex + 1}`
        });
      }
    }
  }

  return {
    ...raw,
    seats,
    grid: { rows: gridRows, cols: gridCols },
    seatCount: seats.length
  };
}

/**
 * @param {ReturnType<typeof parseLayout>} layout
 * @param {string} seatKey
 * @returns {ParsedSeat|undefined}
 */
export function findSeatByKey(layout, seatKey) {
  return layout.seats.find((s) => s.seatKey === seatKey);
}

/**
 * @param {ReturnType<typeof parseLayout>} layout
 * @returns {Map<string, ParsedSeat>}
 */
export function buildSeatMap(layout) {
  return new Map(layout.seats.map((s) => [s.seatKey, s]));
}
