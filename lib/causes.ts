import type { CauseId } from "./types";

export interface CauseDef {
  id: CauseId;
  /** 印章式单字徽记 */
  emblem: string;
  name: string;
  tagline: string;
  /** 注入 Prompt 的悼词方向强约束 */
  promptHint: string;
  /** 火焰色调（hex） */
  flameColor: string;
}

export const CAUSES: CauseDef[] = [
  {
    id: "legacy",
    emblem: "祖",
    name: "祖传屎山",
    tagline: "这段代码比我的工龄还长",
    promptHint: "围绕「没人敢动、代代相传、祖训不可违」的沧桑感展开叙事",
    flameColor: "#d4a24a",
  },
  {
    id: "pm",
    emblem: "变",
    name: "需求变更",
    tagline: "死于第 18 次改需求",
    promptHint: "围绕「昨天的明天又变了」的荒诞与无奈展开叙事",
    flameColor: "#a06bdb",
  },
  {
    id: "overdesign",
    emblem: "繁",
    name: "过度设计",
    tagline: "Hello World 用了 23 个设计模式",
    promptHint: "围绕「聪明反被聪明误」的讽刺展开叙事",
    flameColor: "#4a90d9",
  },
  {
    id: "mystic",
    emblem: "玄",
    name: "赛博玄学",
    tagline: "在我电脑上是好的！",
    promptHint: "围绕「无法复现、时灵时不灵、月圆之夜才跑通」的悬疑展开叙事",
    flameColor: "#58b368",
  },
  {
    id: "oom",
    emblem: "耗",
    name: "性能压榨",
    tagline: "被老板「再优化优化」致死",
    promptHint: "围绕「油尽灯枯、OOM 被杀、为省 2ms 内存献身」的悲壮展开叙事",
    flameColor: "#e0662e",
  },
  {
    id: "orphan",
    emblem: "孤",
    name: "无人认领",
    tagline: "注释写着：别动，我也不知道为什么",
    promptHint: "围绕「作者已离职、孤儿代码、无人祭拜」的孤寂展开叙事",
    flameColor: "#9aa0a6",
  },
];

export function getCause(id: CauseId): CauseDef {
  return CAUSES.find((c) => c.id === id) ?? CAUSES[0];
}
