export class SceneRunner {
  constructor(options) {
    this.screen = options.screen;
    this.torch = options.torch;
    this.haptics = options.haptics;
    this.groupId = options.groupId || 0;
    this.groupCount = options.groupCount || 8;
    this.clockOffset = options.clockOffset || 0;
    this.wait = options.wait || ((ms) => new Promise((r) => setTimeout(r, ms)));
    this.now = options.now || (() => Date.now());
    this.timers = new Set();
    this.cancelled = false;
  }

  async run(scene) {
    this.cancel();
    this.cancelled = false;

    const delay = scene.executeAt
      ? scene.executeAt + this.clockOffset - this.now()
      : 0;
    if (delay > 0) await this._sleep(delay);
    if (this.cancelled) return;

    switch (scene.action) {
      case 'solid':
        this.screen.show(scene.color);
        if (scene.useTorch) await this.torch.set(true);
        break;
      case 'off':
        await this._allOff();
        break;
      case 'flash':
        await this._flash(scene);
        break;
      case 'pulse':
        await this._pulse(scene);
        break;
      case 'strobe':
        await this._strobe(scene);
        break;
      case 'sparkle':
        await this._sparkle(scene);
        break;
      case 'burst':
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
    const duration = scene.duration || 3000;
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
    const duration = scene.duration || 3000;
    const interval = Math.max(60, Math.round(60000 / (scene.tempo || 120) / 2));
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
    const duration = scene.duration || 4000;
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
    const duration = scene.duration || 4000;
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
}
