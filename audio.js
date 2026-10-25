/**
 * Diwali Spin Wheel - Synthesized Web Audio Engine
 * Zero external audio file dependencies. Works 100% offline and cross-origin safe.
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.initialized = true;
      }
    } catch (e) {
      console.warn('AudioContext not supported:', e);
    }
  }

  resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // Mechanical wheel peg click sound
  playTick(velocity = 1) {
    if (this.isMuted || !this.ctx) return;
    this.resume();

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Sharp click transient with body
      const freq = 600 + Math.min(velocity * 80, 400);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.035);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(3, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(Math.min(0.25 * velocity, 0.4), now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);

      // Add a tiny wooden noise click
      this.playWoodNoise(now, 0.08 * velocity);
    } catch (e) {
      // Audio fallback
    }
  }

  playWoodNoise(time, volume) {
    try {
      const bufferSize = this.ctx.sampleRate * 0.015;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1200, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.015);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(time);
    } catch (e) {}
  }

  // Spin launch sound
  playSpinStart() {
    if (this.isMuted || !this.ctx) return;
    this.resume();

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.4);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {}
  }

  // Joyous Diwali Fanfare for the Win!
  playWinFanfare() {
    if (this.isMuted || !this.ctx) return;
    this.resume();

    try {
      const notes = [
        { f: 523.25, t: 0.00, d: 0.18 }, // C5
        { f: 659.25, t: 0.16, d: 0.18 }, // E5
        { f: 783.99, t: 0.32, d: 0.22 }, // G5
        { f: 1046.50, t: 0.50, d: 0.65 }, // C6
        { f: 1318.51, t: 0.70, d: 0.85 }  // E6 (sparkle high)
      ];

      const start = this.ctx.currentTime + 0.05;

      notes.forEach(n => {
        const osc = this.ctx.createOscillator();
        const oscHarmonic = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, start + n.t);

        oscHarmonic.type = 'sine';
        oscHarmonic.frequency.setValueAtTime(n.f * 2, start + n.t);

        gain.gain.setValueAtTime(0.001, start + n.t);
        gain.gain.linearRampToValueAtTime(0.2, start + n.t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + n.t + n.d);

        osc.connect(gain);
        oscHarmonic.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start + n.t);
        osc.stop(start + n.t + n.d);
        oscHarmonic.start(start + n.t);
        oscHarmonic.stop(start + n.t + n.d);
      });

      // Play cracker burst after brief pause
      setTimeout(() => {
        this.playCrackerBurst();
      }, 400);
      setTimeout(() => {
        this.playCrackerBurst();
      }, 850);
    } catch (e) {}
  }

  // Diwali phataka / cracker burst sound
  playCrackerBurst() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // White noise explosion
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.3);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
    } catch (e) {}
  }
}

window.soundEngine = new SoundEngine();
