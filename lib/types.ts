/** 六大死因 ID */
export type CauseId =
  | "legacy"
  | "pm"
  | "overdesign"
  | "mystic"
  | "oom"
  | "orphan";

/** 验尸报告（LLM 结构化输出） */
export interface AutopsyReport {
  language: string;
  lines: number;
  time_of_death: string;
  direct_cause: string;
  premortem: string[];
  smells: string[];
}

/** POST /api/autopsy 响应 */
export interface AutopsyResponse {
  fallback: boolean;
  /** 是否配置了 API key（区分"真没 key 走 demo" vs "有 key 瞬时失败"） */
  hasKey?: boolean;
  autopsy: AutopsyReport;
  epitaph: string;
  reincarnation_advice: string;
}

/** POST /api/eulogy 响应（单家殡葬师） */
export interface EulogyResponse {
  fallback: boolean;
  model: string;
  vendor: string;
  eulogy: string;
}

/** POST /api/rebirth 响应 */
export interface RebirthResponse {
  fallback: boolean;
  refactored_code: string;
  changes: string[];
  rebirth_as: string;
}

/** PK 竞技场里一家殡葬师的状态 */
export interface PKSlot {
  model: string;
  vendor: string;
  persona: string;
  status: "writing" | "done" | "absent";
  eulogy: string;
  fallback: boolean;
}

/** 五幕状态机的 stage */
export type Stage =
  | "input"
  | "causes"
  | "autopsy-loading"
  | "report"
  | "pk"
  | "flame"
  | "rebirth"
  | "card";
