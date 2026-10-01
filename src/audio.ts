class AmbientAudio {
  private context?: AudioContext;
  private gain?: GainNode;
  private nodes: OscillatorNode[] = [];

  async start() {
    if (!this.context) {
      this.context = new AudioContext();
      this.gain = this.context.createGain();
      this.gain.gain.value = 0.045;
      this.gain.connect(this.context.destination);
      [110, 164.81, 220].forEach((frequency, index) => {
        const oscillator = this.context!.createOscillator();
        const voiceGain = this.context!.createGain();
        oscillator.type = index === 1 ? "sine" : "triangle";
        oscillator.frequency.value = frequency;
        voiceGain.gain.value = index === 0 ? 0.4 : 0.18;
        oscillator.connect(voiceGain).connect(this.gain!);
        oscillator.start();
        this.nodes.push(oscillator);
      });
    }
    await this.context.resume();
    this.setMuted(false);
  }

  setMuted(muted: boolean) {
    if (!this.context || !this.gain) return;
    this.gain.gain.cancelScheduledValues(this.context.currentTime);
    this.gain.gain.linearRampToValueAtTime(muted ? 0 : 0.045, this.context.currentTime + 0.35);
    if (muted) void this.context.suspend(); else void this.context.resume();
  }
}

export const ambientAudio = new AmbientAudio();
