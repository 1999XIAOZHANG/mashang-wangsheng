"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  code: string;
  /** 加速超度 */
  fast: boolean;
  /** 每行溶解时回调其在容器内的坐标，供火焰喷发 */
  onLineDissolve?: (x: number, y: number) => void;
  onDone: () => void;
}

/** 火化：代码逐行溶解上飘 */
export default function CodeDissolve({ code, fast, onLineDissolve, onDone }: Props) {
  const lines = code.split("\n");
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [dissolved, setDissolved] = useState(0);
  const doneRef = useRef(false);
  // 记录容器相对视口位置，只在开始时读一次，避免每行 layout
  const boxRectRef = useRef<DOMRect | null>(null);

  useEffect(() => {
    // 预读容器位置，之后只读每行 offsetLeft/Top（不触发布局）
    boxRectRef.current = containerRef.current?.getBoundingClientRect() ?? null;
    const stepMs = fast ? 18 : 70;
    const interval = setInterval(() => {
      setDissolved((d) => {
        if (d >= lines.length) return d;
        const el = lineRefs.current[d];
        const box = containerRef.current;
        if (el && box && onLineDissolve) {
          // 用 offsetTop 拿行在容器内的 Y；X 固定用容器中线即可（粒子本来就有横向摆动）
          onLineDissolve(box.clientWidth / 2, el.offsetTop + 6);
        }
        return d + 1;
      });
    }, stepMs);
    return () => clearInterval(interval);
  }, [fast, lines.length, onLineDissolve]);

  useEffect(() => {
    if (dissolved >= lines.length && !doneRef.current) {
      doneRef.current = true;
      const t = setTimeout(onDone, fast ? 250 : 800);
      return () => clearTimeout(t);
    }
  }, [dissolved, lines.length, fast, onDone]);

  return (
    <div
      ref={containerRef}
      className="relative max-h-[55vh] overflow-hidden rounded-lg border border-ink-700 bg-ink-950/80 p-4"
    >
      {lines.map((line, i) => (
        <div
          key={i}
          ref={(el) => {
            lineRefs.current[i] = el;
          }}
          className={`flex gap-4 font-mono text-[13px] leading-6 ${
            i < dissolved ? "line-dissolving" : ""
          }`}
        >
          <span className="w-8 shrink-0 select-none text-right text-ink-600">
            {i + 1}
          </span>
          <span className="whitespace-pre-wrap break-all text-stele-light">
            {line || " "}
          </span>
        </div>
      ))}
    </div>
  );
}
