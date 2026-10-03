-- TokenAPI Gateway: multi-provider LLM gateway tables
-- Additive only: does NOT touch the pricing-catalog tables (providers / models).
-- Run in Neon SQL Editor (idempotent). Requires Postgres 13+ (gen_random_uuid is core).
--
-- Money is integer micro-USD everywhere (1 USD = 1,000,000 microusd). No floats.
-- Prices are USD per 1M tokens (NUMERIC, exact decimal).

-- 1. Upstream providers (one row per API endpoint you buy from)
CREATE TABLE IF NOT EXISTS gateway_providers (
  id TEXT PRIMARY KEY,                       -- 'qwen', 'deepseek', 'gemini', ...
  name TEXT NOT NULL,                        -- 'Alibaba'
  vendor TEXT NOT NULL DEFAULT 'other',      -- model maker: anthropic|openai|google|alibaba|deepseek|moonshot|other
  adapter TEXT NOT NULL DEFAULT 'openai',    -- wire protocol: 'openai' (OpenAI-compatible) | 'anthropic'
  api_base TEXT NOT NULL,
  extra_headers JSONB NOT NULL DEFAULT '{}'::jsonb,
  timeout_ms INTEGER NOT NULL DEFAULT 60000, -- time-to-first-token budget before fallback
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Upstream credentials (AES-256-GCM with GATEWAY_ENCRYPTION_KEY; never returned to clients)
CREATE TABLE IF NOT EXISTS gateway_provider_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id TEXT NOT NULL REFERENCES gateway_providers(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  key_ciphertext TEXT NOT NULL,
  key_hint TEXT NOT NULL,                    -- last 4 chars, for display
  is_default BOOLEAN NOT NULL DEFAULT false,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gw_provider_keys_provider ON gateway_provider_keys(provider_id);

-- 2b. Credential circuit breaker: a 401/403 blocks that provider+key for a cooldown
--     so requests stop hammering a misconfigured provider and go straight to fallback.
CREATE TABLE IF NOT EXISTS gateway_credential_health (
  provider_id TEXT NOT NULL,
  key_ref TEXT NOT NULL,                     -- gateway_provider_keys.id, or 'env'
  blocked_until TIMESTAMPTZ NOT NULL,
  status_code INTEGER,
  reason TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (provider_id, key_ref)
);

-- 3. Real upstream models + upstream cost
CREATE TABLE IF NOT EXISTS gateway_models (
  provider_id TEXT NOT NULL REFERENCES gateway_providers(id) ON DELETE CASCADE,
  provider_model TEXT NOT NULL,              -- 'qwen3.7-flash'
  display_name TEXT NOT NULL,                -- 'Qwen 3.7 Flash' (admin + identity metadata only)
  context_length INTEGER,
  max_output_tokens INTEGER,                 -- output cap used for pre-authorization (default 8192)
  capabilities TEXT[] NOT NULL DEFAULT '{}', -- tools | vision | json_output | reasoning
  input_price NUMERIC(12,6) NOT NULL DEFAULT 0,      -- USD / 1M input tokens (our cost)
  output_price NUMERIC(12,6) NOT NULL DEFAULT 0,
  cache_read_price NUMERIC(12,6),                    -- null = input_price
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (provider_id, provider_model)
);

-- 4. Public model aliases: the only model ids clients ever see
CREATE TABLE IF NOT EXISTS model_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alias TEXT NOT NULL UNIQUE,                -- public_model, e.g. 'premium-model'
  display_name TEXT NOT NULL,                -- 'TokenAPI Pro'
  description TEXT,
  provider TEXT NOT NULL,                    -- primary route
  provider_model TEXT NOT NULL,
  api_base TEXT,                             -- optional override of provider api_base
  api_key_id UUID REFERENCES gateway_provider_keys(id) ON DELETE SET NULL,
  price_multiplier NUMERIC(8,4) NOT NULL DEFAULT 1.0,  -- charge = upstream cost x multiplier
  public_input_price NUMERIC(12,6),          -- optional fixed public price (USD/1M); overrides multiplier
  public_output_price NUMERIC(12,6),
  inject_identity BOOLEAN NOT NULL DEFAULT true,
  enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (provider, provider_model) REFERENCES gateway_models(provider_id, provider_model) ON UPDATE CASCADE
);

-- 4b. Ordered fallback routes
CREATE TABLE IF NOT EXISTS model_alias_fallbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alias_id UUID NOT NULL REFERENCES model_aliases(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL DEFAULT 1,       -- lower = tried first
  provider TEXT NOT NULL,
  provider_model TEXT NOT NULL,
  api_base TEXT,
  api_key_id UUID REFERENCES gateway_provider_keys(id) ON DELETE SET NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  FOREIGN KEY (provider, provider_model) REFERENCES gateway_models(provider_id, provider_model) ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_gw_alias_fallbacks_alias ON model_alias_fallbacks(alias_id, priority);

-- 5. Gateway users + balance (available balance; open holds are already subtracted)
CREATE TABLE IF NOT EXISTS gateway_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  balance_microusd BIGINT NOT NULL DEFAULT 0,
  rpm_limit INTEGER NOT NULL DEFAULT 60,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Client API keys (only the SHA-256 hash is stored)
CREATE TABLE IF NOT EXISTS gateway_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES gateway_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'default',
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  rpm_limit INTEGER,                         -- null = inherit user rpm_limit
  spend_limit_microusd BIGINT,               -- null = unlimited (bounded by user balance)
  spent_microusd BIGINT NOT NULL DEFAULT 0,  -- includes open holds
  allowed_aliases TEXT[],                    -- null = all enabled aliases
  enabled BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gw_api_keys_user ON gateway_api_keys(user_id);

-- 7. Credit ledger (append-only). balance = SUM(delta) - SUM(open holds)
CREATE TABLE IF NOT EXISTS gateway_credit_ledger (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES gateway_users(id) ON DELETE CASCADE,
  delta_microusd BIGINT NOT NULL,            -- +topup / -usage
  reason TEXT NOT NULL,                      -- 'topup' | 'usage' | 'adjustment'
  request_id TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gw_ledger_user ON gateway_credit_ledger(user_id, created_at DESC);

-- 7b. Pre-authorization holds: reserved before calling upstream, settled with the real cost.
CREATE TABLE IF NOT EXISTS gateway_credit_holds (
  request_id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES gateway_users(id) ON DELETE CASCADE,
  api_key_id UUID NOT NULL REFERENCES gateway_api_keys(id) ON DELETE CASCADE,
  amount_microusd BIGINT NOT NULL CHECK (amount_microusd >= 0),
  charged_microusd BIGINT,
  status TEXT NOT NULL DEFAULT 'held',       -- held | settled | expired
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settled_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_gw_holds_open ON gateway_credit_holds(expires_at) WHERE status = 'held';

-- 8. Request log: permanent record of public_model AND real_model
CREATE TABLE IF NOT EXISTS gateway_request_logs (
  id TEXT PRIMARY KEY,                       -- request id returned to client (x-request-id)
  user_id UUID,
  api_key_id UUID,
  endpoint TEXT NOT NULL,                    -- 'chat.completions' | 'responses' | 'messages'
  public_model TEXT NOT NULL,                -- 'premium-model'
  real_model TEXT,                           -- 'qwen/qwen3.7-flash' (route that served it)
  provider TEXT,
  provider_model TEXT,
  attempts JSONB NOT NULL DEFAULT '[]'::jsonb, -- every route tried, with status + error_type
  fallback_used BOOLEAN NOT NULL DEFAULT false,
  stream BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL,                      -- 'success' | 'error' | 'client_aborted'
  http_status INTEGER,
  error_type TEXT,                           -- provider_config | rate_limited | upstream_unavailable | timeout | invalid_request | stream_error
  error TEXT,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cached_tokens INTEGER NOT NULL DEFAULT 0,
  usage_estimated BOOLEAN NOT NULL DEFAULT false,
  upstream_cost_microusd BIGINT NOT NULL DEFAULT 0,
  customer_charge_microusd BIGINT NOT NULL DEFAULT 0,
  hold_microusd BIGINT NOT NULL DEFAULT 0,
  price_multiplier NUMERIC(8,4),
  latency_ms INTEGER,
  ttft_ms INTEGER,
  client_ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gw_logs_created ON gateway_request_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gw_logs_user ON gateway_request_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gw_logs_public ON gateway_request_logs(public_model, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gw_logs_provider ON gateway_request_logs(provider, created_at DESC);

-- 9. Fixed-window rate limit counters
CREATE TABLE IF NOT EXISTS gateway_rate_limits (
  bucket TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket, window_start)
);

-- 10. Admin audit trail (alias re-routing history lives here forever)
CREATE TABLE IF NOT EXISTS gateway_audit_log (
  id BIGSERIAL PRIMARY KEY,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  before JSONB,
  after JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gw_audit_entity ON gateway_audit_log(entity, entity_id, created_at DESC);

-- Admin login throttling (same shape as the previous admin panel)
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  identifier TEXT PRIMARY KEY,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked_until TIMESTAMPTZ
);

-- ============================================================ atomic billing
-- All balance changes happen inside these functions. Each call is one statement,
-- hence one transaction; the guarded UPDATEs take row locks, so concurrent
-- requests can never both pass the "balance >= amount" check on the same money.

CREATE OR REPLACE FUNCTION gateway_reserve_credit(
  p_request_id TEXT, p_user_id UUID, p_key_id UUID, p_amount BIGINT, p_ttl_seconds INTEGER DEFAULT 900
) RETURNS TEXT  -- 'ok' | 'insufficient_balance' | 'key_spend_limit'
LANGUAGE plpgsql AS $$
BEGIN
  IF p_amount < 0 THEN
    RAISE EXCEPTION 'reserve amount must be >= 0';
  END IF;

  UPDATE gateway_api_keys
     SET spent_microusd = spent_microusd + p_amount
   WHERE id = p_key_id
     AND (spend_limit_microusd IS NULL OR spent_microusd + p_amount <= spend_limit_microusd);
  IF NOT FOUND THEN
    RETURN 'key_spend_limit';
  END IF;

  UPDATE gateway_users
     SET balance_microusd = balance_microusd - p_amount
   WHERE id = p_user_id
     AND balance_microusd > 0
     AND balance_microusd >= p_amount;
  IF NOT FOUND THEN
    -- undo the key reservation inside the same transaction
    UPDATE gateway_api_keys SET spent_microusd = spent_microusd - p_amount WHERE id = p_key_id;
    RETURN 'insufficient_balance';
  END IF;

  INSERT INTO gateway_credit_holds (request_id, user_id, api_key_id, amount_microusd, expires_at)
  VALUES (p_request_id, p_user_id, p_key_id, p_amount, NOW() + make_interval(secs => p_ttl_seconds));
  RETURN 'ok';
END $$;

-- Settle a hold with the actual charge: refund (hold - actual) or charge the shortfall.
-- Idempotent: returns -1 if the hold is not open (already settled or expired).
CREATE OR REPLACE FUNCTION gateway_settle_credit(p_request_id TEXT, p_actual BIGINT)
RETURNS BIGINT
LANGUAGE plpgsql AS $$
DECLARE
  h gateway_credit_holds%ROWTYPE;
BEGIN
  IF p_actual < 0 THEN
    RAISE EXCEPTION 'charge must be >= 0';
  END IF;

  SELECT * INTO h FROM gateway_credit_holds
   WHERE request_id = p_request_id AND status = 'held'
   FOR UPDATE;
  IF NOT FOUND THEN
    RETURN -1;
  END IF;

  UPDATE gateway_users
     SET balance_microusd = balance_microusd + h.amount_microusd - p_actual
   WHERE id = h.user_id;
  UPDATE gateway_api_keys
     SET spent_microusd = spent_microusd - h.amount_microusd + p_actual, last_used_at = NOW()
   WHERE id = h.api_key_id;
  UPDATE gateway_credit_holds
     SET status = 'settled', charged_microusd = p_actual, settled_at = NOW()
   WHERE request_id = p_request_id;
  IF p_actual > 0 THEN
    INSERT INTO gateway_credit_ledger (user_id, delta_microusd, reason, request_id)
    VALUES (h.user_id, -p_actual, 'usage', p_request_id);
  END IF;
  RETURN p_actual;
END $$;

-- Return money from holds whose request died without settling (crash, timeout kill).
CREATE OR REPLACE FUNCTION gateway_release_expired_holds()
RETURNS INTEGER
LANGUAGE plpgsql AS $$
DECLARE
  h gateway_credit_holds%ROWTYPE;
  n INTEGER := 0;
BEGIN
  FOR h IN
    SELECT * FROM gateway_credit_holds
     WHERE status = 'held' AND expires_at < NOW()
     FOR UPDATE SKIP LOCKED
  LOOP
    UPDATE gateway_users SET balance_microusd = balance_microusd + h.amount_microusd WHERE id = h.user_id;
    UPDATE gateway_api_keys SET spent_microusd = spent_microusd - h.amount_microusd WHERE id = h.api_key_id;
    UPDATE gateway_credit_holds SET status = 'expired', settled_at = NOW() WHERE request_id = h.request_id;
    n := n + 1;
  END LOOP;
  RETURN n;
END $$;

-- Admin top-up / adjustment: balance and ledger change together.
CREATE OR REPLACE FUNCTION gateway_adjust_credit(p_user_id UUID, p_delta BIGINT, p_reason TEXT, p_note TEXT)
RETURNS BIGINT
LANGUAGE plpgsql AS $$
DECLARE
  new_balance BIGINT;
BEGIN
  UPDATE gateway_users SET balance_microusd = balance_microusd + p_delta
   WHERE id = p_user_id RETURNING balance_microusd INTO new_balance;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'user not found';
  END IF;
  INSERT INTO gateway_credit_ledger (user_id, delta_microusd, reason, note) VALUES (p_user_id, p_delta, p_reason, p_note);
  RETURN new_balance;
END $$;

-- Example seed (uncomment & adjust). Upstream keys must be added via /admin (they are encrypted).
-- INSERT INTO gateway_providers (id, name, vendor, adapter, api_base) VALUES
--   ('qwen', 'Alibaba', 'alibaba', 'openai', 'https://dashscope.aliyuncs.com/compatible-mode/v1'),
--   ('deepseek', 'DeepSeek', 'deepseek', 'openai', 'https://api.deepseek.com/v1'),
--   ('gemini', 'Google', 'google', 'openai', 'https://generativelanguage.googleapis.com/v1beta/openai')
-- ON CONFLICT (id) DO NOTHING;
-- INSERT INTO gateway_models (provider_id, provider_model, display_name, context_length, max_output_tokens, capabilities, input_price, output_price)
--   VALUES ('qwen', 'qwen3.7-flash', 'Qwen 3.7 Flash', 131072, 8192, '{tools,json_output}', 0.05, 0.4) ON CONFLICT DO NOTHING;
-- INSERT INTO model_aliases (alias, display_name, provider, provider_model, price_multiplier)
--   VALUES ('premium-model', 'TokenAPI Pro', 'qwen', 'qwen3.7-flash', 1.3) ON CONFLICT (alias) DO NOTHING;
