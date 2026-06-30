export const SHOW_SEQUENCES = [
  {
    id: 'elegant-entry',
    label: 'Entrada elegante',
    steps: [
      { delay: 0, scene: { action: 'off' } },
      { delay: 900, scene: { action: 'pulse', color: '#ffffff', duration: 2600 } },
      { delay: 2800, scene: { action: 'solid', color: '#1f8f4d' } }
    ]
  },
  {
    id: 'big-moment',
    label: 'Momento fuerte',
    steps: [
      { delay: 0, scene: { action: 'flash', color: '#ffffff', duration: 180, useTorch: true } },
      { delay: 700, scene: { action: 'strobe', color: '#ffffff', duration: 2200, tempo: 190, useTorch: true } },
      { delay: 2600, scene: { action: 'sparkle', color: '#ffffff', duration: 3600, useTorch: true } }
    ]
  },
  {
    id: 'celebration',
    label: 'Celebracion',
    steps: [
      { delay: 0, scene: { action: 'solid', color: '#1f8f4d' } },
      { delay: 1300, scene: { action: 'sparkle', color: '#ffffff', duration: 3800, useTorch: true } },
      { delay: 3800, scene: { action: 'burst', color: '#ffffff', duration: 3200, useTorch: true } },
      { delay: 3200, scene: { action: 'solid', color: '#ffffff' } }
    ]
  },
  {
    id: 'finale',
    label: 'Final',
    steps: [
      { delay: 0, scene: { action: 'pulse', color: '#ffffff', duration: 2500 } },
      { delay: 2400, scene: { action: 'strobe', color: '#ffffff', duration: 2600, tempo: 210, useTorch: true } },
      { delay: 2600, scene: { action: 'flash', color: '#ffffff', duration: 220, useTorch: true } },
      { delay: 900, scene: { action: 'off' } }
    ]
  },
  {
    id: 'safe-reset',
    label: 'Reset seguro',
    steps: [
      { delay: 0, scene: { action: 'off' } }
    ]
  }
];

export function expandSequence(sequence) {
  let at = 0;
  return (sequence?.steps || []).map((step) => {
    at += Number(step.delay) || 0;
    return {
      at,
      scene: { ...step.scene }
    };
  });
}
