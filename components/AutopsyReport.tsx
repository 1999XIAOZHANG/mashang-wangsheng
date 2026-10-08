"use client";

import { CAUSES } from "@/lib/causes";
import type { AutopsyResponse, CauseId } from "@/lib/types";
import TypewriterText from "./TypewriterText";

interface Props {
  data: AutopsyResponse;
  causes: CauseId[];
  onNext: () => void;
}

const DELAYS = [0, 250, 600, 950, 1300, 1650];

export default function AutopsyReport({ data, causes, onNext }: Props) {
  const { autopsy, epitaph, reincarnation_advice } = data;
  const caseNo = String(1000 + ((autopsy.lines * 37) % 9000));
  const causeDefs = causes.map((id) => CAUSES.find((c) => c.id === id)!);

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* 报告头 */}
      <div
        className="fade-up mb-8 border-b border-ink-700 pb-6 text-center"
        style={{ animationDelay: `${DELAYS[0]}ms` }}
      >
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-ink-600" />
          <h2 className="text-2xl tracking-[0.5em] text-buddha-bright">验尸报告</h2>
          <span className="h-px w-10 bg-ink-600" />
        </div>
        <p className="mt-3 text-xs tracking-widest text-stele">
          往生堂法医科 · 尸检字第 {caseNo} 号
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded border border-ink-600 px-2 py-0.5 font-mono text-xs text-stele-light">
            {autopsy.language}
          </span>
          <span className="font-mono text-xs text-stele">{autopsy.lines} 行</span>
          {causeDefs.map((c) => (
            <span
              key={c.id}
              className="rounded-full border border-seal/50 px-2.5 py-0.5 text-xs text-seal"
              style={{ borderColor: `${c.flameColor}66`, color: c.flameColor }}
            >
              {c.emblem} {c.name}
            </span>
          ))}
        </div>
      </div>

      {/* 死亡时间 */}
      <section style={{ animationDelay: `${DELAYS[1]}ms` }} className="fade-up mb-6">
        <h3 className="mb-2 text-sm tracking-[0.3em] text-candle">死亡时间</h3>
        <p className="font-kai text-lg leading-relaxed text-stele-light">
          {autopsy.time_of_death}
        </p>
      </section>

      {/* 直接死因 */}
      <section style={{ animationDelay: `${DELAYS[2]}ms` }} className="fade-up mb-6">
        <h3 className="mb-2 text-sm tracking-[0.3em] text-candle">直接死因</h3>
        <p className="text-base leading-loose text-stele-light">
          <TypewriterText text={autopsy.direct_cause} tickMs={22} charsPerTick={2} />
        </p>
      </section>

      {/* 生前遭遇 */}
      <section style={{ animationDelay: `${DELAYS[3]}ms` }} className="fade-up mb-6">
        <h3 className="mb-3 text-sm tracking-[0.3em] text-candle">生前遭遇</h3>
        <ol className="space-y-2">
          {autopsy.premortem.map((p, i) => (
            <li key={i} className="flex gap-3 font-kai leading-relaxed text-stele-light">
              <span className="shrink-0 text-buddha">{i + 1}.</span>
              {p}
            </li>
          ))}
        </ol>
      </section>

      {/* 坏味道 */}
      <section style={{ animationDelay: `${DELAYS[4]}ms` }} className="fade-up mb-10">
        <h3 className="mb-3 text-sm tracking-[0.3em] text-candle">尸表坏味道</h3>
        <ul className="space-y-2">
          {autopsy.smells.map((s, i) => (
            <li
              key={i}
              className="rounded border-l-2 border-ink-600 bg-ink-900 px-4 py-2.5 font-mono text-xs leading-relaxed text-stele"
            >
              {s}
            </li>
          ))}
        </ul>
      </section>

      {/* 墓志铭 */}
      <section
        style={{ animationDelay: `${DELAYS[5]}ms` }}
        className="fade-up mb-10 flex flex-col items-center gap-6 sm:flex-row sm:justify-center"
      >
        <div className="relative flex min-h-[220px] w-40 items-start justify-center rounded-t-[80px] border border-ink-600 bg-gradient-to-b from-ink-800 to-ink-900 px-3 pb-6 pt-10 shadow-gold">
          <span className="absolute top-4 text-[10px] tracking-[0.3em] text-ink-600">
            往生堂
          </span>
          <p className="vertical-text epitaph-carved font-kai text-2xl text-buddha-bright">
            {epitaph}
          </p>
        </div>
        <div className="max-w-xs text-center sm:text-left">
          <h3 className="mb-2 text-sm tracking-[0.3em] text-candle">墓志铭</h3>
          <p className="mb-3 font-kai text-lg text-stele-light">{epitaph}</p>
          <p className="text-xs leading-relaxed text-stele">
            投胎建议：{reincarnation_advice}
          </p>
        </div>
      </section>

      <div style={{ animationDelay: `${DELAYS[5] + 300}ms` }} className="fade-up text-center">
        <button
          onClick={onNext}
          className="rounded-md border border-candle-dim bg-ink-800 px-10 py-3 text-lg tracking-[0.3em] text-candle-bright transition-all hover:border-candle hover:shadow-candle"
        >
          进入追悼会
        </button>
        <p className="mt-3 text-xs text-stele">四家殡葬师已就位，将同题竞写悼词</p>
      </div>
    </div>
  );
}
