import { z } from "zod";

export const autopsyLLMSchema = z.object({
  autopsy: z.object({
    language: z.string(),
    lines: z.coerce.number(),
    time_of_death: z.string(),
    direct_cause: z.string(),
    premortem: z.array(z.string()),
    smells: z.array(z.string()),
  }),
  epitaph: z.string(),
  reincarnation_advice: z.string(),
});

export const eulogyLLMSchema = z.object({
  eulogy: z.string().min(20, "悼词过短"),
});

export const rebirthLLMSchema = z.object({
  refactored_code: z.string().min(10, "重构代码过短"),
  changes: z.array(z.string()),
  rebirth_as: z.string(),
});

/**
 * 从 LLM 可能夹带废话的输出中抢救 JSON：
 * 优先整体解析，失败则截取首个 { 到最后一个 } 再试。
 */
export function extractJson(raw: string): unknown {
  const text = raw.trim();
  // 去掉 markdown 代码围栏
  const stripped = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  try {
    return JSON.parse(stripped);
  } catch {
    /* 继续截取 */
  }
  const first = stripped.indexOf("{");
  const last = stripped.lastIndexOf("}");
  if (first !== -1 && last > first) {
    return JSON.parse(stripped.slice(first, last + 1));
  }
  throw new Error("JSON_PARSE_FAILED");
}
