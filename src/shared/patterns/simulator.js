import { computeSeatColor, getPatternDuration } from '../patterns/index.js';
import { buildTableWaveIndex } from '../layout/waveOrder.js';

/**
 * Simula un patrón sobre todos los asientos del layout.
 */
export class ShowSimulator {
  /**
   * @param {ReturnType<import('../layout/parseLayout.js').parseLayout>} layout
   * @param {object} [options]
   */
  constructor(layout, options = {}) {
    this.layout = layout;
    this.fillPercent = options.fillPercent ?? 100;
    this.realOccupied = new Set(options.realSeatKeys || []);
    this.tableWaveIndex = buildTableWaveIndex(layout);
    this._rafId = null;
    this._running = false;
    this.onFrame = options.onFrame || (() => {});
  }

  setFillPercent(percent) {
    this.fillPercent = Math.max(0, Math.min(100, percent));
  }

  setRealOccupied(seatKeys) {
    this.realOccupied = new Set(seatKeys);
  }

  /**
   * Asientos activos según fill % (determinístico).
   * @returns {import('../layout/parseLayout.js').ParsedSeat[]}
   */
  getActiveSeats() {
    const total = this.layout.seats.length;
    const count = Math.ceil((this.fillPercent / 100) * total);
    return this.layout.seats.slice(0, count);
  }

  /**
   * @param {object} pattern
   * @param {number} [startTime]
   */
  play(pattern, startTime = Date.now()) {
    this.stop();
    this._running = true;
    const grid = this.layout.grid;
    const enriched = {
      ...pattern,
      grid,
      tableCount: this.tableWaveIndex.size
    };
    const duration = getPatternDuration(enriched, grid) || 5000;
    const endTime = startTime + duration + 500;

    const tick = () => {
      if (!this._running) return;
      const now = Date.now();
      const elapsed = now - startTime;
      const colors = new Map();

      for (const seat of this.getActiveSeats()) {
        const color = computeSeatColor(
          seat,
          grid,
          enriched,
          elapsed,
          this.tableWaveIndex
        );
        colors.set(seat.seatKey, {
          color,
          isReal: this.realOccupied.has(seat.seatKey)
        });
      }

      this.onFrame(colors, elapsed);

      if (now < endTime) {
        this._rafId = requestAnimationFrame(tick);
      } else {
        this._running = false;
        this.onFrame(new Map(), elapsed);
      }
    };

    this._rafId = requestAnimationFrame(tick);
  }

  stop() {
    this._running = false;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }
}
