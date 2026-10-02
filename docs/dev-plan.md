# TokenAPI.biz 开发计划

## 项目定位

将 tokenapi.biz 从静态落地页改造为 **AI 模型定价数据 API 服务**，与 tokencenter.cc（前端对比站）形成互补：
- tokencenter.cc = 给人看的网页
- tokenapi.biz = 给开发者用的 API

## 现有技术栈

- Next.js 16.2.6 + React 19 + Tailwind CSS 4
- Neon Postgres（只有 `access_requests` 表）
- Vercel 部署（Git 已连接，push 即部署）
- 域名 tokenapi.biz
- 已有 `@vercel/analytics` + `@vercel/speed-insights`

## 数据源

### 主数据源：models.dev 公开 API

- `https://models.dev/api.json` — 全量数据（按 provider 分组，含价格/能力/限制），约 4900+ 模型
- `https://models.dev/models.json` — 模型级元数据（供应商无关）
- `https://models.dev/catalog.json` — 两者合并
- MIT 协议，免费公开，无认证无限速
- GitHub: https://github.com/anomalyco/models.dev (7.1k stars)

### models.dev 单模型数据结构示例

```json
{
  "id": "claude-sonnet-5-5",
  "name": "Claude Sonnet 5.5",
  "description": "...",
  "family": "claude",
  "attachment": true,
  "reasoning": true,
  "reasoning_options": [
    { "type": "effort", "values": ["low", "medium", "high", "max"] },
    { "type": "budget_tokens", "min": 1024 }
  ],
  "tool_call": true,
  "structured_output": true,
  "temperature": true,
  "knowledge": "2025-04",
  "release_date": "2025-12-19",
  "last_updated": "2025-12-19",
  "open_weights": false,
  "modalities": {
    "input": ["text", "image"],
    "output": ["text"]
  },
  "limit": {
    "context": 1000000,
    "input": 128000,
    "output": 128000
  },
  "cost": {
    "input": 3.00,        // 每百万 input tokens 美元
    "output": 15.00,
    "reasoning": 15.00,
    "cache_read": 0.30,
    "cache_write": 3.75
  },
  "canonical_model_id": "anthropic/claude-sonnet-5-5"
}
```

### 补充数据源（Phase 2）

models.dev 中国模型覆盖不全，需手动补充：
- 通义千问全系列（Qwen-Max/Plus/Turbo/Long/VL/Audio/Coder）
- 文心一言（ERNIE 4.5/X1）
- 智谱 GLM（GLM-4/Z1/CogView/CogVideo）
- Kimi（Moonshot，models.dev 有部分）
- 豆包（ByteDance，models.dev 有 deepinfra 代理的）
- 百川、MiniMax、阶跃星辰、零一万物等

补充数据格式与 models.dev 对齐，存为本地 JSON 文件。

---

## 架构设计

```
tokenapi.biz
├── /api/v1/models          GET  全量模型列表（分页、筛选）
├── /api/v1/models/[id]     GET  单模型详情
├── /api/v1/providers       GET  供应商列表
├── /api/v1/providers/[id]  GET  供应商下所有模型
├── /api/v1/compare         GET  多模型对比（?ids=a,b,c）
├── /api/v1/search          GET  搜索（?q=claude&capability=reasoning）
├── /api/v1/prices/history  GET  历史价格（Phase 2）
├── /api/v1/prices/alerts   POST 价格变动订阅（Phase 2）
├── /api/v1/estimate        POST 成本估算器（Phase 2）
│
├── /api/sync               内部 cron：每日从 models.dev 同步
│
├── 落地页 /                保留现有首页（更新内容）
├── 文档页 /docs            API 文档（交互式）
└── 管理后台 /admin         现有申请审核 + 新增 key 管理
```

### 数据流

```
models.dev/api.json ──(每日 cron)──> Neon Postgres
                                        │
本地补充 JSON ──(手动/启动时)──────────> │
                                        │
                                   /api/v1/* ──> 开发者
```

### 数据库 Schema（Neon Postgres）

