-- Coupe Québec AOE2 Database Schema for Supabase
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/uqjufpvozacbawmptzkk/sql/new

-- Create Players table
CREATE TABLE IF NOT EXISTS players (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  aoe2_username TEXT NOT NULL,
  preferred_civ TEXT NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  seed INTEGER
);

-- Create Matches table
CREATE TABLE IF NOT EXISTS matches (
  id BIGSERIAL PRIMARY KEY,
  round INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  player1_id BIGINT REFERENCES players(id),
  player2_id BIGINT REFERENCES players(id),
  winner_id BIGINT REFERENCES players(id),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create Admin Users table
CREATE TABLE IF NOT EXISTS admin_users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_email ON players(email);
CREATE INDEX IF NOT EXISTS idx_players_seed ON players(seed);
CREATE INDEX IF NOT EXISTS idx_matches_round ON matches(round);
CREATE INDEX IF NOT EXISTS idx_matches_player1 ON matches(player1_id);
CREATE INDEX IF NOT EXISTS idx_matches_player2 ON matches(player2_id);
CREATE INDEX IF NOT EXISTS idx_matches_winner ON matches(winner_id);

-- Enable Row Level Security (RLS)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to players"
  ON players FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to matches"
  ON matches FOR SELECT
  USING (true);

-- Create policies for insert/update (temporarily allow all for development)
-- You can tighten these later with proper authentication
CREATE POLICY "Allow insert to players"
  ON players FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow insert to matches"
  ON matches FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update to players"
  ON players FOR UPDATE
  USING (true);

CREATE POLICY "Allow update to matches"
  ON matches FOR UPDATE
  USING (true);

CREATE POLICY "Allow delete from matches"
  ON matches FOR DELETE
  USING (true);

-- Admin users policies (read/write for service role)
CREATE POLICY "Allow read admin_users"
  ON admin_users FOR SELECT
  USING (true);

CREATE POLICY "Allow insert admin_users"
  ON admin_users FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE players IS 'Tournament players registration';
COMMENT ON TABLE matches IS 'Tournament bracket matches';
COMMENT ON TABLE admin_users IS 'Admin users for tournament management';
