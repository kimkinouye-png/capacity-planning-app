-- Per-visitor session isolation: add session_id to scenarios
-- Run this in Neon SQL Editor if the column does not already exist.
-- (Idempotent: add column only if missing.)

ALTER TABLE scenarios
ADD COLUMN IF NOT EXISTS session_id TEXT;

CREATE INDEX IF NOT EXISTS idx_scenarios_session_id ON scenarios(session_id);

-- Optional: backfill existing rows with a placeholder so they remain visible
-- until you decide to scope them to a default session or leave NULL for "legacy" visibility.
-- UPDATE scenarios SET session_id = 'legacy' WHERE session_id IS NULL;