```sql
-- 供应商表
CREATE TABLE providers (
  id TEXT PRIMARY KEY,           -- 'openai', 'anthropic', ...
  name TEXT NOT NULL,
  npm TEXT,                      -- AI SDK 包名
  env TEXT[],                    -- 环境变量名
  doc TEXT,                      -- 文档链接
  api TEXT,                      -- API 端点
  logo_url TEXT,
  source TEXT NOT NULL DEFAULT 'models.dev',  -- 数据来源
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 模型表
CREATE TABLE models (
  id TEXT NOT NULL,              -- 模型 ID (如 'claude-sonnet-5-5')
  provider_id TEXT NOT NULL REFERENCES providers(id),
  name TEXT NOT NULL,
  description TEXT,
  family TEXT,
  type TEXT,                     -- 'decision' 或 null

  -- 能力
  attachment BOOLEAN NOT NULL DEFAULT false,
  reasoning BOOLEAN NOT NULL DEFAULT false,
  reasoning_options JSONB,
  tool_call BOOLEAN NOT NULL DEFAULT false,
  structured_output BOOLEAN,
  temperature BOOLEAN,
  interleaved JSONB,

  -- 日期
  knowledge TEXT,                -- '2025-04'
  release_date TEXT,
  last_updated TEXT,

  -- 权重
  open_weights BOOLEAN NOT NULL DEFAULT false,

  -- 限制
  context_limit INTEGER,
  input_limit INTEGER,
  output_limit INTEGER,

  -- 模态
  input_modalities TEXT[],
  output_modalities TEXT[],

  -- 价格 (每百万 tokens, USD)
  cost_input NUMERIC(10,4),
  cost_output NUMERIC(10,4),
  cost_reasoning NUMERIC(10,4),
  cost_cache_read NUMERIC(10,4),
  cost_cache_write NUMERIC(10,4),
  cost_input_audio NUMERIC(10,4),
  cost_output_audio NUMERIC(10,4),

  -- 元数据
  canonical_model_id TEXT,
  status TEXT,                   -- 'alpha', 'beta', 'deprecated', null
  source TEXT NOT NULL DEFAULT 'models.dev',
  raw_data JSONB,               -- 原始 JSON 备份
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (provider_id, id)
);

-- 价格历史（Phase 2）
CREATE TABLE price_history (
  provider_id TEXT NOT NULL,
  model_id TEXT NOT NULL,
  cost_input NUMERIC(10,4),
  cost_output NUMERIC(10,4),
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  PRIMARY KEY (provider_id, model_id, recorded_at),
  FOREIGN KEY (provider_id, model_id) REFERENCES models(provider_id, id)
);

-- API Keys（Phase 2）
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash TEXT NOT NULL UNIQUE,  -- SHA-256 hash
  key_prefix TEXT NOT NULL,       -- 前 8 位明文（显示用）
  user_email TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',  -- 'free', 'developer', 'enterprise'
  rate_limit INTEGER NOT NULL DEFAULT 100,  -- 每日请求限制
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- 请求日志（Phase 2）
CREATE TABLE api_usage (
  id BIGSERIAL PRIMARY KEY,
  api_key_id UUID REFERENCES api_keys(id),
  endpoint TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 保留现有表
-- access_requests（等待列表）
```

---

## 实施阶段

### Phase 1：数据接入 + 基础 API（本次）

目标：让 `/api/v1/models` 能返回真实数据

1. **建表** — 在 Neon 执行上述 `providers` + `models` 建表 SQL
2. **同步脚本** — `app/api/sync/route.ts`
   - fetch `https://models.dev/api.json`
   - 解析 JSON，upsert 到 `providers` 和 `models` 表
   - 暴露为 API route，后续接 Vercel Cron
3. **基础 API 端点**
   - `GET /api/v1/models` — 分页（`?page=1&limit=50`）、筛选（`?provider=openai&reasoning=true&min_context=100000`）、排序（`?sort=cost_input&order=asc`）
   - `GET /api/v1/models/[provider]/[id]` — 单模型详情
   - `GET /api/v1/providers` — 供应商列表（含模型数量）
   - `GET /api/v1/providers/[id]` — 供应商详情 + 旗下模型
   - `GET /api/v1/compare?ids=openai/gpt-5,anthropic/claude-opus-4-6` — 并排对比
   - `GET /api/v1/search?q=claude` — 全文搜索
4. **CORS** — 允许跨域调用
5. **更新落地页** — 展示真实 API 端点和响应示例
6. **API 文档页** `/docs` — 交互式文档（可用 Swagger UI 或手写）

### Phase 2：增值功能

7. **价格历史** — 每日 cron 快照价格到 `price_history`，暴露 `/api/v1/prices/history?model=openai/gpt-5&days=30`
8. **中国模型补充** — 手动维护 `data/cn-models.json`，同步时合并
9. **API Key 系统** — 注册 → 发 key → 中间件验证 → 用量追踪
10. **限速** — 免费 100 次/天，Developer $9/月 10,000 次/天
11. **价格变动通知** — webhook/email 订阅
12. **成本估算器** — 输入 token 量和调用频率，输出各模型月费对比

### Phase 3：生态

13. **npm SDK** — `npm i tokenapi`，TypeScript 类型完整
14. **Python SDK** — `pip install tokenapi`
15. **MCP Server** — 让 AI agent 能查模型价格
16. **与 tokencenter.cc 打通** — tokencenter 前端调用 tokenapi 后端

---

## API 响应格式

统一信封：

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 4914,
    "page": 1,
    "limit": 50,
    "has_more": true
  }
}
```

错误：

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Daily request limit reached. Upgrade to Developer plan."
  }
}
```

## 环境变量

```env
# 现有
DATABASE_URL=...          # Neon Postgres 连接串（已有）

# 新增
SYNC_SECRET=...           # 保护 /api/sync 端点的密钥
MODELS_DEV_API=https://models.dev/api.json
```

## Git 信息

- 仓库：lilianfu701-pixel/tokenapi（私有）
- 提交身份：`git -c user.name="LIANFU LI" -c user.email="lilianfu701@gmail.com"`
- push 即部署到 Vercel

## 注意事项

- 不要删除现有 `access_requests` 表和 `/admin/requests` 功能
- 不要删除 ChatGPT 认证相关代码（`chatgpt-auth.ts`）暂时保留
- Cloudflare D1 相关代码（`db/index.ts`、`db/schema.ts`）可以忽略，不使用
- 落地页 `app/page.tsx` 是单文件，内容需要更新但保留结构
