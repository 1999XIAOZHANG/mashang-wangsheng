import { extractJson } from "./schema";
import { ProxyAgent, type Dispatcher } from "undici";

/**
 * 网络出口配置（解决本机无法直连 openrouter.ai 的场景）：
 * - PROXY_URL：本地代理，如 http://127.0.0.1:7890
 * - OPENROUTER_BASE_URL：自定义中转地址（默认官方）
 * 两者都可选；Vercel 等海外部署环境留空即可。
 */
const BASE_URL =
  process.env.OPENROUTER_BASE_URL?.replace(/\/$/, "") ??
  "https://openrouter.ai/api/v1";
const OPENROUTER_URL = `${BASE_URL}/chat/completions`;
const DEFAULT_TIMEOUT_MS = 25_000;

let proxyAgent: ProxyAgent | null = null;
function getDispatcher(): Dispatcher | undefined {
  const proxy = process.env.PROXY_URL || process.env.HTTPS_PROXY;
  if (!proxy) return undefined;
  proxyAgent ??= new ProxyAgent(proxy);
  return proxyAgent;
}

export class HttpError extends Error {
  constructor(
    public status: number,
    public body: string
  ) {
    super(`OpenRouter HTTP ${status}: ${body.slice(0, 200)}`);
  }
}

interface RawBody {
  model: string;
  messages: { role: string; content: string }[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" };
}

async function rawCall(body: RawBody, timeoutMs: number): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("NO_API_KEY");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const dispatcher = getDispatcher();
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://mashang-wangsheng.local",
        "X-Title": "mashang-wangsheng",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      // undici dispatcher：PROXY_URL / HTTPS_PROXY 设置时走代理（Node fetch 原生不读代理环境变量）
      ...(dispatcher ? { dispatcher } : {}),
    } as RequestInit);
    if (!res.ok) {
      throw new HttpError(res.status, await res.text().catch(() => ""));
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("EMPTY_COMPLETION");
    return content;
  } finally {
    clearTimeout(timer);
  }
}

export interface CallJSONOptions {
  model: string;
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

/**
 * 调用 OpenRouter 并解析 JSON：
 * 1. 带 response_format: json_object
 * 2. 若模型不支持（HTTP 400 提及 response_format）→ 去掉重试一次
 * 3. extractJson 兜底截取
 */
export async function callJSON(opts: CallJSONOptions): Promise<unknown> {
  const base: RawBody = {
    model: opts.model,
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
    temperature: opts.temperature ?? 0.9,
    max_tokens: opts.maxTokens ?? 2048,
  };
  const timeout = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  let text: string;
  try {
    text = await rawCall({ ...base, response_format: { type: "json_object" } }, timeout);
  } catch (err) {
    if (err instanceof HttpError && err.status === 400 && /response_format/i.test(err.body)) {
      text = await rawCall(base, timeout);
    } else {
      throw err;
    }
  }
  return extractJson(text);
}
