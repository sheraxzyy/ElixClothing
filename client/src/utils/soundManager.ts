// ============================================================================
// ELIX Centralized Web Audio Sound Manager
// High-performance, lightweight synthesizer — zero external audio file dependencies,
// zero latency, zero 404s, fully compliant with browser autoplay policies.
// ============================================================================

type SoundType = 'click' | 'addToCart' | 'success' | 'notification' | 'toggle' | 'remove';

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private lastPlayedTime: Record<string, number> = {};
  private listeners: Set<(enabled: boolean) => void> = new Set();
  private masterGain: GainNode | null = null;

  constructor() {
    try {
      const saved = localStorage.getItem('elix_sound_enabled');
      this.enabled = saved !== null ? saved === 'true' : true;
    } catch {
      this.enabled = true;
    }
  }

  /**
   * Lazily initializes AudioContext on first user interaction to satisfy browser autoplay policies.
   */
  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime); // subtle volume
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public toggleSound(): boolean {
    this.enabled = !this.enabled;
    try {
      localStorage.setItem('elix_sound_enabled', String(this.enabled));
    } catch {
      // storage blocked
    }
    this.notifyListeners();
    if (this.enabled) {
      this.play('toggle');
    }
    return this.enabled;
  }

  public setEnabled(val: boolean): void {
    this.enabled = val;
    try {
      localStorage.setItem('elix_sound_enabled', String(val));
    } catch {}
    this.notifyListeners();
  }

  public subscribe(listener: (enabled: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((l) => l(this.enabled));
  }

  /**
   * Prevents excessive sound overlap by throttling identical sounds.
   */
  private canPlay(type: SoundType, minIntervalMs: number = 80): boolean {
    if (!this.enabled) return false;
    const now = Date.now();
    const last = this.lastPlayedTime[type] || 0;
    if (now - last < minIntervalMs) {
      return false;
    }
    this.lastPlayedTime[type] = now;
    return true;
  }

  /**
   * Play subtle synthesized UI sound effects.
   */
  public play(type: SoundType): void {
    if (!this.canPlay(type)) return;

    try {
      const ctx = this.getContext();
      if (!ctx || !this.masterGain) return;

      const now = ctx.currentTime;

      switch (type) {
        case 'click': {
          // Tactile, crisp haptic mechanical tap (20ms, pitch drop)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(420, now);
          osc.frequency.exponentialRampToValueAtTime(140, now + 0.025);

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.03);
          break;
        }

        case 'addToCart': {
          // Luxury dual-tone harmonic shimmer (C6 -> G6 bell)
          const notes = [1046.5, 1567.98]; // C6, G6
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const start = now + idx * 0.07;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.15, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);

            osc.connect(gain);
            gain.connect(this.masterGain!);
            osc.start(start);
            osc.stop(start + 0.25);
          });
          break;
        }

        case 'success': {
          // Celebratory luxury ascending chord (E5, G#5, B5, E6)
          const chords = [659.25, 830.61, 987.77, 1318.51];
          chords.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const start = now + idx * 0.055;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.12, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);

            osc.connect(gain);
            gain.connect(this.masterGain!);
            osc.start(start);
            osc.stop(start + 0.3);
          });
          break;
        }

        case 'notification': {
          // Modern ambient glass ping (A5 chime)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.exponentialRampToValueAtTime(1320, now + 0.04);

          gain.gain.setValueAtTime(0.14, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        }

        case 'toggle': {
          // Subtle mode switch pip
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(700, now);
          osc.frequency.exponentialRampToValueAtTime(950, now + 0.04);

          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.07);
          break;
        }

        case 'remove': {
          // Soft dismiss tap
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(160, now + 0.08);

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.09);
          break;
        }
      }
    } catch (e) {
      // AudioContext error suppressed safely
    }
  }

  // Convenience shorthand methods
  public playClick(): void {
    this.play('click');
  }

  public playAddToCart(): void {
    this.play('addToCart');
  }

  public playSuccess(): void {
    this.play('success');
  }

  public playNotification(): void {
    this.play('notification');
  }

  public playRemove(): void {
    this.play('remove');
  }
}

export const soundManager = new SoundManager();
export default soundManager;

