"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  text: string;
  /** 每 tick 打出的字符数（代码类文本可调大） */
  charsPerTick?: number;
  tickMs?: number;
  className?: string;
  onDone?: () => void;
  cursor?: boolean;
}

/** 打字机文本：悼词、代码重生共用 */
export default function TypewriterText({
  text,
  charsPerTick = 1,
  tickMs = 28,
  className,
  onDone,
  cursor = true,
}: Props) {
  const [shown, setShown] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    setShown(0);
    doneRef.current = false;
  }, [text]);

  useEffect(() => {
    if (shown >= text.length) {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone?.();
      }
      return;
    }
    const t = setTimeout(() => {
      setShown((s) => Math.min(text.length, s + charsPerTick));
    }, tickMs);
    return () => clearTimeout(t);
  }, [shown, text, charsPerTick, tickMs, onDone]);

  const finished = shown >= text.length;

  return (
    <span className={className}>
      {text.slice(0, shown)}
      {cursor && !finished && (
        <span className="animate-pulse text-candle-bright">▍</span>
      )}
    </span>
  );
}
