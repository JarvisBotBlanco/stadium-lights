import { syncClockWithSocket } from '../../shared/sync/clock.js';
import { ScreenLight } from './lights/ScreenLight.js';
import { TorchLight } from './lights/TorchLight.js';
import { HapticsFeedback } from './lights/HapticsFeedback.js';
import { WakeLockManager } from './lights/WakeLockManager.js';
import { SceneRunner } from './show/SceneRunner.js';

const params = new URLSearchParams(window.location.search);
const eventId = params.get('event') || 'hipico-demo';
const tokenKey = `hls_token_${eventId}`;

let socket;
let runner;
let torch;
let haptics;
let wakeLockManager;
let sessionToken = localStorage.getItem(tokenKey);
let clockOffset = 0;

const els = {
  start: document.getElementById('startBtn'),
  status: document.getElementById('statusText'),
  readyTitle: document.getElementById('readyTitle'),
  readyDetail: document.getElementById('readyDetail'),
  joinPanel: document.getElementById('joinPanel'),
  readyPanel: document.getElementById('readyPanel'),
  showScreen: document.getElementById('showScreen')
};

const screen = new ScreenLight(els.showScreen, {
  themeMeta: document.querySelector('meta[name="theme-color"]')
});

function setStatus(text) {
  els.status.textContent = text;
}

async function prepareDevice() {
  haptics = new HapticsFeedback();
  await haptics.trigger(35, { intensity: 0.5 });

  torch = new TorchLight();
  wakeLockManager = new WakeLockManager();

  await requestFullscreen();
  const wakeLockState = await wakeLockManager.enable();
  const torchReady = await torch.prepare();

  await haptics.trigger(torchReady ? 'success' : 60);

  return {
    screen: true,
    torch: torchReady,
    haptics: haptics.available,
    wakeLock: wakeLockState.available,
    fullscreen: Boolean(document.fullscreenElement)
  };
}

function connect(capabilities) {
  socket = io({ reconnection: true, reconnectionDelay: 1000 });

  socket.on('connect', async () => {
    setStatus('Sincronizando...');
    clockOffset = await syncClockWithSocket(socket, 5);
    socket.emit('join_show', {
      eventId,
      sessionToken,
      capabilities
    });
  });

  socket.on('disconnect', () => {
    setStatus('Reconectando...');
  });

  socket.on('show_joined', (data) => {
    sessionToken = data.sessionToken;
    localStorage.setItem(tokenKey, sessionToken);

    runner = new SceneRunner({
      screen,
      torch,
      haptics,
      groupId: data.groupId,
      groupCount: 8,
      clockOffset
    });

    els.joinPanel.hidden = true;
    els.readyPanel.hidden = false;
    els.readyTitle.textContent = 'Listo';
    els.readyDetail.textContent = data.capabilities.torch
      ? 'Pantalla y flash preparados.'
      : 'Pantalla preparada sin flash.';
    setStatus('Listo');
  });

  socket.on('show_stats', () => {});

  socket.on('scene', (scene) => {
    runner?.run(scene);
  });
}

async function requestFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
    }
  } catch {
    // Fullscreen is optional.
  }
}

els.start.onclick = async () => {
  els.start.disabled = true;
  setStatus('Preparando...');
  const capabilities = await prepareDevice();
  connect(capabilities);
};

window.addEventListener('beforeunload', () => {
  runner?.cancel();
  torch?.stop();
  wakeLockManager?.disable();
  haptics?.destroy();
});
