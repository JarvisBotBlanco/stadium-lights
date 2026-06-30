export class ScreenLight {
  constructor(element, options = {}) {
    this.element = element;
    this.themeMeta = options.themeMeta || null;
  }

  show(color = '#ffffff') {
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
    this.element.style.opacity = '1';
    this.element.style.background = '#000000';
    this.element.hidden = true;
    if (this.themeMeta) this.themeMeta.content = '#050505';
  }
}

