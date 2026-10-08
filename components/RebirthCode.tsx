"use client";

import { useState } from "react";
import type { RebirthResponse } from "@/lib/types";
import TypewriterText from "./TypewriterText";

interface Props {
  data: RebirthResponse;
  onNext: () => void;
}

/** 转世：重构代码金色打字机重生 */
export default function RebirthCode({ data, onNext }: Props) {
  const [skip, setSkip] = useState(false);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="fade-up mb-3 text-center">
        <h2 className="text-2xl tracking-[0.4em] text-buddha-bright">转世 · 投胎</h2>
      </div>
      <p
        className="fade-up mb-8 text-center font-kai text-lg text-buddha"
        style={{ animation: "goldShimmer 3s ease-in-out infinite, fadeUp .7s ease both" }}
      >
        它投胎成了 —— {data.rebirth_as}
      </p>

      <div className="fade-up relative rounded-lg border border-buddha/30 bg-ink-950/80 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded border border-buddha/30 bg-buddha/5 px-2 py-0.5 font-mono text-[10px] tracking-widest text-buddha-bright">
            转世真身
          </span>
          {!skip && (
            <button
              onClick={() => setSkip(true)}
              className="text-xs text-stele underline-offset-4 hover:text-buddha-bright hover:underline"
            >
              跳过重生过程
            </button>
          )}
        </div>
        <pre className="max-h-[50vh] overflow-auto whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-buddha-bright">
          {skip ? (
            data.refactored_code
          ) : (
            <TypewriterText
              text={data.refactored_code}
              tickMs={14}
              charsPerTick={4}
              cursor={false}
            />
          )}
        </pre>
      </div>

      <div className="fade-up mt-8" style={{ animationDelay: "300ms" }}>
        <h3 className="mb-3 text-sm tracking-[0.3em] text-candle">转世改动</h3>
        <ul className="space-y-2">
          {data.changes.map((c, i) => (
            <li
              key={i}
              className="flex gap-3 rounded border-l-2 border-buddha/40 bg-ink-900 px-4 py-2.5 text-sm leading-relaxed text-stele-light"
            >
              <span className="shrink-0 text-buddha">{i + 1}.</span>
              {c}
            </li>
          ))}
        </ul>
      </div>

      <div className="fade-up mt-10 text-center" style={{ animationDelay: "500ms" }}>
        <button
          onClick={onNext}
          className="rounded-md border border-candle-dim bg-ink-800 px-10 py-3 text-lg tracking-[0.3em] text-candle-bright transition-all hover:border-candle hover:shadow-candle"
        >
          领取讣告
        </button>
      </div>
    </div>
  );
}
