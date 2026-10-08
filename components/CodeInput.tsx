"use client";

import { useRef, useState } from "react";
import { detectLanguage } from "@/lib/detectLanguage";
import { DEMO_CODE } from "@/lib/demoData";

const MAX_LINES = 200;

interface Props {
  onEnshrine: (code: string, language: string, truncated: boolean) => void;
}

export default function CodeInput({ onEnshrine }: Props) {
  const [code, setCode] = useState("");
  const [filename, setFilename] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const lines = code ? code.split("\n").length : 0;
  const language = code.trim() ? detectLanguage(code, filename ?? undefined) : "—";

  function readFile(f: File) {
    const reader = new FileReader();
    reader.onload = () => {
      setCode(String(reader.result ?? ""));
      setFilename(f.name);
      setError(null);
    };
    reader.readAsText(f);
  }

  function submit() {
    if (!code.trim()) {
      setError("往生堂不收空气，请放入遗体（代码）");
      return;
    }
    const arr = code.split("\n");
    const truncated = arr.length > MAX_LINES;
    onEnshrine(
      truncated ? arr.slice(0, MAX_LINES).join("\n") : code,
      language,
      truncated
    );
  }

  return (
    <div className="fade-up mx-auto w-full max-w-3xl">
      <div className="mb-6 text-center">
        <h2 className="text-xl tracking-[0.3em] text-buddha-bright">入殓 · 献上遗体</h2>
        <p className="mt-2 text-sm text-stele">
          粘贴或拖入那段折磨你的代码，语言不限，死因自选
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) readFile(f);
        }}
        className={`rounded-lg border transition-colors ${
          dragOver ? "border-candle bg-ink-800" : "border-ink-700 bg-ink-900"
        }`}
      >
        <textarea
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(null);
          }}
          spellCheck={false}
          placeholder="// 把祖传屎山贴进来，让它体面地走……"
          className="h-72 w-full resize-none rounded-lg bg-transparent p-4 font-mono text-sm leading-relaxed text-stele-light outline-none placeholder:text-ink-600"
        />
        <div className="flex flex-wrap items-center gap-3 border-t border-ink-700 px-4 py-2.5 text-xs text-stele">
          <span className="rounded border border-ink-600 px-2 py-0.5 font-mono">{language}</span>
          <span className={lines > MAX_LINES ? "text-candle-bright" : ""}>
            {lines} 行
            {lines > MAX_LINES && " · 遗体过大，将截取前 200 行分批超度"}
          </span>
          {filename && <span className="truncate text-ink-600">{filename}</span>}
          <button
            onClick={() => fileRef.current?.click()}
            className="ml-auto underline-offset-4 hover:text-candle hover:underline"
          >
            上传文件
          </button>
          <button
            onClick={() => {
              setCode(DEMO_CODE);
              setFilename(null);
              setError(null);
            }}
            className="underline-offset-4 hover:text-candle hover:underline"
          >
            送一具试试
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".js,.ts,.tsx,.jsx,.py,.java,.go,.rs,.c,.cpp,.cs,.php,.rb,.kt,.swift,.sh,.sql,.html,.css,.vue,.lua,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) readFile(f);
            }}
          />
        </div>
      </div>

      {error && (
        <p className="mt-3 text-center text-sm text-seal">{error}</p>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={submit}
          className="group relative rounded-md border border-candle-dim bg-ink-800 px-10 py-3 text-lg tracking-[0.4em] text-candle-bright transition-all hover:border-candle hover:shadow-candle"
        >
          入 殓
        </button>
      </div>
    </div>
  );
}
