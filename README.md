# 码上往生 · Mashang Wangsheng

> **愿天下代码，死得明白，投得体面。**

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/OpenRouter-Multi--Model-7C3AED?logo=openrouter" alt="OpenRouter" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT" />
  <img src="https://img.shields.io/badge/Kiro_鬼点子-参赛作品-FF6B6B" alt="Kiro" />
</p>

## 演示视频

<p align="center">
  <video src="docs/demo.mp4" controls width="100%"></video>
</p>

---

## 这是什么

给死掉的代码办一场体面的**赛博葬礼**。粘贴那段折磨你的祖传代码，选定死因（需求变更 / 过度设计 / 赛博玄学……），AI 法医出具验尸报告，**四家大模型同题竞写悼词**、由你票选谁有资格致悼，随后代码在火焰中化为灰烬，最终由代码模型转世重构、投个好胎——还能下载一张刻着墓志铭的讣告卡片。

**Kiro「鬼点子」计划线上赛参赛作品 · 赛道：无趣之趣**

---

## 五幕仪式流

| 幕 | 环节 | 亮点 |
|---|---|---|
| 第一幕 | 入殓 · 验尸 | 六大死因体系（可多选，首选项为主死因），报告必须引用代码证据 |
| 第二幕 | 追悼会 · 殡葬师竞写 | DeepSeek / GPT-5 mini / Claude Haiku / Gemini Flash 同题 PK，你投票致悼，胜者签名刻碑 |
| 第三幕 | 火化 | 整块代码被一团火卷走，CSS 渐变 + mix-blend-mode，零 canvas 负担 |
| 第四幕 | 转世 | 代码模型重构，金色打字机重生 + 改动点清单 |
| 第五幕 | 讣告 | html2canvas 导出 PNG 讣告卡片，可下载转发 |

**工程兜底**：LLM 失败自动降级离线演示模式（流程永不白屏）、JSON mode + 正则抢救双保险、每 IP 令牌桶限流、20s 超时淘汰、全局错误边界。

---

## 快速开始

```bash
git clone https://github.com/1999XIAOZHANG/mashang-wangsheng.git
cd mashang-wangsheng
npm install
cp .env.example .env.local   # 填入你的 OPENROUTER_API_KEY
npm run dev                  # http://localhost:3000
```

### 环境变量

| 变量 | 必填 | 说明 |
|---|---|---|
| `OPENROUTER_API_KEY` | 是 | [OpenRouter](https://openrouter.ai/keys) API Key，仅服务端使用，永不下发前端 |
| `PROXY_URL` | 否 | 本机无法直连 openrouter.ai 时配置本地代理，如 `http://127.0.0.1:7890` |
| `OPENROUTER_BASE_URL` | 否 | OpenRouter 兼容中转地址，默认官方 |

### 一键部署 Vercel

点下方按钮直达部署（记得在 Vercel 环境变量里配 `OPENROUTER_API_KEY`，**不要**配 `PROXY_URL`）：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/1999XIAOZHANG/mashang-wangsheng)

---

## 模型阵容（OpenRouter 统一接口）

| 角色 | 模型 | 说明 |
|---|---|---|
| 验尸官 | `deepseek/deepseek-v3.2` | 中文毒舌感 + 代码分析 |
| 殡葬师 ×4 | `deepseek/deepseek-chat` · `openai/gpt-5-mini` · `anthropic/claude-3-haiku` · `google/gemini-2.0-flash` | 同题竞写，风格差异全靠模型本身 |
| 转世法师 | `qwen/qwen3-coder` | 代码专精，负责重构 |

**单场完整葬礼 token 成本 < $0.01**（OpenRouter 后台设 $10 告警可覆盖整个比赛周期）。

---

## 技术栈

Next.js 15（App Router）· TypeScript · Tailwind CSS · Zod · html2canvas · Web Audio API · Vitest · undici

无数据库、无用户系统、无自建后端——**页面 + 3 个 API Route**，一键部署 Vercel。

---

## 脚本

| 命令 | 说明 |
|---|---|
| `npm run dev` | 本地开发 |
| `npm run build` | 生产构建 |
| `npm run start` | 生产运行 |
| `npm run test` | Vitest：JSON Schema 抢救逻辑 + 悼词禁词风格守卫 |

---

## 目录结构

```
app/
  page.tsx                   五幕单页状态机 + 错误边界
  api/autopsy|eulogy|rebirth/   OpenRouter 代理路由
  icon.svg                   烛火 favicon
components/                  8 个 UI 组件（输入/死因/验尸/PK/溶解/转世/讣告/错误兜底）
lib/                         prompts / schema / openrouter / 限流 / 演示数据
tests/                       schema 抢救 + 悼词禁词风格测试
docs/                        设计方案 + 实现计划 + 演示视频
```

---

## 文档

- [设计方案](docs/码上往生-设计方案.md) — 产品五幕、模型阵容、评分对齐矩阵
- [实现计划](docs/实现计划.md) — 任务清单、文件地图、接口契约

---

## 声明

本讣告由 AI 生成，代码的死亡与重生均为虚构。葬式仅供娱乐，请勿对号入座。

```
愿天下代码，死得明白，投得体面。
```
