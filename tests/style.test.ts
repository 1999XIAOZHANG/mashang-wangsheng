import { describe, expect, it } from "vitest";
import {
  DEMO_AUTOPSY,
  DEMO_EULOGIES,
  DEMO_REBIRTH,
} from "@/lib/demoData";
import { FORBIDDEN_WORDS } from "@/lib/prompts";

/**
 * 风格守卫：演示文案是全站文风基准，
 * 禁词表（客服话术）一个都不许出现。
 */
function allDemoTexts(): string[] {
  const texts: string[] = [...Object.values(DEMO_EULOGIES)];
  const a = DEMO_AUTOPSY.autopsy;
  texts.push(
    DEMO_AUTOPSY.epitaph,
    DEMO_AUTOPSY.reincarnation_advice,
    a.time_of_death,
    a.direct_cause,
    ...a.premortem,
    ...a.smells,
    ...DEMO_REBIRTH.changes,
    DEMO_REBIRTH.rebirth_as
  );
  return texts;
}

describe("悼词风格守卫", () => {
  it("演示文案不含任何禁词", () => {
    const violations: string[] = [];
    for (const text of allDemoTexts()) {
      for (const word of FORBIDDEN_WORDS) {
        if (text.includes(word)) violations.push(`"${word}" 出现在: ${text.slice(0, 30)}…`);
      }
    }
    expect(violations).toEqual([]);
  });

  it("墓志铭 ≤ 20 字", () => {
    expect(DEMO_AUTOPSY.epitaph.length).toBeLessThanOrEqual(20);
  });

  it("四家殡葬师各有演示稿且长度合规（150-280 字）", () => {
    for (const [model, eulogy] of Object.entries(DEMO_EULOGIES)) {
      expect(eulogy.length, model).toBeGreaterThanOrEqual(150);
      expect(eulogy.length, model).toBeLessThanOrEqual(280);
    }
  });
});
