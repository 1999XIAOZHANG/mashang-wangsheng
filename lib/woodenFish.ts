/**
 * 木鱼声：Web Audio 纯合成（低频空腔 + 高频敲击），零音频文件。
 * 需在用户手势后调用 start（浏览器自动播放策略）。
 */
export class WoodenFish {
  private ctx: AudioContext | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private muted = false;

  private knock() {
    if (this.muted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const strike = (freq: number, dur: number, vol: number, type: OscillatorType) => {
      const o = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      o.frequency.exponentialRampToValueAtTime(Math.max(freq * 0.55, 40), t + dur);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(this.ctx!.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    };
    strike(175, 0.22, 0.45, "sine"); // 空腔共鸣
    strike(540, 0.07, 0.18, "triangle"); // 敲击脆响
  }

  start(intervalMs = 640) {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
    }
    void this.ctx.resume().catch(() => {});
    this.stop();
    this.timer = setInterval(() => this.knock(), intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  setMuted(m: boolean) {
    this.muted = m;
  }
}
