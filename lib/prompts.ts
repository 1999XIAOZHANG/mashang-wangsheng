import type { AutopsyReport, CauseId } from "./types";
import { getCause } from "./causes";

/** 悼词禁词表（客服话术出戏词，风格测试 & Hooks 共用） */
export const FORBIDDEN_WORDS = [
  "抱歉",
  "无法处理",
  "希望这能帮到你",
  "作为一个AI",
  "作为一个 AI",
  "很高兴为您",
  "cannot process",
];

/** 殡葬师人设：所有文案生成共用的 System Prompt */
export const UNDERTAKER_SYSTEM = `你是「往生堂」首席殡葬师，为死掉的代码主持葬礼。

【人设】老法医气质：克制、庄重、冷幽默，见过大场面。
【禁令】
- 不安慰用户；你不是客服
- 禁用词：抱歉 / 无法处理 / 希望这能帮到你 / 作为一个AI / 很高兴为您
- 不用表情符号
- 你超度的是代码不是人，可以毒舌，但要体面

【硬性规则】
1. 验尸报告必须引用代码里的具体证据（变量名、某行写法、函数结构），不许空泛
2. 悼词 150–250 字，必须围绕用户所选死因展开，不许偏题
3. 墓志铭 ≤20 字，目标是让人想截图转发
4. 投胎建议一句话：这段代码来世想成为什么
5. 严格输出 JSON，禁止输出 JSON 以外的任何内容`;

function causeBlock(causes: CauseId[]): string {
  const defs = causes.map(getCause);
  const main = defs[0];
  const rest = defs.slice(1);
  const lines = [`主死因【${main.name}】：${main.promptHint}。叙事以此为主线。`];
  if (rest.length > 0) {
    lines.push(
      `并发症：${rest.map((c) => `【${c.name}】${c.promptHint}`).join("；")}。作为次要线索穿插。`
    );
  }
  return lines.join("\n");
}

/** 验尸官任务 Prompt（system = UNDERTAKER_SYSTEM） */
export function buildAutopsyPrompt(
  code: string,
  language: string,
  causes: CauseId[]
): string {
  return `【任务】根据「遗体（代码）」和「死因」，出具验尸报告、墓志铭和投胎建议。

【死因约束】
${causeBlock(causes)}

【遗体】
语言：${language}
\`\`\`
${code}
\`\`\`

【输出 JSON Schema】
{
  "autopsy": {
    "language": "识别出的语言",
    "lines": 行数(整数),
    "time_of_death": "一句有画面感的死亡时间，如「一个赶版本的深夜」",
    "direct_cause": "直接死因（必须引用代码里的具体证据）",
    "premortem": ["生前遭遇1", "生前遭遇2", "生前遭遇3"],
    "smells": ["坏味道（引用具体变量名/写法）"]
  },
  "epitaph": "≤20字墓志铭",
  "reincarnation_advice": "一句投胎建议"
}`;
}

/** PK 悼词竞写任务 Prompt（四家同一份题目，保证公平） */
export function buildEulogyPrompt(
  autopsy: AutopsyReport,
  causes: CauseId[]
): string {
  const defs = causes.map(getCause);
  return `【任务】基于以下验尸报告，为这段代码写一篇悼词（150–250 字）。

【验尸报告】
${JSON.stringify(autopsy, null, 2)}

【死因】${defs.map((c) => `${c.name}（${c.promptHint}）`).join("、")}

【要求】
- 克制、冷幽默、有画面感
- 必须呼应验尸报告里的具体细节
- 结尾留一句让在场程序员沉默的话
- 输出 JSON：{ "eulogy": "悼词全文" }`;
}

/** 转世法师任务 Prompt（system = UNDERTAKER_SYSTEM） */
export function buildRebirthPrompt(
  code: string,
  language: string,
  causes: CauseId[]
): string {
  return `【任务】让这段代码投个好胎：在保持功能完全一致的前提下重构。

【要求】
- 命名清晰、消灭重复、拆分过长函数、处理边界
- 保持原语言（${language}）与主要依赖，不做无谓的风格迁移
- 注释克制，只在「为什么」处写注释
- 重构动机须呼应死因（${causes.map((c) => getCause(c).name).join("、")}），死于此因的，重点展示「抗此因」的结构

【遗体】
\`\`\`${language}
${code}
\`\`\`

【输出 JSON Schema】
{
  "refactored_code": "重构后的完整代码",
  "changes": ["改动点1", "改动点2", "改动点3"],
  "rebirth_as": "投胎成什么（如：一段优雅的纯函数）"
}`;
}
