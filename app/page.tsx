"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import CodeInput from "@/components/CodeInput";
import CausePicker from "@/components/CausePicker";
import LoadingRitual from "@/components/LoadingRitual";
import AutopsyReport from "@/components/AutopsyReport";
import PKArena from "@/components/PKArena";
import FlameCanvas, { type FlameHandle } from "@/components/FlameCanvas";
import CodeDissolve from "@/components/CodeDissolve";
import RebirthCode from "@/components/RebirthCode";
import ObituaryCard from "@/components/ObituaryCard";
import ErrorBoundary from "@/components/ErrorBoundary";
import { WoodenFish } from "@/lib/woodenFish";
import { getCause } from "@/lib/causes";
import { DEMO_AUTOPSY, DEMO_REBIRTH } from "@/lib/demoData";
import type {
  AutopsyResponse,
  CauseId,
  PKSlot,
  RebirthResponse,
  Stage,
} from "@/lib/types";

const ACT_LABEL: Partial<Record<Stage, string>> = {
  causes: "第一幕 · 判定死因",
  "autopsy-loading": "第一幕 · 验尸",
  report: "第一幕 · 验尸报告",
  pk: "第二幕 · 追悼会 · 殡葬师竞写",
  flame: "第三幕 · 火化",
  rebirth: "第四幕 · 转世",
  card: "第五幕 · 讣告",
};

