export type AudioBus = "music" | "nature" | "sfx";
export type AudioStatus = "idle" | "playing" | "muted" | "error";

const makeLoop = (src: string) => {
  const audio = new Audio(src);
  audio.loop = true;
  audio.preload = "none";
  audio.crossOrigin = "anonymous";
  return audio;
};

class WorldAudio {
  private tracks = {
    music: makeLoop("./assets/audio/chill-lofi.ogg"),
    birds: makeLoop("./assets/audio/birds.ogg"),
    river: makeLoop("./assets/audio/river.ogg"),
    wind: makeLoop("./assets/audio/wind.ogg"),
  };
  private volumes: Record<AudioBus, number> = { music: .32, nature: .42, sfx: .55 };
  private muted = true;
  private started = false;
  private status: AudioStatus = "idle";
  private listeners = new Set<(status: AudioStatus, message?: string) => void>();

  constructor() {
    Object.values(this.tracks).forEach((track) => track.addEventListener("error", () => this.report("error", "An ambience file could not be loaded. The portfolio remains fully usable.")));
  }

  onStatus(listener: (status: AudioStatus, message?: string) => void) { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; }

  async start() {
    this.started = true;
    this.muted = false;
    try {
      await Promise.allSettled(Object.values(this.tracks).map((track) => { track.preload = "auto"; return track.play(); }));
      this.applyMix("village", false, 0);
      this.report("playing");
    } catch {
      this.report("error", "Your browser blocked audio. Use the sound button to try again.");
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    Object.values(this.tracks).forEach((track) => { track.muted = muted; });
    this.report(muted ? "muted" : this.started ? "playing" : "idle");
  }

  setBusVolume(bus: AudioBus, volume: number) {
    this.volumes[bus] = Math.max(0, Math.min(1, volume));
    this.applyMix(this.tracks.birds.volume > .01 ? "village" : "interior", false);
  }

  getBusVolume(bus: AudioBus) { return this.volumes[bus]; }

  applyMix(environment: "village" | "interior", night: boolean, duration = 800) {
    if (!this.started) return;
    const targets = {
      music: this.volumes.music * (environment === "interior" ? .72 : 1),
      birds: environment === "village" && !night ? this.volumes.nature * .62 : 0,
      river: environment === "village" ? this.volumes.nature * .48 : 0,
      wind: this.volumes.nature * (environment === "village" ? (night ? .42 : .2) : .08),
    };
    const start = performance.now();
    const from = Object.fromEntries(Object.entries(this.tracks).map(([key, track]) => [key, track.volume])) as Record<keyof typeof this.tracks, number>;
    const frame = (now: number) => {
      const progress = duration ? Math.max(0, Math.min(1, (now - start) / duration)) : 1;
      (Object.keys(this.tracks) as Array<keyof typeof this.tracks>).forEach((key) => { this.tracks[key].volume = Math.max(0, Math.min(1, from[key] + (targets[key] - from[key]) * progress)); });
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  playSfx(name: "portal" | "step") {
    if (!this.started || this.muted) return;
    const sfx = new Audio(`./assets/audio/${name}.ogg`);
    sfx.volume = this.volumes.sfx;
    void sfx.play().catch(() => this.report("error", "A sound effect could not play."));
  }

  private report(status: AudioStatus, message?: string) { this.status = status; this.listeners.forEach((listener) => listener(status, message)); }
}

export const ambientAudio = new WorldAudio();
