/**
 * Web Audio API synthesizer for instant, crisp sound effects without external audio files.
 * Enhanced in v3.0 with multiple alternating victory chimes:
 * 1. Classic Major Arpeggio
 * 2. Retro 8-Bit Coin Sparkle
 * 3. Minecraft XP Level-Up Chime
 * 4. Among Us Task Complete Electronic Alert
 * 5. Sci-Fi Powerup Glissando
 * 6. Crystal Bell Harmony
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private soundCounter: number = 0;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Tactile decimal hop: Pitch climbs slightly with each sequential hop
  playHop(stepNumber: number = 1) {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const baseFreq = 340 + Math.min(stepNumber * 40, 520);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.4, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  }

  // Alternates between 6 fun, varied, school-appropriate celebratory chimes
  playReward() {
    const ctx = this.getContext();
    if (!ctx) return;

    const chimeType = this.soundCounter % 6;
    this.soundCounter++;

    if (chimeType === 0) {
      // 1. Classic Major Arpeggio (Bright & Uplifting)
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.06;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.26);
      });
    } else if (chimeType === 1) {
      // 2. Minecraft XP Level-Up Chime (Ascending crystalline pentatonic sparkle)
      const mcNotes = [392.00, 493.88, 587.33, 783.99, 987.77, 1174.66]; // G4, B4, D5, G5, B5, D6
      mcNotes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.045;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.16, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.24);
      });
    } else if (chimeType === 2) {
      // 3. Among Us Task Complete Electronic Alert (Crisp double high-tech chime)
      const auNotes = [698.46, 1046.50]; // F5 -> C6
      auNotes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.09;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    } else if (chimeType === 3) {
      // 4. Retro 8-bit Coin / 1-Up Sparkle
      const notes = [987.77, 1318.51]; // B5 -> E6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.08;

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.24);
      });
    } else if (chimeType === 4) {
      // 5. Sci-Fi Powerup Glissando
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.24);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      // 6. Crystal Bell Harmony
      const chord = [659.25, 830.61, 1046.5]; // E5, G#5, C6
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.14, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.36);
      });
    }
  }

  playCorrect() {
    this.playReward();
  }

  playError() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  }

  playPop() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.07);
  }

  // Major Victory Fanfare
  playFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;

    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C major triumph
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.65);
    });
  }
}

export const sound = new SoundEngine();

export function speakText(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1.05;
  window.speechSynthesis.speak(utterance);
}
