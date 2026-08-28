class AmbientAudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientOscillator: OscillatorNode | null = null;
  private ambientOscillator2: OscillatorNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5;

  private init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = this.volume;
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  playAmbient() {
    this.init();
    if (!this.ctx || !this.masterGain || this.ambientOscillator) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    // Create a low drone sound (root + fifth for a warmer, more musical pad)
    this.ambientOscillator = this.ctx.createOscillator();
    this.ambientOscillator.type = 'sine';
    this.ambientOscillator.frequency.value = 55; // Low A

    this.ambientOscillator2 = this.ctx.createOscillator();
    this.ambientOscillator2.type = 'sine';
    this.ambientOscillator2.frequency.value = 82.4; // E (a fifth above) — adds body

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 320;

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1; // Very slow LFO

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 50;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    
    const ambientGain = this.ctx.createGain();
    ambientGain.gain.value = 0.16; // Subtle but clearly audible

    this.ambientOscillator.connect(filter);
    this.ambientOscillator2.connect(filter);
    filter.connect(ambientGain);
    ambientGain.connect(this.masterGain);

    lfo.start();
    this.ambientOscillator.start();
    this.ambientOscillator2.start();
  }

  private lastHover = 0;

  playHover() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    // Throttle so rapid pointer moves between nodes don't machine-gun the blip
    const now = performance.now();
    if (now - this.lastHover < 70) return;
    this.lastHover = now;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playSelect() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  playZoom() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    // Filtered noise sweep
    const bufferSize = this.ctx.sampleRate * 1; // 1 second
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(200, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2000, this.ctx.currentTime + 0.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noiseSource.start();
  }

  playSpatialSound(freq: number = 440, distance: number = 50) {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    // Spatial volume scaling: 1 / (1 + distance * 0.05)
    const distanceGain = 1.0 / (1.0 + Math.max(0, distance) * 0.05);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08 * distanceGain, this.ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
    }
  }

  /** Resume a suspended AudioContext (required after a user gesture). */
  resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  /** Stop the ambient drone without tearing down the whole context. */
  stopAmbient() {
    [this.ambientOscillator, this.ambientOscillator2].forEach((osc) => {
      if (osc) {
        try {
          osc.stop();
        } catch {
          /* already stopped */
        }
        osc.disconnect();
      }
    });
    this.ambientOscillator = null;
    this.ambientOscillator2 = null;
  }

  isAmbientPlaying(): boolean {
    return this.ambientOscillator !== null;
  }

  mute() {
    this.isMuted = true;
    if (this.masterGain) this.masterGain.gain.value = 0;
  }

  unmute() {
    this.isMuted = false;
    if (this.masterGain) this.masterGain.gain.value = this.volume;
  }

  dispose() {
    this.stopAmbient();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

export const audioManager = new AmbientAudioManager();
