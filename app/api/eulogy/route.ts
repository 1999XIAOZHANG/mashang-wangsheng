import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { callJSON } from "@/lib/openrouter";
import { findPKModel } from "@/lib/models";
import { UNDERTAKER_SYSTEM, buildEulogyPrompt } from "@/lib/prompts";
import { eulogyLLMSchema } from "@/lib/schema";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { demoEulogyFor } from "@/lib/demoData";

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
  model: z.string(),
  autopsy: z.object({
    language: z.string(),
    lines: z.coerce.number(),
    time_of_death: z.string(),
    direct_cause: z.string(),
    premortem: z.array(z.string()),
    smells: z.array(z.string()),
  }),
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
    return NextResponse.json({ error: "验尸报告缺失，无法致悼" }, { status: 400 });
  }

  const pk = findPKModel(input.model);
  if (!pk) {
    return NextResponse.json({ error: "查无此殡葬师" }, { status: 400 });
  }

  try {
    const raw = await callJSON({
      model: pk.id,
      system: UNDERTAKER_SYSTEM,
      user: buildEulogyPrompt(input.autopsy, input.causes),
      temperature: 1.0,
      maxTokens: 1024,
      timeoutMs: 20_000,
    });
    const parsed = eulogyLLMSchema.parse(raw);
    return NextResponse.json({
      fallback: false,
      model: pk.id,
      vendor: pk.vendor,
      eulogy: parsed.eulogy,
    });
  } catch (err) {
    console.error(
      `[eulogy:${pk.id}] 走离线演示:`,
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({
      fallback: true,
      model: pk.id,
      vendor: pk.vendor,
      eulogy: demoEulogyFor(pk.id),
    });
  }
}