export default function Home() {
  const [stage, setStage] = useState<Stage>("input");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [causes, setCauses] = useState<CauseId[]>([]);
  const [autopsy, setAutopsy] = useState<AutopsyResponse | null>(null);
  const [chosenModel, setChosenModel] = useState<string | null>(null);
  const [chosenVendor, setChosenVendor] = useState<string | null>(null);
  const [rebirth, setRebirth] = useState<RebirthResponse | null>(null);
  const [fastBurn, setFastBurn] = useState(false);
  const [blackingOut, setBlackingOut] = useState(false);
  const [muted, setMuted] = useState(false);

  const flameRef = useRef<FlameHandle>(null);
  const fishRef = useRef<WoodenFish | null>(null);

  const tint = causes.length > 0 ? getCause(causes[0]).flameColor : "#e8912d";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stage]);

  /* ---------- 流程 ---------- */

  function handleEnshrine(c: string, lang: string) {
    setCode(c);
    setLanguage(lang);
    setStage("causes");
  }

  function toggleCause(id: CauseId) {
    setCauses((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function confirmCauses() {
    setStage("autopsy-loading");
    try {
      const res = await fetch("/api/autopsy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, causes }),
      });
      const data: AutopsyResponse = await res.json();
      if (!res.ok || !data?.autopsy) throw new Error("验尸失败");
      setAutopsy(data);
    } catch {
      setAutopsy(DEMO_AUTOPSY); // 网络级失败兜底
    }
    setStage("report");
  }

  function enterPK() {
    setChosenModel(null);
    setChosenVendor(null);
    setStage("pk");
  }

  function chooseEulogist(slot: PKSlot) {
    setChosenModel(slot.model);
    setChosenVendor(slot.vendor);
  }

  async function startFlame() {
    setStage("flame");
    fishRef.current ??= new WoodenFish();
    fishRef.current.setMuted(muted);
    fishRef.current.start();
    // 转世预取：火化期间后台进行
    try {
      const res = await fetch("/api/rebirth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, causes }),
      });
      const data: RebirthResponse = await res.json();
      if (data?.refactored_code) setRebirth(data);
    } catch {
      /* 火化完成后统一兜底 */
    }
  }

  function handleFlameDone() {
    setBlackingOut(true);
    setTimeout(() => {
      fishRef.current?.stop();
      setRebirth((r) => r ?? DEMO_REBIRTH); // 真实结果晚到也不被演示数据覆盖
      setStage("rebirth");
      setTimeout(() => setBlackingOut(false), 400);
    }, 500);
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    fishRef.current?.setMuted(next);
  }

  function restart() {
    fishRef.current?.stop();
    setStage("input");
    setCode("");
    setCauses([]);
    setAutopsy(null);
    setChosenModel(null);
    setChosenVendor(null);
    setRebirth(null);
    setFastBurn(false);
  }

  const handleLineDissolve = useCallback((x: number, y: number) => {
    flameRef.current?.emitAt(x, y, 8);
  }, []);

  /* ---------- 渲染 ---------- */

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-6xl px-4 pb-16 sm:px-6">
      {/* 品牌 */}
      <header className="flex flex-col items-center gap-2 py-10 text-center">
        <h1 className="text-4xl font-bold tracking-[0.35em] text-buddha-bright sm:text-5xl">
          码上往生
        </h1>
        <p className="text-xs tracking-[0.4em] text-stele">电 子 往 生 堂 · 代 客 超 度 祖 传 代 码</p>
        {ACT_LABEL[stage] && (
          <p className="mt-2 rounded-full border border-ink-700 px-4 py-1 text-xs tracking-[0.3em] text-candle">
            {ACT_LABEL[stage]}
          </p>
        )}
      </header>

      {/* 离线演示提示：仅 dev 环境 + 明确用户要求时显示，避免污染演示体验 */}
      {autopsy?.fallback && process.env.NODE_ENV === "development" && (
        <div className="mx-auto mb-8 max-w-2xl rounded border border-candle/40 bg-candle/10 px-4 py-2 text-center text-xs text-candle-bright">
          往生堂线路繁忙，正在演示昨天的葬礼
        </div>
      )}

      {/* 五幕内容：错误边界兜底，单幕崩溃不污染整页 */}
      <ErrorBoundary>

      {/* 五幕 */}
      {stage === "input" && <CodeInput onEnshrine={handleEnshrine} />}

      {stage === "causes" && (
        <CausePicker
          selected={causes}
          onToggle={toggleCause}
          onConfirm={confirmCauses}
        />
      )}

      {stage === "autopsy-loading" && <LoadingRitual />}

      {stage === "report" && autopsy && (
        <AutopsyReport data={autopsy} causes={causes} onNext={enterPK} />
      )}

      {stage === "pk" && autopsy && (
        <PKArena
          autopsy={autopsy.autopsy}
          causes={causes}
          chosenModel={chosenModel}
          onChoose={chooseEulogist}
          onNext={startFlame}
        />
      )}

      {stage === "flame" && (
        <div className="fade-in mx-auto w-full max-w-3xl">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl tracking-[0.3em] text-buddha-bright">
              火化 · 送它最后一程
            </h2>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={toggleMute}
                className="rounded border border-ink-600 px-3 py-1.5 text-stele transition-colors hover:border-candle hover:text-candle-bright"
              >
                木鱼 {muted ? "关" : "开"}
              </button>
              {!fastBurn && (
                <button
                  onClick={() => setFastBurn(true)}
                  className="rounded border border-ink-600 px-3 py-1.5 text-stele transition-colors hover:border-candle hover:text-candle-bright"
                >
                  加速超度
                </button>
              )}
            </div>
          </div>
          <div className="relative">
            <CodeDissolve
              code={code}
              fast={fastBurn}
              onLineDissolve={handleLineDissolve}
              onDone={handleFlameDone}
            />
            <FlameCanvas
              ref={flameRef}
              tint={tint}
              ambient
              className="pointer-events-none absolute inset-0"
            />
          </div>
          <p className="mt-5 text-center font-kai text-sm text-stele">
            {chosenVendor ? `${chosenVendor} 的悼词随行火化，青烟即去，Bug 即散。` : "青烟即去，Bug 即散。"}
          </p>
        </div>
      )}

      {stage === "rebirth" &&
        (rebirth ? (
          <RebirthCode data={rebirth} onNext={() => setStage("card")} />
        ) : (
          <LoadingRitual label="转世投胎中，胎里已带上全部教训…" />
        ))}

      {stage === "card" && autopsy && (
        <ObituaryCard
          autopsy={autopsy}
          causes={causes}
          chosenVendor={chosenVendor}
          rebirthAs={rebirth?.rebirth_as ?? ""}
          onRestart={restart}
        />
      )}

      {/* 落款 */}
      <footer className="mt-20 text-center">
        <p className="font-kai text-sm tracking-[0.3em] text-ink-600">
          愿天下代码，死得明白，投得体面
        </p>
      </footer>

      </ErrorBoundary>

      {/* 火化结束黑场过渡 */}
      {blackingOut && (
        <div className="fade-in fixed inset-0 z-40 bg-black" />
      )}
    </main>
  );
}
