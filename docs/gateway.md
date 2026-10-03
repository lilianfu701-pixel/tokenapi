# TokenAPI Gateway — 多模型 API 聚合网关

与现有「模型定价数据 API」(`/api/v1/*`、`providers`/`models` 表)**并存、互不影响**。
网关走 `/v1/*`,表名全部 `gateway_*` / `model_aliases*`。

## 请求链路

```
Client (OpenAI SDK / Anthropic SDK / curl)
  │  POST /v1/chat/completions | /v1/responses | /v1/messages   model="premium-model"
  ▼
Inbound format  (formats/chat.ts · responses.ts · anthropic.ts)  → 统一转成内部 Chat 格式
  ▼
pipeline.ts
  1. 鉴权   Authorization: Bearer sk-tk-… 或 x-api-key → SHA-256 查 gateway_api_keys
  2. 权限   key.allowed_aliases
  3. 限流   每 key 每分钟固定窗口 (gateway_rate_limits)
  4. 解析   model_aliases (+ fallbacks) → [Route…]   (router.ts,纯函数,与供应商无关)
  5. 预授权 gateway_reserve_credit():数据库内原子冻结最坏情况费用,不够 → 402
  6. 路由   route-runner.ts:跳过被熔断的 key → 注入一行身份 → 强制输出上限
            adapters/openai-compatible.ts | adapters/anthropic.ts(内部一律流式)
            首个 chunk 到达前失败 → 自动切下一条 fallback;401/403 → 熔断该 key
  7. 输出   按客户端格式回写;model 字段 = 别名(public_model)
  8. 结算   同一事务:写 gateway_request_logs(public_model + real_model + provider + attempts…)
            + gateway_settle_credit()(多退少补,写流水)
```

**把 `premium-model` 从 Qwen 换到 Gemini** = 后台「Model aliases → Edit / re-route」选另一条路由。
一条 UPDATE,≤10 秒生效(实例内别名缓存),客户端零改动;审计日志记录 `reroute: qwen/qwen3.7-flash → gemini/…`。

## 数据模型(`scripts/setup-gateway-db.sql`)

| 表 | 作用 |
|---|---|
| `gateway_providers` | 上游端点:`adapter`(openai/anthropic 协议)、`vendor`(模型厂商)、`api_base`、首包超时 |
| `gateway_provider_keys` | 上游密钥,AES-256-GCM 加密,只显示末 4 位 |
| `gateway_models` | 真实模型、**我方成本价**(USD / 1M tokens,含缓存读价)、`max_output_tokens`(预授权上限)、`capabilities`(对外展示) |
| `model_aliases` | 公开模型 id → 主路由(provider, provider_model, api_base?, api_key_id?)+ 价格倍率 / 固定公开价 + 身份注入开关 + 启停 |
| `model_alias_fallbacks` | 别名的有序备用路由 |
| `gateway_users` | 用户、可用余额 `balance_microusd`(未结算的冻结已经扣掉)、默认 rpm |
| `gateway_credit_holds` | 预授权冻结:held → settled / expired |
| `gateway_credential_health` | 401/403 熔断:被封禁的 provider + key,到期时间 |
| `gateway_api_keys` | 客户端 key(只存哈希)、独立 rpm / 消费上限 / 允许的别名 / 过期时间 |
| `gateway_credit_ledger` | 余额流水(充值 / 扣费 / 调整),只追加 |
| `gateway_request_logs` | 见下方「请求日志」 |
| `gateway_rate_limits` | 限流计数 |
| `gateway_audit_log` | 后台所有变更 before/after(含别名改路由历史) |

## 计费(原子预授权,不会透支)

所有金额都是整数 micro-USD(`*_microusd`,1 USD = 1,000,000),不用浮点数。

1. **预授权**:请求打到上游前,先算出本次最坏情况的费用 `hold`
   (输入 token 用偏大的估算 × 1.25;输出 token = 客户端的 `max_tokens`,不传就用模型的 `max_output_tokens`,
   没配置时默认 8192;所有 fallback 路由取最贵那条)。
2. **原子扣减**:`SELECT gateway_reserve_credit(...)`,这是一个数据库函数,用一条带条件的
   `UPDATE … WHERE balance_microusd >= hold` 完成扣减(行锁)。余额不够就直接返回 402,不调用上游。
   代码里没有任何“先读余额 → Node 计算 → 再写回”的步骤。
3. **硬上限**:网关一定会把输出上限 `max_tokens` / `max_completion_tokens` 发给上游,
   所以真实费用不会超过 hold(唯一的偏差来源是输入 token 估算)。
4. **结算**:`gateway_settle_credit(request_id, 实际费用)`,与请求日志写在同一个事务里。
   多冻结的退回,不足的补扣;重复调用无副作用。失败的请求按 0 结算。
5. **兜底**:进程崩溃、没来得及结算的 hold,15 分钟后由 `gateway_release_expired_holds()` 退回余额。
6. 管理员调余额用 `gateway_adjust_credit()`,余额和流水在同一条语句里更新。

- 上游成本 `upstream_cost = 未缓存输入×input_price + 缓存输入×cache_read_price + 输出×output_price`
- 向用户收费 `customer_charge = upstream_cost × price_multiplier`;别名设置了**固定公开价**时按公开价收,后端换供应商时客户价格不变。

## 身份透明(一行,约 35 tokens)

别名开启 `inject_identity` 时,在消息最前面加一条:

```
Product model: TokenAPI Pro. Backend: Qwen 3.7 Flash (Alibaba). If asked about model identity, state both accurately; otherwise do not mention them.
```

