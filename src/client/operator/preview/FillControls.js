import { ShowSimulator } from '../../../shared/patterns/simulator.js';

export { ShowSimulator };

/**
 * Controles de fill simulado + dry-run.
 */
export class FillControls {
  /**
   * @param {object} options
   * @param {(percent: number) => void} options.onFillChange
   * @param {(enabled: boolean) => void} options.onDryRunChange
   */
  constructor({ fillSlider, dryRunToggle, onFillChange, onDryRunChange }) {
    this.fillSlider = fillSlider;
    this.dryRunToggle = dryRunToggle;
    this.onFillChange = onFillChange;
    this.onDryRunChange = onDryRunChange;

    if (fillSlider) {
      fillSlider.addEventListener('input', () => {
        onFillChange(parseInt(fillSlider.value, 10));
      });
    }

    if (dryRunToggle) {
      dryRunToggle.addEventListener('change', () => {
        onDryRunChange(dryRunToggle.checked);
      });
    }
  }

  getFillPercent() {
    return parseInt(this.fillSlider?.value || '100', 10);
  }

  isDryRun() {
    return !!this.dryRunToggle?.checked;
  }
}
