import { parseLayout } from '../../../shared/layout/parseLayout.js';

/**
 * Renderiza gradas/mesas como SVG interactivo.
 */
export class VenueCanvas {
  /**
   * @param {HTMLElement} container
   */
  constructor(container) {
    this.container = container;
    this.layout = null;
    this.connectedKeys = new Set();
    this.colors = new Map();
    this.onSeatClick = null;
    this.svg = null;
  }

  /**
   * @param {ReturnType<typeof parseLayout>} layout
   */
  setLayout(layout) {
    this.layout = layout;
    this.render();
  }

  setConnected(clients) {
    this.connectedKeys = new Set(
      (clients || []).map((c) => c.seatKey).filter(Boolean)
    );
    this.updateSeatStyles();
  }

  /**
   * @param {Map<string, { color: string|null, isReal: boolean }>} colorMap
   */
  applyColors(colorMap) {
    this.colors = colorMap || new Map();
    this.updateSeatStyles();
  }

  render() {
    if (!this.layout) return;

    const cellW = 36;
    const cellH = 28;
    const pad = 40;
    const sectionGap = 30;

    let yOffset = pad;
    const parts = [];

    parts.push(
      `<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 800 ${this._calcHeight(cellH, pad, sectionGap)}" class="venue-svg">`
    );

    parts.push(
      `<rect x="280" y="10" width="240" height="60" rx="8" fill="#21262d" stroke="#30363d"/>`,
      `<text x="400" y="48" text-anchor="middle" fill="#8b949e" font-size="14">PISTA / ARENA</text>`
    );

    for (const section of this.layout.sections) {
      const maxCol = Math.max(...section.tables.map((t) => t.col), 0);
      const maxRow = Math.max(...section.tables.map((t) => t.row), 0);
      const sectionW = (maxCol + 1) * (cellW + 4) + 20;

      parts.push(
        `<text x="20" y="${yOffset + 14}" fill="#58a6ff" font-size="13" font-weight="600">${section.label}</text>`
      );
      yOffset += 22;

      for (const table of section.tables) {
        const x = 20 + table.col * (cellW + 4);
        const y = yOffset + table.row * (cellH + 4);
        const seats = table.seats;

        for (let s = 0; s < seats; s++) {
          const seatKey = `${section.id}:${table.id}:${s}`;
          const sx = x + (s % 3) * 11;
          const sy = y + Math.floor(s / 3) * 11;
          parts.push(
            `<rect class="seat" data-key="${seatKey}" data-section="${section.id}" data-table="${table.id}" data-seat="${s}" x="${sx}" y="${sy}" width="9" height="9" rx="2" fill="#21262d" stroke="#30363d"/>`
          );
        }

        parts.push(
          `<rect class="table-bg" x="${x - 2}" y="${y - 2}" width="${Math.min(seats, 3) * 11 + 4}" height="${Math.ceil(seats / 3) * 11 + 4}" rx="4" fill="none" stroke="#484f58" stroke-dasharray="2"/>`,
          `<text x="${x}" y="${y - 6}" fill="#484f58" font-size="9">${table.label || table.id}</text>`
        );
      }

      yOffset += (maxRow + 1) * (cellH + 4) + sectionGap;
    }

    parts.push('</svg>');
    this.container.innerHTML = parts.join('\n');
    this.svg = this.container.querySelector('svg');

    this.container.querySelectorAll('.seat').forEach((el) => {
      el.addEventListener('click', () => {
        if (this.onSeatClick) {
          this.onSeatClick({
            sectionId: el.dataset.section,
            tableId: el.dataset.table,
            seatIndex: parseInt(el.dataset.seat, 10),
            seatKey: el.dataset.key
          });
        }
      });
    });

    this.updateSeatStyles();
  }

  _calcHeight(cellH, pad, sectionGap) {
    let h = 100 + pad;
    for (const section of this.layout.sections) {
      const maxRow = Math.max(...section.tables.map((t) => t.row), 0);
      h += 22 + (maxRow + 1) * (cellH + 4) + sectionGap;
    }
    return Math.max(h, 400);
  }

  updateSeatStyles() {
    if (!this.container) return;
    this.container.querySelectorAll('.seat').forEach((el) => {
      const key = el.dataset.key;
      const colorData = this.colors.get(key);
      const isConnected = this.connectedKeys.has(key);

      if (colorData?.color) {
        el.setAttribute('fill', colorData.color);
        el.setAttribute('stroke', colorData.color);
      } else if (isConnected) {
        el.setAttribute('fill', '#238636');
        el.setAttribute('stroke', '#3fb950');
      } else if (colorData && !colorData.isReal) {
        el.setAttribute('fill', '#484f58');
        el.setAttribute('stroke', '#6e7681');
      } else {
        el.setAttribute('fill', '#21262d');
        el.setAttribute('stroke', '#30363d');
      }
    });
  }
}
