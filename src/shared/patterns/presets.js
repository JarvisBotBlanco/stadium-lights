/**
 * Genera frames de bandera MX para un grid dado.
 * @param {{ rows: number, cols: number }} grid
 */
export function buildMexicoFlagFrames(grid) {
  const frames = [];
  for (let stripe = 0; stripe < 3; stripe++) {
    const color =
      stripe === 0 ? '#006847' : stripe === 1 ? '#FFFFFF' : '#CE1126';
    const cells = [];
    const colStart = Math.floor((stripe * grid.cols) / 3);
    const colEnd = Math.floor(((stripe + 1) * grid.cols) / 3);
    for (let r = 0; r < grid.rows; r++) {
      for (let c = colStart; c < colEnd; c++) {
        cells.push([r, c, color]);
      }
    }
    frames.push({ cells, intervalMs: 1 });
  }
  return frames;
}

/**
 * @param {{ rows: number, cols: number }} grid
 */
export function buildFireFrames(grid, count = 10) {
  const fireColors = [
    '#FF0000',
    '#FF3300',
    '#FF6600',
    '#FF9900',
    '#FFCC00',
    '#FFFF00'
  ];
  const frames = [];
  for (let i = 0; i < count; i++) {
    const cells = [];
    for (let r = 0; r < grid.rows; r++) {
      for (let c = 0; c < grid.cols; c++) {
        const colorIdx = Math.floor(Math.random() * fireColors.length);
        cells.push([r, c, fireColors[colorIdx]]);
      }
    }
    frames.push({ cells, intervalMs: 200 });
  }
  return frames;
}

export function buildHeartbeatFrames() {
  const red = '#FF0000';
  return [
    { all: red, intervalMs: 300 },
    { all: '#000000', intervalMs: 200 },
    { all: red, intervalMs: 300 },
    { all: '#000000', intervalMs: 800 },
    { all: red, intervalMs: 300 },
    { all: '#000000', intervalMs: 200 },
    { all: red, intervalMs: 300 },
    { all: '#000000', intervalMs: 1500 }
  ];
}

/**
 * Countdown ecuestre: 3-2-1-GO
 */
export function buildCountdownFrames(grid) {
  const colors = ['#FFFFFF', '#FFFF00', '#FF6600', '#00FF00'];
  const labels = ['3', '2', '1', 'GO'];
  return labels.map((label, i) => ({
    all: colors[i],
    intervalMs: 800,
    label
  }));
}

/**
 * @param {{ rows: number, cols: number }} grid
 */
export function buildPresetPatterns(grid) {
  return {
    heartbeat: {
      action: 'sequence',
      name: 'Latido',
      frames: buildHeartbeatFrames(),
      intervalMs: 300
    },
    flagMexico: {
      action: 'sequence',
      name: 'Bandera MX',
      frames: buildMexicoFlagFrames(grid),
      intervalMs: 1
    },
    fire: {
      action: 'sequence',
      name: 'Fuego',
      frames: buildFireFrames(grid),
      intervalMs: 200
    },
    countdown: {
      action: 'sequence',
      name: 'Countdown',
      frames: buildCountdownFrames(grid),
      intervalMs: 800
    }
  };
}
