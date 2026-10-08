import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { callJSON } from "@/lib/openrouter";
import { AUTOPSY_MODEL } from "@/lib/models";
import { UNDERTAKER_SYSTEM, buildAutopsyPrompt } from "@/lib/prompts";
import { autopsyLLMSchema } from "@/lib/schema";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { DEMO_AUTOPSY } from "@/lib/demoData";

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
  code: z.string().min(1, "往生堂不收空气").max(20_000),
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

  const hasKey = Boolean(process.env.OPENROUTER_API_KEY);

  let input: z.infer<typeof bodySchema>;
  try {
    input = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "往生堂不收空气，请放入遗体（代码）并选择死因" },
      { status: 400 }
    );
  }

  try {
    const raw = await callJSON({
      model: AUTOPSY_MODEL,
      system: UNDERTAKER_SYSTEM,
      user: buildAutopsyPrompt(input.code, input.language, input.causes),
      temperature: 0.9,
      maxTokens: 2048,
    });
    const parsed = autopsyLLMSchema.parse(raw);
    return NextResponse.json({
      fallback: false,
      hasKey,
      autopsy: {
        ...parsed.autopsy,
        premortem: parsed.autopsy.premortem.length
          ? parsed.autopsy.premortem
          : ["生前遭遇不详，愿其安息"],
        smells: parsed.autopsy.smells.length
          ? parsed.autopsy.smells
          : ["尸表完好，死因藏于骨相"],
      },
      epitaph: parsed.epitaph,
      reincarnation_advice: parsed.reincarnation_advice,
    });
  } catch (err) {
    console.error("[autopsy] 走离线演示:", err instanceof Error ? err.message : err);
    return NextResponse.json({ ...DEMO_AUTOPSY, hasKey });
  }
}
