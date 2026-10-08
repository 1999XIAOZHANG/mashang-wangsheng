/** 验尸官：中文毒舌感 + 代码分析 */
export const AUTOPSY_MODEL = "deepseek/deepseek-v3.2";

/** 转世法师：代码专精 */
export const REBIRTH_MODEL = "qwen/qwen3-coder";

export interface PKModel {
  id: string;
  vendor: string;
  persona: string;
}

/** PK 四家：同一份题目，风格差异完全来自模型本身 */
export const PK_MODELS: PKModel[] = [
  { id: "deepseek/deepseek-chat", vendor: "DeepSeek", persona: "毒舌担当" },
  { id: "openai/gpt-5-mini", vendor: "GPT-5 mini", persona: "学院派" },
  { id: "anthropic/claude-3-haiku", vendor: "Claude Haiku", persona: "文艺担当" },
  { id: "google/gemini-2.0-flash", vendor: "Gemini Flash", persona: "接地气" },
];

export function findPKModel(id: string): PKModel | undefined {
  return PK_MODELS.find((m) => m.id === id);
}
