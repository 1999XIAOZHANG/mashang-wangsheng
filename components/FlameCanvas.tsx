"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

export interface FlameHandle {
  /** 在容器坐标 (x, y) 处喷发一簇火星 */
  emitAt: (x: number, y: number, count?: number) => void;
}

interface Props {
  /** 火焰色调（#rrggbb），来自所选死因 */
  tint?: string;
  /** 是否持续从底部升起环境火星。默认 false：让画面更聚焦，溶解时爆发更集中 */
  ambient?: boolean;
  className?: string;
}

interface Particle {
  baseX: number;
  y: number;
  vy: number;
  swayA: number;
  swayW: number;
  phase: number;
  life: number;
  maxLife: number;
  size: number;
}

const MAX_PARTICLES = 300;

const FlameCanvas = forwardRef<FlameHandle, Props>(function FlameCanvas(
  { tint = "#e8912d", ambient = false, className },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const rafRef = useRef(0);
  const spriteRef = useRef<HTMLCanvasElement | null>(null);
  const ambientRef = useRef(ambient);
  const sizeRef = useRef({ w: 0, h: 0 });

  ambientRef.current = ambient;

  function makeSprite(): HTMLCanvasElement {
    const c = document.createElement("canvas");
    c.width = 32;
    c.height = 32;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, `${tint}ff`);
    grad.addColorStop(0.35, `${tint}aa`);
    grad.addColorStop(0.7, `${tint}33`);
    grad.addColorStop(1, `${tint}00`);
    g.fillStyle = grad;
    g.fillRect(0, 0, 32, 32);
    return c;
  }

  function spawn(x: number, y: number, boost = 1) {
    if (particles.current.length >= MAX_PARTICLES) return;
    const maxLife = 50 + Math.random() * 60;
    particles.current.push({
      baseX: x,
      y,
      vy: -(0.5 + Math.random() * 1.4) * boost,
      swayA: 6 + Math.random() * 16,
      swayW: 0.02 + Math.random() * 0.05,
      phase: Math.random() * Math.PI * 2,
      life: maxLife,
      maxLife,
      size: (6 + Math.random() * 14) * boost,
    });
  }

  useImperativeHandle(ref, () => ({
    emitAt(x: number, y: number, count = 6) {
      for (let i = 0; i < count; i++) {
        spawn(x + (Math.random() - 0.5) * 60, y + (Math.random() - 0.5) * 10, 1.5);
      }
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    spriteRef.current = makeSprite();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      sizeRef.current = { w: rect.width, h: rect.height };
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const tick = () => {
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);

      if (ambientRef.current) {
        spawn(w * 0.3 + Math.random() * w * 0.4, h * (0.85 + Math.random() * 0.1));
      }

      const arr = particles.current;
      // 一次 batch drawImage：只切一次 globalAlpha 段，减少 canvas 状态切换
      ctx.globalCompositeOperation = "lighter";
      for (let i = arr.length - 1; i >= 0; i--) {
        const p = arr[i];
        p.life -= 1;
        p.y += p.vy;
        if (p.life <= 0 || p.y < -20) {
          arr.splice(i, 1);
          continue;
        }
        const age = p.maxLife - p.life;
        const x = p.baseX + Math.sin(age * p.swayW + p.phase) * p.swayA;
        const alpha = Math.max(0, p.life / p.maxLife);
        const size = p.size * (0.5 + alpha * 0.5);
        ctx.globalAlpha = alpha;
        ctx.drawImage(spriteRef.current!, x - size / 2, p.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      particles.current = [];
    };
  }, [tint]);

  return <canvas ref={canvasRef} className={className} />;
});

export default FlameCanvas;
