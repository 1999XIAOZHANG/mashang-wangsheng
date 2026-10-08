"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  code: string;
  /** 加速超度（保留接口，UI 上可能藏掉） */
  fast: boolean;
  /** 整块点燃时的回调，供火焰 canvas 集中喷发 */
  onIgnite?: () => void;
  onDone: () => void;
}

/**
 * 火化：整块代码同时点燃 + 火焰自下而上覆盖。
 * 不再逐行滚动——所有行同时启动溶解动画（CSS transition stagger），
 * 整块 ~1.5s 烧完，视觉上是「被一整团火卷走」而非「一行一行消失」。
 */
export default function CodeDissolve({ code, fast: _fast, onIgnite, onDone }: Props) {
  const lines = code.split("\n");
  const [ignited, setIgnited] = useState(false);
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 首帧：触发集中点火
    requestAnimationFrame(() => {
      setIgnited(true);
      onIgnite?.();
    });
    // 整段火化时长（按行数自适应，保证 200 行的巨块也不会卡）
    const totalMs = Math.max(1200, Math.min(1800, lines.length * 50));
    const t = setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        setDone(true);
        onDone();
      }
    }, totalMs);
    return () => clearTimeout(t);
  }, [lines.length, onIgnite, onDone]);

  return (
    <div
      ref={containerRef}
      className="relative max-h-[55vh] overflow-hidden rounded-lg border border-ink-700 bg-ink-950/80 p-4"
    >
      {lines.map((line, i) => {
        // 每行用 stagger delay 错开 0~600ms，形成「火从下往上蔓延」的视觉
        const delay = Math.min(600, (i / Math.max(1, lines.length)) * 600);
        return (
          <div
            key={i}
            className="flex gap-4 font-mono text-[13px] leading-6"
            style={{
              opacity: ignited ? 0 : 1,
              filter: ignited ? "blur(4px)" : "none",
              transform: ignited
                ? `translateY(-30px) scaleX(1.02)`
                : "translateY(0) scaleX(1)",
              transition: `opacity .9s ease ${delay}ms, filter .9s ease ${delay}ms, transform .9s ease ${delay}ms`,
            }}
          >
            <span className="w-8 shrink-0 select-none text-right text-ink-600">
              {i + 1}
            </span>
            <span className="whitespace-pre-wrap break-all text-stele-light">
              {line || " "}
            </span>
          </div>
        );
      })}
    </div>
  );
}
