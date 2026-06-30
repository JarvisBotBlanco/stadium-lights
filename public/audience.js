(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // node_modules/nosleep.js/src/media.js
  var require_media = __commonJS({
    "node_modules/nosleep.js/src/media.js"(exports, module) {
      module.exports = {
        webm: "data:video/webm;base64,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",
        mp4: "data:video/mp4;base64,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"
      };
    }
  });

  // node_modules/nosleep.js/src/index.js
  var require_src = __commonJS({
    "node_modules/nosleep.js/src/index.js"(exports, module) {
      var { webm, mp4 } = require_media();
      var oldIOS = () => typeof navigator !== "undefined" && parseFloat(
        ("" + (/CPU.*OS ([0-9_]{3,4})[0-9_]{0,1}|(CPU like).*AppleWebKit.*Mobile/i.exec(
          navigator.userAgent
        ) || [0, ""])[1]).replace("undefined", "3_2").replace("_", ".").replace("_", "")
      ) < 10 && !window.MSStream;
      var nativeWakeLock = () => "wakeLock" in navigator;
      var NoSleep2 = class {
        constructor() {
          this.enabled = false;
          if (nativeWakeLock()) {
            this._wakeLock = null;
            const handleVisibilityChange = () => {
              if (this._wakeLock !== null && document.visibilityState === "visible") {
                this.enable();
              }
            };
            document.addEventListener("visibilitychange", handleVisibilityChange);
            document.addEventListener("fullscreenchange", handleVisibilityChange);
          } else if (oldIOS()) {
            this.noSleepTimer = null;
          } else {
            this.noSleepVideo = document.createElement("video");
            this.noSleepVideo.setAttribute("title", "No Sleep");
            this.noSleepVideo.setAttribute("playsinline", "");
            this._addSourceToVideo(this.noSleepVideo, "webm", webm);
            this._addSourceToVideo(this.noSleepVideo, "mp4", mp4);
            this.noSleepVideo.addEventListener("loadedmetadata", () => {
              if (this.noSleepVideo.duration <= 1) {
                this.noSleepVideo.setAttribute("loop", "");
              } else {
                this.noSleepVideo.addEventListener("timeupdate", () => {
                  if (this.noSleepVideo.currentTime > 0.5) {
                    this.noSleepVideo.currentTime = Math.random();
                  }
                });
              }
            });
          }
        }
        _addSourceToVideo(element, type, dataURI) {
          var source = document.createElement("source");
          source.src = dataURI;
          source.type = `video/${type}`;
          element.appendChild(source);
        }
        get isEnabled() {
          return this.enabled;
        }
        enable() {
          if (nativeWakeLock()) {
            return navigator.wakeLock.request("screen").then((wakeLock) => {
              this._wakeLock = wakeLock;
              this.enabled = true;
              console.log("Wake Lock active.");
              this._wakeLock.addEventListener("release", () => {
                console.log("Wake Lock released.");
              });
            }).catch((err) => {
              this.enabled = false;
              console.error(`${err.name}, ${err.message}`);
              throw err;
            });
          } else if (oldIOS()) {
            this.disable();
            console.warn(`
        NoSleep enabled for older iOS devices. This can interrupt
        active or long-running network requests from completing successfully.
        See https://github.com/richtr/NoSleep.js/issues/15 for more details.
      `);
            this.noSleepTimer = window.setInterval(() => {
              if (!document.hidden) {
                window.location.href = window.location.href.split("#")[0];
                window.setTimeout(window.stop, 0);
              }
            }, 15e3);
            this.enabled = true;
            return Promise.resolve();
          } else {
            let playPromise = this.noSleepVideo.play();
            return playPromise.then((res) => {
              this.enabled = true;
              return res;
            }).catch((err) => {
              this.enabled = false;
              throw err;
            });
          }
        }
        disable() {
          if (nativeWakeLock()) {
            if (this._wakeLock) {
              this._wakeLock.release();
            }
            this._wakeLock = null;
          } else if (oldIOS()) {
            if (this.noSleepTimer) {
              console.warn(`
          NoSleep now disabled for older iOS devices.
        `);
              window.clearInterval(this.noSleepTimer);
              this.noSleepTimer = null;
            }
          } else {
            this.noSleepVideo.pause();
          }
          this.enabled = false;
        }
      };
      module.exports = NoSleep2;
    }
  });

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

  // src/client/audience/lights/WakeLockManager.js
  var import_nosleep = __toESM(require_src(), 1);
  var WakeLockManager = class {
    constructor(doc = document, nav = navigator) {
      this.document = doc;
      this.navigator = nav;
      this.wakeLock = null;
      this.noSleep = null;
      this.active = false;
      this.available = false;
      this.mode = "none";
      this._onVisibilityChange = this._onVisibilityChange.bind(this);
    }
    async enable() {
      this.active = true;
      await this._requestNative();
      if (!this.available) {
        this._enableFallback();
      }
      this.document.addEventListener("visibilitychange", this._onVisibilityChange);
      return {
        available: this.available,
        mode: this.mode
      };
    }
    async disable() {
      this.active = false;
      this.document.removeEventListener("visibilitychange", this._onVisibilityChange);
      await this.wakeLock?.release?.();
      this.wakeLock = null;
      this.noSleep?.disable?.();
    }
    async _requestNative() {
      if (!("wakeLock" in this.navigator)) return false;
      try {
        this.wakeLock = await this.navigator.wakeLock.request("screen");
        this.available = true;
        this.mode = "native";
        this.wakeLock.addEventListener?.("release", () => {
          this.wakeLock = null;
          if (this.active && this.document.visibilityState === "visible") {
            this._requestNative();
          }
        });
        return true;
      } catch {
        this.wakeLock = null;
        return false;
      }
    }
    _enableFallback() {
      try {
        this.noSleep = this.noSleep || new import_nosleep.default();
        this.noSleep.enable();
        this.available = true;
        this.mode = "fallback";
      } catch {
        this.available = false;
        this.mode = "none";
      }
    }
    async _onVisibilityChange() {
      if (!this.active || this.document.visibilityState !== "visible") return;
      if (this.mode === "native") {
        await this._requestNative();
      } else if (this.mode === "fallback") {
        this._enableFallback();
      }
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
  var wakeLockManager;
  var sessionToken = localStorage.getItem(tokenKey);
  var clockOffset = 0;
  var els = {
    start: document.getElementById("startBtn"),
    status: document.getElementById("statusText"),
    joinPanel: document.getElementById("joinPanel"),
    readyPanel: document.getElementById("readyPanel"),
    showScreen: document.getElementById("showScreen"),
    idleToast: document.getElementById("idleToast")
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
    wakeLockManager = new WakeLockManager();
    await requestFullscreen();
    const wakeLockState = await wakeLockManager.enable();
    const torchReady = await torch.prepare();
    await haptics.trigger(torchReady ? "success" : 60);
    return {
      screen: true,
      torch: torchReady,
      haptics: haptics.available,
      wakeLock: wakeLockState.available,
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
      showIdleToast(
        data.capabilities.torch ? "Listo: pantalla + flash" : "Listo: pantalla"
      );
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
  els.start.onclick = async () => {
    els.start.disabled = true;
    setStatus("Preparando...");
    const capabilities = await prepareDevice();
    connect(capabilities);
  };
  window.addEventListener("pointerdown", () => {
    if (els.joinPanel.hidden) showIdleToast("Listo para el show");
  });
  function showIdleToast(text) {
    els.idleToast.textContent = text;
    els.idleToast.hidden = false;
    clearTimeout(showIdleToast.timer);
    showIdleToast.timer = setTimeout(() => {
      els.idleToast.hidden = true;
    }, 2200);
  }
  window.addEventListener("beforeunload", () => {
    runner?.cancel();
    torch?.stop();
    wakeLockManager?.disable();
    haptics?.destroy();
  });
})();
