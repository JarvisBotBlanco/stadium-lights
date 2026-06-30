/**
 * Orden físico de mesas para olas (row asc, col asc).
 * @param {ReturnType<import('./parseLayout.js').parseLayout>} layout
 * @returns {Map<string, number>}
 */
export function buildTableWaveIndex(layout) {
  const tables = new Map();

  for (const section of layout.sections) {
    for (const table of section.tables) {
      const key = `${section.id}:${table.id}`;
      if (!tables.has(key)) {
        tables.set(key, { tableRow: table.row, tableCol: table.col, key });
      }
    }
  }

  const sorted = [...tables.values()].sort((a, b) => {
    if (a.tableRow !== b.tableRow) return a.tableRow - b.tableRow;
    return a.tableCol - b.tableCol;
  });

  const indexByKey = new Map();
  sorted.forEach((t, i) => indexByKey.set(t.key, i));
  return indexByKey;
}

/**
 * @param {import('./parseLayout.js').ParsedSeat} seat
 * @param {Map<string, number>} tableWaveIndex
 * @returns {number}
 */
export function getWaveStepForSeat(seat, tableWaveIndex) {
  const key = `${seat.sectionId}:${seat.tableId}`;
  return tableWaveIndex.get(key) ?? 0;
}
