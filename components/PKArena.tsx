"use client";

import { useEffect, useRef, useState } from "react";
import { PK_MODELS } from "@/lib/models";
import type { AutopsyReport, CauseId, EulogyResponse, PKSlot } from "@/lib/types";
import TypewriterText from "./TypewriterText";

interface Props {
  autopsy: AutopsyReport;
  causes: CauseId[];
  chosenModel: string | null;
  onChoose: (slot: PKSlot) => void;
  onNext: () => void;
}

/** 追悼会 · 四家殡葬师同题竞写 */
export default function PKArena({ autopsy, causes, chosenModel, onChoose, onNext }: Props) {
  const [slots, setSlots] = useState<PKSlot[]>(
    PK_MODELS.map((m) => ({
      model: m.id,
      vendor: m.vendor,
      persona: m.persona,
      status: "writing",
      eulogy: "",
      fallback: false,
    }))
  );
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    PK_MODELS.forEach((m) => {
      fetch("/api/eulogy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: m.id, autopsy, causes }),
      })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((d: EulogyResponse) => {
          setSlots((prev) =>
            prev.map((s) =>
              s.model === m.id
                ? { ...s, status: "done", eulogy: d.eulogy, fallback: d.fallback }
                : s
            )
          );
        })
        .catch(() => {
          setSlots((prev) =>
            prev.map((s) => (s.model === m.id ? { ...s, status: "absent" } : s))
          );
        });
    });
  }, [autopsy, causes]);

  const anyDone = slots.some((s) => s.status === "done");
  const chosen = slots.find((s) => s.model === chosenModel) ?? null;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="fade-up mb-10 text-center">
        <h2 className="text-2xl tracking-[0.4em] text-buddha-bright">追悼会 · 殡葬师竞写</h2>
        <p className="mt-3 text-sm leading-relaxed text-stele">
          同一具遗体，同一份验尸报告，四家同题竞写。
          <br className="sm:hidden" />
          你的一票，决定谁有资格致悼。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {slots.map((s, i) => {
          const isChosen = s.model === chosenModel;
          const dimmed = chosenModel !== null && !isChosen;
          return (
            <div
              key={s.model}
              style={{ animationDelay: `${i * 90}ms` }}
              className={`fade-up relative flex min-h-[260px] flex-col rounded-t-[120px] rounded-b-lg border bg-ink-900 p-5 pt-12 transition-all ${
                isChosen
                  ? "border-buddha shadow-gold"
                  : "border-ink-700"
              } ${dimmed ? "opacity-45 saturate-50" : ""}`}
            >
              {/* 墓碑顶 */}
              <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-ink-600 bg-ink-950 px-4 py-1.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    s.status === "writing"
                      ? "bg-candle candle-glow"
                      : s.status === "done"
                        ? "bg-buddha-bright"
                        : "bg-ink-600"
                  }`}
                />
                <span className="text-sm tracking-widest text-stele-light">{s.vendor}</span>
                <span className="text-[10px] text-stele">{s.persona}</span>
              </div>

              {s.status === "writing" && (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8">
                  <div className="flicker h-5 w-2.5 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-gradient-to-b from-candle-bright to-candle-dim blur-[1px]" />
                  <p className="text-sm text-stele">
                    撰写中<span className="animate-pulse">…</span>
                  </p>
                </div>
              )}

              {s.status === "absent" && (
                <div className="flex flex-1 items-center justify-center py-8">
                  <p className="font-kai text-sm text-ink-600">
                    该殡葬师缺席今日追悼会
                  </p>
                </div>
              )}

              {s.status === "done" && (
                <>
                  <p className="flex-1 font-kai text-[15px] leading-loose text-stele-light">
                    <TypewriterText text={s.eulogy} tickMs={16} charsPerTick={2} />
                  </p>
                  {s.fallback && (
                    <span className="mt-2 self-start rounded bg-candle/10 px-1.5 py-0.5 text-[10px] text-candle">
                      线路繁忙 · 演示稿
                    </span>
                  )}
                  <button
                    onClick={() => onChoose(s)}
                    disabled={chosenModel !== null}
                    className={`mt-4 self-center rounded-full border px-8 py-2 text-sm tracking-[0.4em] transition-all ${
                      isChosen
                        ? "border-buddha bg-buddha/10 text-buddha-bright"
                        : "border-ink-600 text-stele enabled:hover:border-candle enabled:hover:text-candle-bright disabled:cursor-not-allowed"
                    }`}
                  >
                    {isChosen ? "已致悼" : "致 悼"}
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="fade-up mt-10 text-center">
        {chosen ? (
          <>
            <p className="mb-4 font-kai text-sm text-buddha-bright">
              本篇悼词将由 {chosen.vendor} 亲自诵读，随后送入火化
            </p>
            <button
              onClick={onNext}
              className="rounded-md border border-seal bg-seal/10 px-10 py-3 text-lg tracking-[0.4em] text-[#e08573] transition-all hover:bg-seal/20 hover:shadow-candle"
            >
              送它火化
            </button>
          </>
        ) : (
          <p className="text-xs text-stele">
            {anyDone ? "读完再投，票要投给最懂它的那家" : "四家正在赶稿，稍安勿躁…"}
          </p>
        )}
      </div>
    </div>
  );
}
