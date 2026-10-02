-- TokenAPI Phase 1: providers + models tables
-- Run this in Neon SQL Editor

CREATE TABLE IF NOT EXISTS providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  npm TEXT,
  env TEXT[],
  doc TEXT,
  api TEXT,
  logo_url TEXT,
  source TEXT NOT NULL DEFAULT 'models.dev',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS models (
  id TEXT NOT NULL,
  provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  family TEXT,
  type TEXT,

  -- capabilities
  attachment BOOLEAN NOT NULL DEFAULT false,
  reasoning BOOLEAN NOT NULL DEFAULT false,
  reasoning_options JSONB,
  tool_call BOOLEAN NOT NULL DEFAULT false,
  structured_output BOOLEAN,
  temperature BOOLEAN,
  interleaved JSONB,

  -- dates
  knowledge TEXT,
  release_date TEXT,
  last_updated TEXT,

  -- weights
  open_weights BOOLEAN NOT NULL DEFAULT false,

  -- limits
  context_limit INTEGER,
  input_limit INTEGER,
  output_limit INTEGER,

  -- modalities
  input_modalities TEXT[],
  output_modalities TEXT[],

  -- cost per million tokens (USD)
  cost_input NUMERIC(10,4),
  cost_output NUMERIC(10,4),
  cost_reasoning NUMERIC(10,4),
  cost_cache_read NUMERIC(10,4),
  cost_cache_write NUMERIC(10,4),
  cost_input_audio NUMERIC(10,4),
  cost_output_audio NUMERIC(10,4),

  -- metadata
  canonical_model_id TEXT,
  status TEXT,
  source TEXT NOT NULL DEFAULT 'models.dev',
  raw_data JSONB,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (provider_id, id)
);

CREATE INDEX IF NOT EXISTS idx_models_family ON models(family);
CREATE INDEX IF NOT EXISTS idx_models_reasoning ON models(reasoning) WHERE reasoning = true;
CREATE INDEX IF NOT EXISTS idx_models_cost_input ON models(cost_input);
CREATE INDEX IF NOT EXISTS idx_models_name_trgm ON models USING gin(name gin_trgm_ops);
