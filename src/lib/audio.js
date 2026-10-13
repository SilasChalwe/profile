export class PortfolioAudio {
  constructor() {
    this.context = null;
    this.ambient = null;
    this.ambientGain = null;
    this.effectsEnabled = true;
    this.ambientEnabled = false;
  }

  ensure() {
    if (!this.context) this.context = new (window.AudioContext || window.webkitAudioContext)();
    if (this.context.state === 'suspended') this.context.resume();
    return this.context;
  }

  click(frequency = 420) {
    if (!this.effectsEnabled) return;
    const context = this.ensure();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.45, context.currentTime + .08);
    gain.gain.setValueAtTime(.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.065, context.currentTime + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .13);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + .14);
  }

  setAmbient(enabled) {
    this.ambientEnabled = enabled;
    const context = this.ensure();
    if (enabled && !this.ambient) {
      const oscillator = context.createOscillator();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      oscillator.type = 'sawtooth';
      oscillator.frequency.value = 46;
      filter.type = 'lowpass';
      filter.frequency.value = 120;
      gain.gain.value = .018;
      oscillator.connect(filter).connect(gain).connect(context.destination);
      oscillator.start();
      this.ambient = oscillator;
      this.ambientGain = gain;
    } else if (!enabled && this.ambient) {
      this.ambient.stop();
      this.ambient.disconnect();
      this.ambient = null;
      this.ambientGain = null;
    }
  }
}

export const portfolioAudio = new PortfolioAudio();
