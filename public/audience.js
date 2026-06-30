(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/shared/sync/clock.js
  function computeClockOffset(samples) {
    if (!samples.length) return 0;
    const sorted = [...samples].sort((a, b2) => a.rtt - b2.rtt);
    const best = sorted.slice(0, Math.min(4, sorted.length));
    return best.reduce((sum, s) => sum + s.offset, 0) / best.length;
  }
  async function syncClockWithSocket(socket2, rounds = 8) {
    const samples = [];
    for (let i = 0; i < rounds; i++) {
      const t1 = performance.now();
      const result = await new Promise((resolve) => {
        socket2.emit("time_ping", {}, resolve);
      });
      const t4 = performance.now();
      const rtt = t4 - t1;
      samples.push({
        offset: result.serverTime - Date.now() - rtt / 2,
        rtt
      });
      await new Promise((r) => setTimeout(r, 100));
    }
    return computeClockOffset(samples);
  }

  // src/client/audience/lights/ScreenLight.js
  var ScreenLight = class {
    constructor(element, options = {}) {
      this.element = element;
      this.themeMeta = options.themeMeta || null;
    }
    show(color = "#ffffff") {
      if (!this.element) return;
      this.element.hidden = false;
      this.element.style.background = color;
      if (this.themeMeta) this.themeMeta.content = color;
    }
    setOpacity(opacity) {
      if (!this.element) return;
      this.element.style.opacity = String(Math.max(0, Math.min(1, opacity)));
    }
    off() {
      if (!this.element) return;
      this.element.style.opacity = "1";
      this.element.style.background = "#000000";
      this.element.hidden = true;
      if (this.themeMeta) this.themeMeta.content = "#050505";
    }
  };

  // src/client/audience/lights/TorchLight.js
  var TorchLight = class {
    constructor(mediaDevices = navigator.mediaDevices) {
      this.mediaDevices = mediaDevices;
      this.track = null;
      this.available = false;
    }
    async prepare() {
      if (!this.mediaDevices?.getUserMedia) return false;
      try {
        const stream = await this.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false
        });
        const [track] = stream.getVideoTracks();
        this.track = track;
        this.available = await this._supportsTorch(track);
        if (!this.available) this.stop();
        return this.available;
      } catch {
        this.available = false;
        this.stop();
        return false;
      }
    }
    async set(enabled) {
      if (!this.available || !this.track) return false;
      try {
        await this.track.applyConstraints({
          advanced: [{ torch: Boolean(enabled) }]
        });
        return true;
      } catch {
        return false;
      }
    }
    stop() {
      if (this.track) {
        this.track.stop();
        this.track = null;
      }
      this.available = false;
    }
    async _supportsTorch(track) {
      const capabilities = typeof track.getCapabilities === "function" ? track.getCapabilities() : {};
      if (!capabilities.torch) return false;
      this.available = true;
      return this.set(false);
    }
  };

  // node_modules/web-haptics/dist/chunk-4NSAIXAB.mjs
  var b = { success: { pattern: [{ duration: 30, intensity: 0.5 }, { delay: 60, duration: 40, intensity: 1 }] }, warning: { pattern: [{ duration: 40, intensity: 0.8 }, { delay: 100, duration: 40, intensity: 0.6 }] }, error: { pattern: [{ duration: 40, intensity: 0.9 }, { delay: 40, duration: 40, intensity: 0.9 }, { delay: 40, duration: 40, intensity: 0.9 }] }, light: { pattern: [{ duration: 15, intensity: 0.4 }] }, medium: { pattern: [{ duration: 25, intensity: 0.7 }] }, heavy: { pattern: [{ duration: 35, intensity: 1 }] }, soft: { pattern: [{ duration: 40, intensity: 0.5 }] }, rigid: { pattern: [{ duration: 10, intensity: 1 }] }, selection: { pattern: [{ duration: 8, intensity: 0.3 }] }, nudge: { pattern: [{ duration: 80, intensity: 0.8 }, { delay: 80, duration: 50, intensity: 0.3 }] }, buzz: { pattern: [{ duration: 1e3, intensity: 1 }] } };
  var g = 16;
  var x = 184;
  var m = 1e3;
  var p = 20;
  function C(o) {
    if (typeof o == "number") return { vibrations: [{ duration: o }] };
    if (typeof o == "string") {
      let i = b[o];
      return i ? { vibrations: i.pattern.map((t) => ({ ...t })) } : (console.warn(`[web-haptics] Unknown preset: "${o}"`), null);
    }
    if (Array.isArray(o)) {
      if (o.length === 0) return { vibrations: [] };
      if (typeof o[0] == "number") {
        let i = o, t = [];
        for (let e = 0; e < i.length; e += 2) {
          let n = e > 0 ? i[e - 1] : 0;
          t.push({ ...n > 0 && { delay: n }, duration: i[e] });
        }
        return { vibrations: t };
      }
      return { vibrations: o.map((i) => ({ ...i })) };
    }
    return { vibrations: o.pattern.map((i) => ({ ...i })) };
  }
  function w(o, i) {
    if (i >= 1) return [o];
    if (i <= 0) return [];
    let t = Math.max(1, Math.round(p * i)), e = p - t, n = [], s = o;
    for (; s >= p; ) n.push(t), n.push(e), s -= p;
    if (s > 0) {
      let a = Math.max(1, Math.round(s * i));
      n.push(a);
      let r = s - a;
      r > 0 && n.push(r);
    }
    return n;
  }
  function M(o, i) {
    let t = [];
    for (let e = 0; e < o.length; e++) {
      let n = o[e], s = Math.max(0, Math.min(1, n.intensity ?? i)), a = n.delay ?? 0;
      a > 0 && (t.length > 0 && t.length % 2 === 0 ? t[t.length - 1] += a : (t.length === 0 && t.push(0), t.push(a)));
      let r = w(n.duration, s);
      if (r.length === 0) {
        t.length > 0 && t.length % 2 === 0 ? t[t.length - 1] += n.duration : n.duration > 0 && (t.push(0), t.push(n.duration));
        continue;
      }
      for (let d of r) t.push(d);
    }
    return t;
  }
  var I = 0;
  var _a;
  var v = (_a = class {
    constructor(i) {
      __publicField(this, "hapticLabel", null);
      __publicField(this, "domInitialized", false);
      __publicField(this, "instanceId");
      __publicField(this, "debug");
      __publicField(this, "showSwitch");
      __publicField(this, "rafId", null);
      __publicField(this, "patternResolve", null);
      __publicField(this, "audioCtx", null);
      __publicField(this, "audioFilter", null);
      __publicField(this, "audioGain", null);
      __publicField(this, "audioBuffer", null);
      this.instanceId = ++I, this.debug = i?.debug ?? false, this.showSwitch = i?.showSwitch ?? false;
    }
    async trigger(i = [{ duration: 25, intensity: 0.7 }], t) {
      let e = C(i);
      if (!e) return;
      let { vibrations: n } = e;
      if (n.length === 0) return;
      let s = Math.max(0, Math.min(1, t?.intensity ?? 0.5));
      for (let a of n) if (a.duration > m && (a.duration = m), !Number.isFinite(a.duration) || a.duration < 0 || a.delay !== void 0 && (!Number.isFinite(a.delay) || a.delay < 0)) {
        console.warn("[web-haptics] Invalid vibration values. Durations and delays must be finite non-negative numbers.");
        return;
      }
      if (_a.isSupported && navigator.vibrate(M(n, s)), !_a.isSupported || this.debug) {
        if (this.ensureDOM(), !this.hapticLabel) return;
        this.debug && await this.ensureAudio(), this.stopPattern();
        let r = (n[0]?.delay ?? 0) === 0;
        if (r && (this.hapticLabel.click(), this.debug && this.audioCtx)) {
          let d = Math.max(0, Math.min(1, n[0].intensity ?? s));
          this.playClick(d);
        }
        await this.runPattern(n, s, r);
      }
    }
    cancel() {
      this.stopPattern(), _a.isSupported && navigator.vibrate(0);
    }
    destroy() {
      this.stopPattern(), this.hapticLabel && (this.hapticLabel.remove(), this.hapticLabel = null, this.domInitialized = false), this.audioCtx && (this.audioCtx.close(), this.audioCtx = null, this.audioFilter = null, this.audioGain = null, this.audioBuffer = null);
    }
    setDebug(i) {
      this.debug = i, !i && this.audioCtx && (this.audioCtx.close(), this.audioCtx = null, this.audioFilter = null, this.audioGain = null, this.audioBuffer = null);
    }
    setShowSwitch(i) {
      if (this.showSwitch = i, this.hapticLabel) {
        let t = this.hapticLabel.querySelector("input");
        this.hapticLabel.style.display = i ? "" : "none", t && (t.style.display = i ? "" : "none");
      }
    }
    stopPattern() {
      this.rafId !== null && (cancelAnimationFrame(this.rafId), this.rafId = null), this.patternResolve?.(), this.patternResolve = null;
    }
    runPattern(i, t, e) {
      return new Promise((n) => {
        this.patternResolve = n;
        let s = [], a = 0;
        for (let u of i) {
          let c = Math.max(0, Math.min(1, u.intensity ?? t)), l = u.delay ?? 0;
          l > 0 && (a += l, s.push({ end: a, isOn: false, intensity: 0 })), a += u.duration, s.push({ end: a, isOn: true, intensity: c });
        }
        let r = a, d = 0, h = -1, y = (u) => {
          d === 0 && (d = u);
          let c = u - d;
          if (c >= r) {
            this.rafId = null, this.patternResolve = null, n();
            return;
          }
          let l = s[0];
          for (let f of s) if (c < f.end) {
            l = f;
            break;
          }
          if (l.isOn) {
            let f = g + (1 - l.intensity) * x;
            h === -1 ? (h = u, e || (this.hapticLabel?.click(), this.debug && this.audioCtx && this.playClick(l.intensity), e = true)) : u - h >= f && (this.hapticLabel?.click(), this.debug && this.audioCtx && this.playClick(l.intensity), h = u);
          }
          this.rafId = requestAnimationFrame(y);
        };
        this.rafId = requestAnimationFrame(y);
      });
    }
    playClick(i) {
      if (!this.audioCtx || !this.audioFilter || !this.audioGain || !this.audioBuffer) return;
      let t = this.audioBuffer.getChannelData(0);
      for (let a = 0; a < t.length; a++) t[a] = (Math.random() * 2 - 1) * Math.exp(-a / 25);
      this.audioGain.gain.value = 0.5 * i;
      let e = 2e3 + i * 2e3, n = 1 + (Math.random() - 0.5) * 0.3;
      this.audioFilter.frequency.value = e * n;
      let s = this.audioCtx.createBufferSource();
      s.buffer = this.audioBuffer, s.connect(this.audioFilter), s.onended = () => s.disconnect(), s.start();
    }
    async ensureAudio() {
      if (!this.audioCtx && typeof AudioContext < "u") {
        this.audioCtx = new AudioContext(), this.audioFilter = this.audioCtx.createBiquadFilter(), this.audioFilter.type = "bandpass", this.audioFilter.frequency.value = 4e3, this.audioFilter.Q.value = 8, this.audioGain = this.audioCtx.createGain(), this.audioFilter.connect(this.audioGain), this.audioGain.connect(this.audioCtx.destination);
        let i = 4e-3;
        this.audioBuffer = this.audioCtx.createBuffer(1, this.audioCtx.sampleRate * i, this.audioCtx.sampleRate);
        let t = this.audioBuffer.getChannelData(0);
        for (let e = 0; e < t.length; e++) t[e] = (Math.random() * 2 - 1) * Math.exp(-e / 25);
      }
      this.audioCtx?.state === "suspended" && await this.audioCtx.resume();
    }
    ensureDOM() {
      if (this.domInitialized || typeof document > "u") return;
      let i = `web-haptics-${this.instanceId}`, t = document.createElement("label");
      t.setAttribute("for", i), t.textContent = "Haptic feedback", t.style.position = "fixed", t.style.bottom = "10px", t.style.left = "10px", t.style.padding = "5px 10px", t.style.backgroundColor = "rgba(0, 0, 0, 0.7)", t.style.color = "white", t.style.fontFamily = "sans-serif", t.style.fontSize = "14px", t.style.borderRadius = "4px", t.style.zIndex = "9999", t.style.userSelect = "none", this.hapticLabel = t;
      let e = document.createElement("input");
      e.type = "checkbox", e.setAttribute("switch", ""), e.id = i, e.style.all = "initial", e.style.appearance = "auto", this.showSwitch || (t.style.display = "none", e.style.display = "none"), t.appendChild(e), document.body.appendChild(t), this.domInitialized = true;
    }
  }, __publicField(_a, "isSupported", typeof navigator < "u" && typeof navigator.vibrate == "function"), _a);

  // src/client/audience/lights/HapticsFeedback.js
  var HapticsFeedback = class {
    constructor() {
      this.available = Boolean(v?.isSupported);
      this.instance = null;
      if (this.available) {
        try {
          this.instance = new v();
        } catch {
          this.available = false;
        }
      }
    }
    async trigger(input = "nudge", options) {
      if (!this.instance) return false;
      try {
        await this.instance.trigger(input, options);
        return true;
      } catch {
        return false;
      }
    }
    cancel() {
      this.instance?.cancel?.();
    }
    destroy() {
      this.instance?.destroy?.();
      this.instance = null;
    }
  };

  // src/client/audience/show/SceneRunner.js
  var SceneRunner = class {
    constructor(options) {
      this.screen = options.screen;
      this.torch = options.torch;
      this.haptics = options.haptics;
      this.groupId = options.groupId || 0;
      this.groupCount = options.groupCount || 8;
      this.clockOffset = options.clockOffset || 0;
      this.wait = options.wait || ((ms) => new Promise((r) => setTimeout(r, ms)));
      this.now = options.now || (() => Date.now());
      this.timers = /* @__PURE__ */ new Set();
      this.cancelled = false;
    }
    async run(scene) {
      this.cancel();
      this.cancelled = false;
      const delay = scene.executeAt ? scene.executeAt + this.clockOffset - this.now() : 0;
      if (delay > 0) await this._sleep(delay);
      if (this.cancelled) return;
      switch (scene.action) {
        case "solid":
          this.screen.show(scene.color);
          if (scene.useTorch) await this.torch.set(true);
          break;
        case "off":
          await this._allOff();
          break;
        case "flash":
          await this._flash(scene);
          break;
        case "pulse":
          await this._pulse(scene);
          break;
        case "strobe":
          await this._strobe(scene);
          break;
        case "sparkle":
          await this._sparkle(scene);
          break;
        case "burst":
          await this._burst(scene);
          break;
        default:
          break;
      }
    }
    cancel() {
      this.cancelled = true;
      for (const timer of this.timers) clearTimeout(timer);
      this.timers.clear();
      this.haptics?.cancel?.();
    }
    async _flash(scene) {
      this.screen.show(scene.color);
      if (scene.useTorch) await this.torch.set(true);
      await this.haptics?.trigger?.(80, { intensity: scene.intensity || 0.8 });
      await this._sleep(scene.duration || 120);
      await this._allOff();
    }
    async _pulse(scene) {
      const duration = scene.duration || 3e3;
      const startedAt = this.now();
      this.screen.show(scene.color);
      if (scene.useTorch) await this.torch.set(true);
      while (!this.cancelled && this.now() - startedAt < duration) {
        const progress = (this.now() - startedAt) / duration;
        const opacity = 0.2 + Math.sin(progress * Math.PI) * 0.8;
        this.screen.setOpacity(opacity);
        await this._sleep(32);
      }
      this.screen.setOpacity(1);
      if (scene.useTorch) await this.torch.set(false);
    }
    async _strobe(scene) {
      const duration = scene.duration || 3e3;
      const interval = Math.max(60, Math.round(6e4 / (scene.tempo || 120) / 2));
      const startedAt = this.now();
      let on = false;
      while (!this.cancelled && this.now() - startedAt < duration) {
        on = !on;
        if (on) {
          this.screen.show(scene.color);
          if (scene.useTorch) await this.torch.set(true);
        } else {
          await this._allOff();
        }
        await this._sleep(interval);
      }
      await this._allOff();
    }
    async _sparkle(scene) {
      const duration = scene.duration || 4e3;
      const startedAt = this.now();
      const offset = this.groupId * 37;
      while (!this.cancelled && this.now() - startedAt < duration) {
        const active = Math.random() > 0.65;
        if (active) {
          this.screen.show(scene.color);
          if (scene.useTorch) await this.torch.set(true);
          await this._sleep(60 + offset);
        }
        await this._allOff();
        await this._sleep(80 + Math.random() * 220);
      }
      await this._allOff();
    }
    async _burst(scene) {
      const duration = scene.duration || 4e3;
      const step = Math.max(80, duration / this.groupCount);
      const targetDelay = this.groupId * step;
      await this._sleep(targetDelay);
      if (this.cancelled) return;
      await this._flash({ ...scene, duration: Math.min(180, step) });
    }
    async _allOff() {
      await this.torch?.set?.(false);
      this.screen.off();
    }
    _sleep(ms) {
      if (ms <= 0) return Promise.resolve();
      return new Promise((resolve) => {
        const timer = setTimeout(() => {
          this.timers.delete(timer);
          resolve();
        }, ms);
        this.timers.add(timer);
      });
    }
  };

  // src/client/audience/main.js
  var params = new URLSearchParams(window.location.search);
  var eventId = params.get("event") || "hipico-demo";
  var tokenKey = `hls_token_${eventId}`;
  var socket;
  var runner;
  var torch;
  var haptics;
  var wakeLock = null;
  var sessionToken = localStorage.getItem(tokenKey);
  var clockOffset = 0;
  var els = {
    start: document.getElementById("startBtn"),
    status: document.getElementById("statusText"),
    readyTitle: document.getElementById("readyTitle"),
    readyDetail: document.getElementById("readyDetail"),
    joinPanel: document.getElementById("joinPanel"),
    readyPanel: document.getElementById("readyPanel"),
    showScreen: document.getElementById("showScreen")
  };
  var screen = new ScreenLight(els.showScreen, {
    themeMeta: document.querySelector('meta[name="theme-color"]')
  });
  function setStatus(text) {
    els.status.textContent = text;
  }
  async function prepareDevice() {
    haptics = new HapticsFeedback();
    await haptics.trigger(35, { intensity: 0.5 });
    torch = new TorchLight();
    await requestFullscreen();
    await requestWakeLock();
    const torchReady = await torch.prepare();
    await haptics.trigger(torchReady ? "success" : 60);
    return {
      screen: true,
      torch: torchReady,
      haptics: haptics.available,
      wakeLock: Boolean(wakeLock),
      fullscreen: Boolean(document.fullscreenElement)
    };
  }
  function connect(capabilities) {
    socket = io({ reconnection: true, reconnectionDelay: 1e3 });
    socket.on("connect", async () => {
      setStatus("Sincronizando...");
      clockOffset = await syncClockWithSocket(socket, 5);
      socket.emit("join_show", {
        eventId,
        sessionToken,
        capabilities
      });
    });
    socket.on("disconnect", () => {
      setStatus("Reconectando...");
    });
    socket.on("show_joined", (data) => {
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
      els.readyTitle.textContent = "Listo";
      els.readyDetail.textContent = data.capabilities.torch ? "Pantalla y flash preparados." : "Pantalla preparada sin flash.";
      setStatus("Listo");
    });
    socket.on("show_stats", () => {
    });
    socket.on("scene", (scene) => {
      runner?.run(scene);
    });
  }
  async function requestFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen?.();
      }
    } catch {
    }
  }
  async function requestWakeLock() {
    try {
      if ("wakeLock" in navigator) {
        wakeLock = await navigator.wakeLock.request("screen");
      }
    } catch {
      wakeLock = null;
    }
  }
  els.start.onclick = async () => {
    els.start.disabled = true;
    setStatus("Preparando...");
    const capabilities = await prepareDevice();
    connect(capabilities);
  };
  window.addEventListener("beforeunload", () => {
    runner?.cancel();
    torch?.stop();
    haptics?.destroy();
  });
})();
