const SUPPORTED_ACTIONS = new Set([
  'solid',
  'off',
  'flash',
  'pulse',
  'strobe',
  'sparkle',
  'burst'
]);

const DEFAULTS = {
  color: '#ffffff',
  duration: 3000,
  intensity: 1,
  tempo: 120,
  leadMs: 1000,
  maxDuration: 15000
};

export function normalizeScene(scene = {}, options = {}) {
  const action = String(scene.action || '').trim();
  if (!SUPPORTED_ACTIONS.has(action)) {
    throw new Error(`Unsupported scene: ${action || 'missing action'}`);
  }

  const now = Number.isFinite(options.now) ? options.now : Date.now();
  const leadMs = clampNumber(options.leadMs, 0, 10000, DEFAULTS.leadMs);

  return {
    action,
    color: normalizeColor(scene.color || DEFAULTS.color),
    duration: clampNumber(
      scene.duration,
      0,
      DEFAULTS.maxDuration,
      action === 'solid' || action === 'off' ? 0 : DEFAULTS.duration
    ),
    intensity: clampNumber(scene.intensity, 0, 1, DEFAULTS.intensity),
    tempo: clampNumber(scene.tempo, 30, 240, DEFAULTS.tempo),
    useTorch: Boolean(scene.useTorch),
    executeAt: Number.isFinite(scene.executeAt) ? scene.executeAt : now + leadMs
  };
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function normalizeColor(color) {
  const value = String(color).trim().toLowerCase();
  const shortHex = /^#([0-9a-f]{3})$/i.exec(value);
  if (shortHex) {
    return `#${shortHex[1]
      .split('')
      .map((ch) => ch + ch)
      .join('')}`;
  }
  if (/^#[0-9a-f]{6}$/i.test(value)) return value;
  return DEFAULTS.color;
}

