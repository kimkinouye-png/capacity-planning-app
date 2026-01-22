-- Migration: Add start_date and end_date columns to roadmap_items
-- Date: 2026-01-XX
-- Description: Adds date columns to support Start/End date fields for roadmap items

ALTER TABLE roadmap_items 
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;
