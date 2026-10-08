import { describe, expect, it } from "vitest";
import {
  autopsyLLMSchema,
  eulogyLLMSchema,
  extractJson,
  rebirthLLMSchema,
} from "@/lib/schema";

describe("extractJson 抢救逻辑", () => {
  it("解析纯净 JSON", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it("解析代码围栏包裹的 JSON", () => {
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it("从废话中截取 JSON", () => {
    expect(extractJson('好的，这是结果：{"a":1} 希望您满意')).toEqual({ a: 1 });
  });

  it("无 JSON 时抛错", () => {
    expect(() => extractJson("抱歉，我不能这么做")).toThrow();
  });
});

describe("三环节 Schema", () => {
  it("验尸报告结构校验通过", () => {
    const parsed = autopsyLLMSchema.parse({
      autopsy: {
        language: "JavaScript",
        lines: "27",
        time_of_death: "一个赶版本的深夜",
        direct_cause: "死于嵌套",
        premortem: ["遭遇一", "遭遇二"],
        smells: ["坏味道一"],
      },
      epitaph: "它没有 Bug，只有历史",
      reincarnation_advice: "来世做纯函数",
    });
    expect(parsed.autopsy.lines).toBe(27);
  });

  it("悼词校验：过短则拒绝", () => {
    expect(() => eulogyLLMSchema.parse({ eulogy: "太短" })).toThrow();
    expect(eulogyLLMSchema.parse({ eulogy: "这是一篇足够长的悼词，足以通过最小长度校验。" }).eulogy).toContain("悼词");
  });

  it("转世结构校验通过", () => {
    const parsed = rebirthLLMSchema.parse({
      refactored_code: "async function login() {}",
      changes: ["拉直回调"],
      rebirth_as: "一段直线函数",
    });
    expect(parsed.changes).toHaveLength(1);
  });
});
