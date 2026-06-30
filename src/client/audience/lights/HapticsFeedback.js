import { WebHaptics } from 'web-haptics';

export class HapticsFeedback {
  constructor() {
    this.available = Boolean(WebHaptics?.isSupported);
    this.instance = null;

    if (this.available) {
      try {
        this.instance = new WebHaptics();
      } catch {
        this.available = false;
      }
    }
  }

  async trigger(input = 'nudge', options) {
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
}

