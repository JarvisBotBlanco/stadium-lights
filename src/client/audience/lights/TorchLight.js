export class TorchLight {
  constructor(mediaDevices = navigator.mediaDevices) {
    this.mediaDevices = mediaDevices;
    this.track = null;
    this.available = false;
  }

  async prepare() {
    if (!this.mediaDevices?.getUserMedia) return false;

    try {
      const stream = await this.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
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
    const capabilities =
      typeof track.getCapabilities === 'function' ? track.getCapabilities() : {};
    if (!capabilities.torch) return false;
    this.available = true;
    return this.set(false);
  }
}