被问到身份时如实回答产品名和底层模型;普通问题不会主动提到 provider / real_model。
别名改路由后,这一行跟着自动变。

**品牌保护**:别名和显示名不能用别家的模型品牌(Claude/Opus/Sonnet/Haiku、GPT、Gemini、Qwen、DeepSeek、Kimi…)。
对外统一用 Fast / Plus / Pro / Premium / TokenAPI Pro 这类中性名字。主路由和所有 fallback 都会检查。

## Fallback 规则

- 按 主路由 → fallback(priority 升序)尝试;禁用的 fallback / provider / model 直接跳过。
- 换下一条:网络错误、首个 token 超时、401/403/404、408/409/429、5xx、首个 chunk 之前收到的流错误。
- 不换:400/413/422(是请求本身的问题)。上游的错误信息会去掉密钥后返回给客户端。
- 一旦首个 chunk 已发给客户端就不再切换。
- **401/403 = provider 配置错误**:日志记 `error_type=provider_config`,并把这个 provider + key 写进
  `gateway_credential_health`,封禁 10 分钟(`GATEWAY_CREDENTIAL_COOLDOWN_MS`)。封禁期间请求直接跳过它走 fallback,
  不会反复去打有问题的 provider。后台 Providers 页能看到封禁状态,也可以「Unblock now」;对这个 key 做任何操作也会自动解封。
- 404(上游模型改名)也记为 provider_config,但不封禁 key。

## 请求日志(永久保存)

`gateway_request_logs`:`public_model`、`real_model`、`provider`、`provider_model`、`attempts`(每条路由的
status / error_type / error / 耗时 / 是否 skipped)、`fallback_used`、`input_tokens`、`output_tokens`、`cached_tokens`、
`upstream_cost_microusd`、`customer_charge_microusd`、`hold_microusd`、`latency_ms`、`ttft_ms`、`status`、
`http_status`、`error_type`、`error`。所有错误文本在写入前都会去掉上游密钥。

## 不对外暴露的信息

`/v1/models` 只按白名单返回:`id`、`display_name`/`name`、`description`、`capabilities`、`context_length`、`pricing`
(另加 OpenAI SDK 需要的 `object`/`created`/`owned_by="tokenapi"`)。
provider、real_model、api_base、上游密钥只在后台可见。正常回答的响应里也不会出现这些信息。

## 兼容范围

| 接口 | 支持 | 暂不支持 |
|---|---|---|
| `GET /v1/models`、`/v1/models/{id}` | OpenAI 格式 + OpenRouter 风格 `pricing`(USD/token)、`context_length`;不暴露真实供应商 | |
| `POST /v1/chat/completions` | 文本、图片、tools / tool_choice、response_format、stream + `stream_options.include_usage`、`reasoning_content` 透传 | `n>1` |
| `POST /v1/responses` | 字符串/数组 input、instructions、function tools、json_schema、完整流式事件序列 | `previous_response_id`、内置工具(web_search 等)、file_id。已预留 `ResponsesHooks.loadConversation` / `builtinTool` 扩展点 |
| `POST /v1/messages` | Anthropic SDK:system、text/image、tool_use/tool_result、流式事件 | thinking、cache_control。已预留 `ChatRequest.extensions.anthropic` 扩展点(Anthropic 适配器会合并它,其他适配器不会发出) |

上游适配器:`openai`(OpenAI / Qwen DashScope / DeepSeek / Gemini OpenAI 端点 / Moonshot / 任何兼容 API)、`anthropic`。
新增协议 = 在 `lib/gateway/adapters/` 加一个实现 `ProviderAdapter` 的文件并注册。

## 上线步骤

1. Neon SQL Editor 执行 `scripts/setup-gateway-db.sql`(只新增表,幂等)。
2. Vercel 环境变量:
   - `GATEWAY_ENCRYPTION_KEY` — 32 字节,`openssl rand -hex 32` 生成。**丢失则已存的上游密钥无法解密。**
   - `ADMIN_PASSWORD` — 已有。
   - 可选 `GATEWAY_PLATFORM_NAME`(默认 TokenAPI)、`PROVIDER_KEY_<ID>`(未在后台配置密钥时的兜底)。
3. `/admin/login` → Providers 加供应商和密钥 → Models 加真实模型和成本价 → Model aliases 建别名
   → Users 建用户、充值、生成 API key(只显示一次)。
4. 客户端:

```ts
const client = new OpenAI({ baseURL: "https://tokenapi.biz/v1", apiKey: "sk-tk-…" });
await client.chat.completions.create({ model: "premium-model", messages: [{ role: "user", content: "hi" }] });
```

## 测试

`npm test`:84 个测试,7 个文件,不需要网络,也不连 Neon。

- `pipeline.test.ts`:别名路由,Qwen→Gemini→DeepSeek 切换,身份行,鉴权 / 限流,三种格式的流式和非流式
- `fallback.test.ts`:优先级、禁用跳过、5xx / 429 / 超时 / 首包前流错误、400 不切换、401/403 熔断与冷却
- `billing.test.ts`:倍率 / 固定价、预授权上限、402、key 消费上限、流式结算、断连结算、50 个并发请求
- `security.test.ts`:上游密钥不出现在响应 / 日志 / 流错误中,`/v1/models` 只返回白名单字段
- `postgres.test.ts`:在 **PGlite(进程内真实 Postgres)** 上执行 `setup-gateway-db.sql` 和真实的 repo SQL:
  预授权和结算函数、200 个并发 reserve、整条链路的并发防透支、熔断写库、改路由
- `sdk-compat.test.ts`:用官方 OpenAI / Anthropic SDK 调网关
