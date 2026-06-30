export const BUILT_IN_SHOWS = [
  {
    id: 'opening',
    label: 'Apertura Hipico',
    summary: 'Negro, pulso blanco, verde Hipico, sparkle y blanco.',
    cues: [
      { at: 0, scene: { action: 'off' } },
      { at: 800, scene: { action: 'pulse', color: '#ffffff', duration: 3000 } },
      { at: 3800, scene: { action: 'solid', color: '#1f8f4d' } },
      { at: 6500, scene: { action: 'sparkle', color: '#ffffff', duration: 4200, useTorch: true } },
      { at: 10700, scene: { action: 'solid', color: '#ffffff' } },
      { at: 12800, scene: { action: 'solid', color: '#1f8f4d' } }
    ]
  },
  {
    id: 'celebration-show',
    label: 'Celebracion',
    summary: 'Verde sostenido, rafaga por grupos, sparkle y cierre blanco.',
    cues: [
      { at: 0, scene: { action: 'solid', color: '#1f8f4d' } },
      { at: 1800, scene: { action: 'burst', color: '#ffffff', duration: 3600, useTorch: true } },
      { at: 5400, scene: { action: 'solid', color: '#1f8f4d' } },
      { at: 6500, scene: { action: 'sparkle', color: '#ffffff', duration: 4800, useTorch: true } },
      { at: 11300, scene: { action: 'solid', color: '#ffffff' } },
      { at: 13500, scene: { action: 'solid', color: '#1f8f4d' } }
    ]
  },
  {
    id: 'final-hit',
    label: 'Final fuerte',
    summary: 'Pulso, estrobo continuo, flash final y negro limpio.',
    cues: [
      { at: 0, scene: { action: 'pulse', color: '#ffffff', duration: 2800 } },
      { at: 2800, scene: { action: 'solid', color: '#ffffff' } },
      { at: 3600, scene: { action: 'strobe', color: '#ffffff', duration: 3000, tempo: 210, useTorch: true } },
      { at: 6600, scene: { action: 'solid', color: '#1f8f4d' } },
      { at: 8200, scene: { action: 'flash', color: '#ffffff', duration: 220, useTorch: true } },
      { at: 9000, scene: { action: 'off' } }
    ]
  },
  {
    id: 'ambient-loop',
    label: 'Ambiente',
    summary: 'Verde suave, pulsos y sparkle ligero para espera activa.',
    cues: [
      { at: 0, scene: { action: 'solid', color: '#1f8f4d' } },
      { at: 6000, scene: { action: 'pulse', color: '#ffffff', duration: 3500 } },
      { at: 9500, scene: { action: 'solid', color: '#1f8f4d' } },
      { at: 15000, scene: { action: 'sparkle', color: '#ffffff', duration: 5000, useTorch: false } },
      { at: 20000, scene: { action: 'solid', color: '#1f8f4d' } },
      { at: 30000, scene: { action: 'off' } }
    ]
  },
  {
    id: 'safe-reset',
    label: 'Reset seguro',
    summary: 'Apaga todas las pantallas y flashes.',
    cues: [
      { at: 0, scene: { action: 'off' } }
    ]
  }
];

export function expandShow(show) {
  return (show?.cues || [])
    .map((cue) => ({
      at: Math.max(0, Number(cue.at) || 0),
      scene: { ...cue.scene }
    }))
    .sort((a, b) => a.at - b.at);
}

export function getShowDuration(show) {
  return expandShow(show).reduce((max, cue) => {
    const duration = Number(cue.scene.duration) || 0;
    return Math.max(max, cue.at + duration);
  }, 0);
}

export function formatDuration(ms) {
  return `${Math.ceil(ms / 1000)}s`;
}

export function parseCustomShow(raw) {
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Show custom invalido');
  }
  if (!Array.isArray(parsed.cues) || parsed.cues.length === 0) {
    throw new Error('El show necesita cues');
  }

  return {
    id: 'custom',
    label: String(parsed.label || 'Show custom').slice(0, 40),
    summary: String(parsed.summary || 'Show custom').slice(0, 120),
    cues: parsed.cues.map((cue) => ({
      at: Math.max(0, Number(cue.at) || 0),
      scene: { ...(cue.scene || {}) }
    }))
  };
}
