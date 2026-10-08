"use client";

import { CAUSES } from "@/lib/causes";
import type { CauseId } from "@/lib/types";

interface Props {
  selected: CauseId[];
  onToggle: (id: CauseId) => void;
  onConfirm: () => void;
}

export default function CausePicker({ selected, onToggle, onConfirm }: Props) {
  return (
    <div className="fade-up mx-auto w-full max-w-3xl">
      <div className="mb-8 text-center">
        <h2 className="text-xl tracking-[0.3em] text-buddha-bright">验尸 · 判定死因</h2>
        <p className="mt-2 text-sm text-stele">
          它是怎么死的？可多选 —— <span className="text-candle">第一个</span>选中的是主死因
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CAUSES.map((c, i) => {
          const active = selected.includes(c.id);
          const order = selected.indexOf(c.id);
          return (
            <button
              key={c.id}
              onClick={() => onToggle(c.id)}
              style={{ animationDelay: `${i * 60}ms` }}
              className={`fade-up group relative flex items-center gap-4 rounded-lg border p-4 text-left transition-all ${
                active
                  ? "border-candle bg-ink-800 shadow-candle"
                  : "border-ink-700 bg-ink-900 hover:border-ink-600"
              }`}
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 text-xl ${
                  active
                    ? "border-candle text-candle-bright candle-glow"
                    : "border-ink-600 text-stele"
                }`}
              >
                {c.emblem}
              </span>
              <span className="min-w-0">
                <span className="block text-base text-stele-light">{c.name}</span>
                <span className="mt-1 block truncate text-xs text-stele">{c.tagline}</span>
              </span>
              {active && order === 0 && (
                <span className="absolute right-2 top-2 rounded bg-candle/15 px-1.5 py-0.5 text-[10px] text-candle-bright">
                  主死因
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onConfirm}
          disabled={selected.length === 0}
          className="rounded-md border border-buddha bg-ink-800 px-10 py-3 text-lg tracking-[0.4em] text-buddha-bright transition-all enabled:hover:shadow-gold disabled:cursor-not-allowed disabled:border-ink-700 disabled:text-ink-600"
        >
          开始验尸
        </button>
        {selected.length === 0 && (
          <p className="mt-3 text-xs text-stele">请至少为它选一个死因</p>
        )}
      </div>
    </div>
  );
}
