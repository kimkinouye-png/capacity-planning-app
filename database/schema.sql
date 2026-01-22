-- Capacity Planner Database Schema
-- Run this against your Neon Postgres database

-- Settings table: stores global configuration
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Effort model weights: UX factors, Content factors, PM Intake multiplier
  effort_model JSONB NOT NULL DEFAULT '{
    "ux": {
      "productRisk": 1.2,
      "problemAmbiguity": 1.0,
      "discoveryDepth": 0.9
    },
    "content": {
      "contentSurfaceArea": 1.3,
      "localizationScope": 1.0,
      "regulatoryBrandRisk": 1.2,
      "legalComplianceDependency": 1.1
    },
    "pmIntakeMultiplier": 1.0
  }'::jsonb,
  -- Time model: focus-time ratio
  time_model JSONB NOT NULL DEFAULT '{
    "focusTimeRatio": 0.75
  }'::jsonb,
  -- Size band thresholds: XS, S, M, L, XL
  size_bands JSONB NOT NULL DEFAULT '{
    "xs": 1.6,
    "s": 2.6,
    "m": 3.6,
    "l": 4.6,
    "xl": 5.0
  }'::jsonb
);

-- Create a single default settings row if it doesn't exist
INSERT INTO settings (id) 
VALUES ('00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- Scenarios table: stores planning scenarios
CREATE TABLE IF NOT EXISTS scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  quarter TEXT NOT NULL, -- e.g., "2026-Q1"
  year INT NOT NULL,
  committed BOOLEAN NOT NULL DEFAULT FALSE,
  ux_designers INT NOT NULL DEFAULT 0,
  content_designers INT NOT NULL DEFAULT 0,
  weeks_per_period INT NOT NULL DEFAULT 13,
  sprint_length_weeks INT NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Roadmap items table: stores individual roadmap items within scenarios
CREATE TABLE IF NOT EXISTS roadmap_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  key TEXT NOT NULL, -- short_key
  name TEXT NOT NULL,
  initiative TEXT,
  priority INT,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, ready_for_sizing, sized, locked
  -- PM Intake fields stored as JSONB
  pm_intake JSONB,
  -- UX factor scores stored as JSONB
  ux_factors JSONB,
  -- Content factor scores stored as JSONB
  content_factors JSONB,
  -- Calculated scores and sizes
  ux_score NUMERIC(5, 2),
  content_score NUMERIC(5, 2),
  ux_size TEXT, -- XS, S, M, L, XL
  content_size TEXT, -- XS, S, M, L, XL
  ux_focus_weeks NUMERIC(5, 2),
  content_focus_weeks NUMERIC(5, 2),
  ux_work_weeks NUMERIC(5, 2),
  content_work_weeks NUMERIC(5, 2),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activity log table: stores activity events
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type TEXT NOT NULL, -- scenario_created, scenario_committed, scenario_deleted, scenario_renamed, roadmap_item_updated, effort_updated
  scenario_id UUID REFERENCES scenarios(id) ON DELETE SET NULL,
  scenario_name TEXT,
  description TEXT NOT NULL
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_scenarios_quarter ON scenarios(quarter);
CREATE INDEX IF NOT EXISTS idx_scenarios_committed ON scenarios(committed);
CREATE INDEX IF NOT EXISTS idx_roadmap_items_scenario_id ON roadmap_items(scenario_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp ON activity_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_scenario_id ON activity_log(scenario_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scenarios_updated_at
  BEFORE UPDATE ON scenarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roadmap_items_updated_at
  BEFORE UPDATE ON roadmap_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
