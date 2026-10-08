import { extractJson } from "./schema";
import { fetch as undiciFetch, ProxyAgent, Agent, type Dispatcher } from "undici";

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

let proxyDispatcher: Dispatcher | null = null;
function getDispatcher(): Dispatcher {
  const proxy = process.env.PROXY_URL || process.env.HTTPS_PROXY;
  if (proxy) {
    proxyDispatcher ??= new ProxyAgent(proxy);
    return proxyDispatcher;
  }
  // 复用 undici 默认 Agent（连接池）而非 Node 原生 fetch，避免 turbofan 行为差异
  return new Agent({ keepAliveTimeout: 10_000, keepAliveMaxTimeout: 60_000 });
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
    // 走 undici 自带 fetch + 自定义 dispatcher（Next.js 包装的 fetch 在 Next 15 中
    // 对 dispatcher 的支持不可靠，改用 undici.fetch 确保代理 / 连接池稳定）
    const res = await undiciFetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://mashang-wangsheng.local",
        "X-Title": "mashang-wangsheng",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      dispatcher: getDispatcher(),
    });
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
