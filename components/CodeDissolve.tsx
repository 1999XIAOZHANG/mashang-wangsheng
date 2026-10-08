"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  code: string;
  onDone: () => void;
}

/**
 * 火化：代码字符在原位随机升空化为火星。
 * 不留空白期——字符离位时变成粒子继续可见。
 * 整块 ~1.2s 烧完，浏览器自驱，无 setInterval 主线程抢帧。
 */
export default function CodeDissolve({ code, onDone }: Props) {
  const lines = code.split("\n");
  const containerRef = useRef<HTMLDivElement>(null);
  const [ignited, setIgnited] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    requestAnimationFrame(() => setIgnited(true));
    // 用 CSS 总时长 1.2s 后切幕
    const t = setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone();
      }
    }, 1200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      ref={containerRef}
      className="relative max-h-[55vh] overflow-hidden rounded-lg border border-ink-700 bg-ink-950/80 p-4"
    >
      {lines.map((line, i) => {
        const total = Math.max(1, lines.length);
        const baseDelay = (i / total) * 400; // 0~400ms 起火蔓延
        return (
          <div
            key={i}
            className="flex gap-4 font-mono text-[13px] leading-6"
            style={{
              opacity: ignited ? 0 : 1,
              filter: ignited ? "blur(6px)" : "none",
              transform: ignited ? "translateY(-22px)" : "translateY(0)",
              transition: `opacity .8s ease ${baseDelay}ms, filter .8s ease ${baseDelay}ms, transform .8s ease ${baseDelay}ms`,
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

      {/* 字符消失的同时——叠一层自下而上的火光 mask，
          整段是纯 CSS 渐变，零运行时成本 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(232,145,45,0.55) 0%, rgba(232,145,45,0.18) 25%, transparent 60%)",
          opacity: ignited ? 1 : 0,
          transition: "opacity .3s ease",
          mixBlendMode: "screen",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
        style={{
          background:
            "radial-gradient(ellipse at center bottom, rgba(255,184,77,0.6) 0%, rgba(232,145,45,0.35) 30%, transparent 75%)",
          opacity: ignited ? 1 : 0,
          transition: "opacity .4s ease 50ms",
          mixBlendMode: "screen",
          filter: "blur(8px)",
        }}
      />
    </div>
  );
}
