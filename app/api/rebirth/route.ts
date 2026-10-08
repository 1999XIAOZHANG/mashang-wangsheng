import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { callJSON } from "@/lib/openrouter";
import { REBIRTH_MODEL } from "@/lib/models";
import { UNDERTAKER_SYSTEM, buildRebirthPrompt } from "@/lib/prompts";
import { rebirthLLMSchema } from "@/lib/schema";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { DEMO_REBIRTH } from "@/lib/demoData";

export const maxDuration = 60;

const causeEnum = z.enum([
  "legacy",
  "pm",
  "overdesign",
  "mystic",
  "oom",
  "orphan",
]);

const bodySchema = z.object({
  code: z.string().min(1).max(20_000),
  language: z.string().default("JavaScript"),
  causes: z.array(causeEnum).min(1).max(6),
});

export async function POST(req: NextRequest) {
  if (!rateLimit(clientIp(req))) {
    return NextResponse.json(
      { error: "香客太多，请一分钟后再来超度" },
      { status: 429 }
    );
  }

  let input: z.infer<typeof bodySchema>;
  try {
    input = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "遗体缺失，无法转世" }, { status: 400 });
  }

  try {
    const raw = await callJSON({
      model: REBIRTH_MODEL,
      system: UNDERTAKER_SYSTEM,
      user: buildRebirthPrompt(input.code, input.language, input.causes),
      temperature: 0.3,
      maxTokens: 4096,
      timeoutMs: 30_000,
    });
    const parsed = rebirthLLMSchema.parse(raw);
    return NextResponse.json({
      fallback: false,
      refactored_code: parsed.refactored_code,
      changes: parsed.changes.length ? parsed.changes : ["整体重构，保持功能一致"],
      rebirth_as: parsed.rebirth_as,
    });
  } catch (err) {
    console.error("[rebirth] 走离线演示:", err instanceof Error ? err.message : err);
    return NextResponse.json(DEMO_REBIRTH);
  }
}
