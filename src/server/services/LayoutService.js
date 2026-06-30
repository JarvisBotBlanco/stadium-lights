import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseLayout } from '../../shared/layout/parseLayout.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LAYOUTS_DIR = join(__dirname, '../../../layouts');

export class LayoutService {
  constructor() {
    this.presets = new Map();
    this.eventLayouts = new Map();
    this._loadPresets();
  }

  _loadPresets() {
    if (!existsSync(LAYOUTS_DIR)) return;

    for (const file of readdirSync(LAYOUTS_DIR)) {
      if (!file.endsWith('.json') || file === 'schema.json') continue;
      const raw = JSON.parse(readFileSync(join(LAYOUTS_DIR, file), 'utf-8'));
      const layout = parseLayout(raw);
      this.presets.set(layout.eventId, layout);
    }
  }

  /**
   * @param {string} eventId
   */
  getLayout(eventId) {
    if (this.eventLayouts.has(eventId)) {
      return this.eventLayouts.get(eventId);
    }
    if (this.presets.has(eventId)) {
      return this.presets.get(eventId);
    }
    if (this.presets.has('hipico-demo')) {
      return this.presets.get('hipico-demo');
    }
    const first = this.presets.values().next().value;
    if (first) return first;
    throw new Error(`Layout no encontrado para evento: ${eventId}`);
  }

  listPresets() {
    return [...this.presets.values()].map((l) => ({
      eventId: l.eventId,
      name: l.name,
      seatCount: l.seatCount,
      sections: l.sections.map((s) => ({ id: s.id, label: s.label, tables: s.tables.length }))
    }));
  }

  /**
   * @param {string} eventId
   * @param {object} rawLayout
   */
  registerEventLayout(eventId, rawLayout) {
    const layout = parseLayout({ ...rawLayout, eventId });
    this.eventLayouts.set(eventId, layout);
    return layout;
  }

  /**
   * @param {string} eventId
   * @param {string} [presetId]
   */
  createFromPreset(eventId, presetId = 'hipico-demo') {
    const preset = this.presets.get(presetId) || this.presets.values().next().value;
    if (!preset) throw new Error('No hay presets disponibles');

    const layout = parseLayout({
      ...JSON.parse(JSON.stringify(preset)),
      eventId,
      name: preset.name
    });
    this.eventLayouts.set(eventId, layout);
    return layout;
  }
}
