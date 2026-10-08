"use client";

import { useRef, useState } from "react";
import { CAUSES } from "@/lib/causes";
import type { AutopsyResponse, CauseId } from "@/lib/types";

interface Props {
  autopsy: AutopsyResponse;
  causes: CauseId[];
  chosenVendor: string | null;
  rebirthAs: string;
  onRestart: () => void;
}

/** 讣告卡片：html2canvas 导出 PNG（html2canvas 不支持 writing-mode，竖排用逐字堆叠实现） */
export default function ObituaryCard({
  autopsy,
  causes,
  chosenVendor,
  rebirthAs,
  onRestart,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const causeDefs = causes.map((id) => CAUSES.find((c) => c.id === id)!);
  const today = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  async function download() {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#0b0a08",
        useCORS: true,
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "讣告-码上往生.png";
      a.click();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="fade-up mx-auto w-full max-w-2xl">
      <h2 className="mb-8 text-center text-2xl tracking-[0.4em] text-buddha-bright">
        讣告已备
      </h2>

      <div
        ref={cardRef}
        className="relative mx-auto w-full max-w-xl border border-ink-600 bg-ink-950 p-3"
        style={{ width: 560 }}
      >
        <div className="border border-dashed border-ink-600 px-6 py-8">
          {/* 头 */}
          <div className="mb-6 text-center">
            <p className="text-[10px] tracking-[0.5em] text-ink-600">往生堂 谨启</p>
            <p className="mt-3 text-3xl font-bold tracking-[0.8em] text-buddha-bright">
              讣 告
            </p>
          </div>

          <div className="flex gap-6">
            {/* 竖排墓志铭（逐字堆叠，html2canvas 安全） */}
            <div className="flex w-24 shrink-0 justify-center rounded-t-[48px] border border-ink-600 bg-ink-900 py-5">
              <div className="flex flex-col items-center gap-2">
                {autopsy.epitaph.split("").map((ch, i) => (
                  <span key={i} className="font-kai text-xl text-buddha-bright">
                    {ch}
                  </span>
                ))}
              </div>
            </div>

            {/* 正文 */}
            <div className="min-w-0 flex-1 space-y-3 text-sm">
              <p className="font-kai leading-relaxed text-stele-light">
                一段 {autopsy.autopsy.language} 代码，共 {autopsy.autopsy.lines} 行，
                因
                {causeDefs.map((c) => c.name).join("、")}
                不治，于{autopsy.autopsy.time_of_death}与世长辞。
              </p>
              <div className="flex flex-wrap gap-1.5">
                {causeDefs.map((c) => (
                  <span
                    key={c.id}
                    className="rounded-full border px-2 py-0.5 text-[10px]"
                    style={{ borderColor: `${c.flameColor}66`, color: c.flameColor }}
                  >
                    {c.name}
                  </span>
                ))}
              </div>
              <p className="font-kai text-xs leading-relaxed text-stele">
                {chosenVendor
                  ? `本悼词由 ${chosenVendor} 亲自致悼。`
                  : "本悼词由往生堂代致。"}
              </p>
              <p className="border-t border-ink-700 pt-3 font-kai text-xs leading-relaxed text-stele">
                今已火化，转世为：{rebirthAs}。愿它来世无人敢改，也无需再改。
              </p>
            </div>
          </div>

          {/* 落款 */}
          <div className="mt-8 flex items-end justify-between">
            <p className="text-[10px] text-ink-600">{today}</p>
            <div className="flex flex-col items-center gap-1">
              <span className="seal px-2 py-1 text-sm">码上往生</span>
              <span className="text-[9px] text-ink-600">愿天下代码，死得明白，投得体面</span>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-[10px] text-ink-600">
        本讣告由 AI 生成，代码的死亡与重生均为虚构
      </p>

      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          onClick={download}
          disabled={downloading}
          className="rounded-md border border-candle-dim bg-ink-800 px-8 py-3 tracking-[0.3em] text-candle-bright transition-all hover:border-candle hover:shadow-candle disabled:opacity-50"
        >
          {downloading ? "正在盖印…" : "下载讣告"}
        </button>
        <button
          onClick={onRestart}
          className="rounded-md border border-ink-600 px-8 py-3 tracking-[0.3em] text-stele transition-all hover:border-stele hover:text-stele-light"
        >
          再办一场
        </button>
      </div>
    </div>
  );
}
