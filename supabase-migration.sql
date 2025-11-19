-- Migration: Remove preferred_civ, rename aoe2_username to steam_username, add elo field
-- Run this in Supabase SQL Editor

-- Step 1: Add new column for steam_username
ALTER TABLE players
ADD COLUMN IF NOT EXISTS steam_username TEXT;

-- Step 2: Copy data from aoe2_username to steam_username
UPDATE players
SET steam_username = aoe2_username
WHERE steam_username IS NULL;

-- Step 3: Make steam_username NOT NULL after data migration
ALTER TABLE players
ALTER COLUMN steam_username SET NOT NULL;

-- Step 4: Add ELO column
ALTER TABLE players
ADD COLUMN IF NOT EXISTS elo INTEGER;

-- Step 5: Drop the old columns
ALTER TABLE players
DROP COLUMN IF EXISTS aoe2_username CASCADE;

ALTER TABLE players
DROP COLUMN IF EXISTS preferred_civ CASCADE;

-- Step 6: Update the updated schema SQL for reference
COMMENT ON COLUMN players.steam_username IS 'Steam username for AoE2';
COMMENT ON COLUMN players.elo IS 'Player ELO rating from AoE2 Insights';
