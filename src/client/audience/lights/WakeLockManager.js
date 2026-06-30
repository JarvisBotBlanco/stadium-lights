import NoSleep from 'nosleep.js';

export class WakeLockManager {
  constructor(doc = document, nav = navigator) {
    this.document = doc;
    this.navigator = nav;
    this.wakeLock = null;
    this.noSleep = null;
    this.active = false;
    this.available = false;
    this.mode = 'none';
    this._onVisibilityChange = this._onVisibilityChange.bind(this);
  }

  async enable() {
    this.active = true;
    await this._requestNative();

    if (!this.available) {
      this._enableFallback();
    }

    this.document.addEventListener('visibilitychange', this._onVisibilityChange);
    return {
      available: this.available,
      mode: this.mode
    };
  }

  async disable() {
    this.active = false;
    this.document.removeEventListener('visibilitychange', this._onVisibilityChange);
    await this.wakeLock?.release?.();
    this.wakeLock = null;
    this.noSleep?.disable?.();
  }

  async _requestNative() {
    if (!('wakeLock' in this.navigator)) return false;

    try {
      this.wakeLock = await this.navigator.wakeLock.request('screen');
      this.available = true;
      this.mode = 'native';
      this.wakeLock.addEventListener?.('release', () => {
        this.wakeLock = null;
        if (this.active && this.document.visibilityState === 'visible') {
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
      this.noSleep = this.noSleep || new NoSleep();
      this.noSleep.enable();
      this.available = true;
      this.mode = 'fallback';
    } catch {
      this.available = false;
      this.mode = 'none';
    }
  }

  async _onVisibilityChange() {
    if (!this.active || this.document.visibilityState !== 'visible') return;
    if (this.mode === 'native') {
      await this._requestNative();
    } else if (this.mode === 'fallback') {
      this._enableFallback();
    }
  }
}
