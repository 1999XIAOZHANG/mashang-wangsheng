"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "正在为遗体化妆…",
  "法师诵经中…",
  "正在核对生前罪证…",
  "往生堂营业中，请勿喧哗",
  "超度协议已签署，等待法医落笔…",
];

/** 入殓等待幕：烛火 + 轮播文案 */
export default function LoadingRitual({ label }: { label?: string }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % MESSAGES.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fade-in flex min-h-[50vh] flex-col items-center justify-center gap-10">
      {/* 烛火 */}
      <div className="relative flex flex-col items-center">
        <div className="flicker h-10 w-5 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-gradient-to-b from-candle-bright via-candle to-candle-dim blur-[1px]" />
        <div className="h-16 w-1 bg-gradient-to-b from-stele to-ink-800" />
        <div className="h-2 w-16 rounded-full bg-ink-800" />
        <div className="mt-3 h-16 w-24 rounded-[100%] bg-candle/10 blur-xl candle-glow" />
      </div>
      <p key={idx} className="fade-in font-kai text-lg tracking-[0.2em] text-stele-light">
        {label ?? MESSAGES[idx]}
      </p>
    </div>
  );
}
