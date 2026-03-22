-- Taptico Discovery Platform: Supabase Schema
-- Run this entire file in the Supabase SQL Editor to create all tables.

-- ============================================================
-- MESSAGES TABLE
-- Stores every message in every discovery interview conversation.
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   TEXT NOT NULL,
  client_slug  TEXT NOT NULL,
  role         TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content      TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast retrieval of a session's message history
CREATE INDEX IF NOT EXISTS messages_session_id_idx ON messages (session_id);
-- Index for pulling all messages for a given client
CREATE INDEX IF NOT EXISTS messages_client_slug_idx ON messages (client_slug);

-- Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: allow full access via service role key (server-side only)
-- The anon key has no access -- all reads/writes go through the API route.
CREATE POLICY "Service role full access" ON messages
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ============================================================
-- USER_XP TABLE
-- Tracks interview completion XP per person per client.
-- One row per (client_slug, user_identifier) pair.
-- ============================================================
CREATE TABLE IF NOT EXISTS user_xp (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_slug      TEXT NOT NULL,
  user_identifier  TEXT NOT NULL,
  xp               INTEGER NOT NULL DEFAULT 0,
  interviews_done  INTEGER NOT NULL DEFAULT 0,
  last_active      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (client_slug, user_identifier)
);

-- Index for lookups by client
CREATE INDEX IF NOT EXISTS user_xp_client_slug_idx ON user_xp (client_slug);

-- Row Level Security
ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;

-- Policy: allow full access via service role key (server-side only)
CREATE POLICY "Service role full access" ON user_xp
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ============================================================
-- SESSIONS TABLE
-- Tracks each interview session (start time, completion, metadata).
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      TEXT NOT NULL UNIQUE,
  client_slug     TEXT NOT NULL,
  user_identifier TEXT,
  user_name       TEXT,
  user_role       TEXT,
  message_count   INTEGER NOT NULL DEFAULT 0,
  completed       BOOLEAN NOT NULL DEFAULT FALSE,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

-- Index for lookups by client
CREATE INDEX IF NOT EXISTS sessions_client_slug_idx ON sessions (client_slug);

-- Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Policy: allow full access via service role key (server-side only)
CREATE POLICY "Service role full access" ON sessions
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
