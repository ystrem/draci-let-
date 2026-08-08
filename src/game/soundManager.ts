// Web Audio API Sound Manager for retro Arcade Dragon Game

class SoundManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private masterGain: GainNode | null = null;
  private lastJumpTime: number = 0;
  private lastShootTime: number = 0;

  constructor() {
    // AudioContext will be lazily initialized on first user interaction or trigger
  }

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.muted ? 0 : 0.35; // Comfortable volume
        this.masterGain.connect(this.ctx.destination);
      }
    }

    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(mute: boolean) {
    this.muted = mute;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.35, this.ctx.currentTime);
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  public resume() {
    this.initContext();
  }

  // --- 1. JUMP / WING FLAP BOOST SOUND EFFECT ---
  public playJump() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = Date.now();
    // Throttle jump sound slightly to avoid overwhelming audio when keys are held down
    if (now - this.lastJumpTime < 130) return;
    this.lastJumpTime = now;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Triangle wave for smooth, resonant wing flap/jump swoop
    osc.type = "triangle";
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(520, t + 0.16);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  // --- 2. SHOOTING FIREBALLS & BEAMS ---
  public playShoot(type: string = "fire") {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = Date.now();
    if (now - this.lastShootTime < 60) return;
    this.lastShootTime = now;

    const t = this.ctx.currentTime;

    if (type === "plasma") {
      // Heavy deep plasma blast
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(380, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.22);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.22);
    } else if (type === "laser_beam") {
      // High-frequency energy laser zap
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.1);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.1);
    } else {
      // Classic Fireball Shot (sawtooth + noise sweep)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(550, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.14);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.14);
    }
  }

  // --- 3. COLLECTING ITEMS (GEMS, COINS, HEALTH CRYSTALS) ---
  public playCollect(itemType: string = "gem") {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    // Arpeggio notes frequency array (E5, G#5, B5, E6)
    const freqs = itemType === "health" 
      ? [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6 (warm heal chord)
      : [659.25, 830.61, 987.77, 1318.51]; // E5, G#5, B5, E6 (sparkling gem pickup)

    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const noteTime = t + idx * 0.045;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.01, noteTime);
      gain.gain.linearRampToValueAtTime(0.25, noteTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.12);
    });
  }

  // --- 4. EXPLOSION SFX ---
  public playExplosion(isBoss: boolean = false) {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const duration = isBoss ? 0.6 : 0.25;

    // Low pitch thud oscillator
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(isBoss ? 160 : 120, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + duration);

    gain.gain.setValueAtTime(isBoss ? 0.45 : 0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + duration);

    // Noise buffer for crunchy explosion
    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(isBoss ? 800 : 1200, t);
      filter.frequency.exponentialRampToValueAtTime(100, t + duration);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(isBoss ? 0.4 : 0.25, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noise.start(t);
    } catch (e) {
      // Fallback if buffer creation fails
    }
  }

  // --- 5. PLAYER DAMAGE HIT SFX ---
  public playHit() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  // --- 6. LEVEL UP / POWERUP SFX ---
  public playPowerup() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const notes = [330, 440, 550, 660, 880];
    notes.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const noteT = t + i * 0.05;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, noteT);

      gain.gain.setValueAtTime(0.01, noteT);
      gain.gain.linearRampToValueAtTime(0.25, noteT + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, noteT + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(noteT);
      osc.stop(noteT + 0.1);
    });
  }
}

export const soundManager = new SoundManager();
