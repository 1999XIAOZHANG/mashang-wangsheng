/**
 * 内存令牌桶限流：每 IP 每分钟 20 个请求。
 * 一场葬礼最多 6 个请求（验尸 1 + PK 4 + 转世 1）。
 * 仅适用于单实例部署；对比赛 Demo 足够。
 */
const RATE = 20;
const PER_MS = 60_000;

const buckets = new Map<string, { tokens: number; last: number }>();

export function rateLimit(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip) ?? { tokens: RATE, last: now };
  b.tokens = Math.min(RATE, b.tokens + ((now - b.last) / PER_MS) * RATE);
  b.last = now;
  if (b.tokens < 1) {
    buckets.set(ip, b);
    return false;
  }
  b.tokens -= 1;
  buckets.set(ip, b);
  return true;
}

export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "local"
  );
}
