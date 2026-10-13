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

  // Soft, glassy tick for hover and minor interactions
  tick() {
    if (!this.effectsEnabled) return;
    const context = this.ensure();
    const osc = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, context.currentTime + 0.05);

    filter.type = 'bandpass';
    filter.frequency.value = 1000;

    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, context.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.1);

    osc.connect(filter).connect(gain).connect(context.destination);
    osc.start();
    osc.stop(context.currentTime + 0.1);
  }

  // Premium, polished click for selections
  click() {
    if (!this.effectsEnabled) return;
    const context = this.ensure();
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, context.currentTime + 0.1);

    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.15);

    osc.connect(gain).connect(context.destination);
    osc.start();
    osc.stop(context.currentTime + 0.15);
  }

  // Soft transition/whoosh for panel opening
  openPanel() {
    if (!this.effectsEnabled) return;
    const context = this.ensure();

    // Noise burst
    const bufferSize = context.sampleRate * 0.5; // 0.5 seconds
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = context.createBufferSource();
    noise.buffer = buffer;

    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, context.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1500, context.currentTime + 0.2);
    filter.frequency.exponentialRampToValueAtTime(200, context.currentTime + 0.4);

    const gain = context.createGain();
    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, context.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.4);

    noise.connect(filter).connect(gain).connect(context.destination);
    noise.start();
  }

  setAmbient(enabled) {
    this.ambientEnabled = enabled;
    const context = this.ensure();

    if (enabled && !this.ambient) {
      // Create a lush, premium ambient drone
      const osc1 = context.createOscillator();
      const osc2 = context.createOscillator();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();

      osc1.type = 'sine';
      osc1.frequency.value = 55; // Low drone

      osc2.type = 'triangle';
      osc2.frequency.value = 55.5; // Slight detune for warmth

      filter.type = 'lowpass';
      filter.frequency.value = 150;

      // Slow fade in for ambient
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(0.03, context.currentTime + 2);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain).connect(context.destination);

      osc1.start();
      osc2.start();

      this.ambient = { osc1, osc2, gain };
    } else if (!enabled && this.ambient) {
      const { osc1, osc2, gain } = this.ambient;
      // Fade out smoothly
      gain.gain.setValueAtTime(gain.gain.value, context.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, context.currentTime + 1);

      setTimeout(() => {
        osc1.stop();
        osc2.stop();
        osc1.disconnect();
        osc2.disconnect();
      }, 1000);

      this.ambient = null;
    }
  }
}

export const portfolioAudio = new PortfolioAudio();
