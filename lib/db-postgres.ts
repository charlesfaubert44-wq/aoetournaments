import { neon } from '@neondatabase/serverless';

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create SQL client
const sql = neon(databaseUrl);

export async function initDatabase() {
  console.log('Initializing Postgres database...');

  // Create Players table
  await sql`
    CREATE TABLE IF NOT EXISTS players (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      aoe2_username TEXT NOT NULL,
      preferred_civ TEXT NOT NULL,
      registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      seed INTEGER
    )
  `;

  // Create Matches table
  await sql`
    CREATE TABLE IF NOT EXISTS matches (
      id SERIAL PRIMARY KEY,
      round INTEGER NOT NULL,
      match_number INTEGER NOT NULL,
      player1_id INTEGER REFERENCES players(id),
      player2_id INTEGER REFERENCES players(id),
      winner_id INTEGER REFERENCES players(id),
      completed_at TIMESTAMP
    )
  `;

  // Create AdminUsers table
  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )
  `;

  console.log('Database tables initialized successfully');
}

export async function getPlayerCount(): Promise<number> {
  const result = await sql`SELECT COUNT(*) as count FROM players`;
  return Number(result[0].count);
}

export async function getPlayerByEmail(email: string) {
  const result = await sql`SELECT * FROM players WHERE email = ${email}`;
  return result[0] || null;
}

export async function createPlayer(
  name: string,
  email: string,
  aoe2Username: string,
  preferredCiv: string
) {
  const result = await sql`
    INSERT INTO players (name, email, aoe2_username, preferred_civ)
    VALUES (${name}, ${email}, ${aoe2Username}, ${preferredCiv})
    RETURNING *
  `;
  return result[0];
}

export async function getAllPlayers() {
  return await sql`SELECT * FROM players ORDER BY registered_at ASC`;
}

export async function getPlayersOrderedBySeed() {
  return await sql`SELECT * FROM players ORDER BY seed ASC, registered_at ASC`;
}

export async function updatePlayerSeed(playerId: number, seed: number) {
  await sql`UPDATE players SET seed = ${seed} WHERE id = ${playerId}`;
}

export async function deleteAllMatches() {
  await sql`DELETE FROM matches`;
}

export async function createMatch(
  round: number,
  matchNumber: number,
  player1Id: number | null,
  player2Id: number | null
) {
  const result = await sql`
    INSERT INTO matches (round, match_number, player1_id, player2_id)
    VALUES (${round}, ${matchNumber}, ${player1Id}, ${player2Id})
    RETURNING *
  `;
  return result[0];
}

export async function getAllMatches() {
  return await sql`SELECT * FROM matches ORDER BY round ASC, match_number ASC`;
}

export async function getMatchById(matchId: number) {
  const result = await sql`SELECT * FROM matches WHERE id = ${matchId}`;
  return result[0];
}

export async function getMatchByRoundAndNumber(round: number, matchNumber: number) {
  const result = await sql`
    SELECT * FROM matches
    WHERE round = ${round} AND match_number = ${matchNumber}
  `;
  return result[0];
}

export async function updateMatchWinner(matchId: number, winnerId: number) {
  await sql`
    UPDATE matches
    SET winner_id = ${winnerId}, completed_at = CURRENT_TIMESTAMP
    WHERE id = ${matchId}
  `;
}

export async function updateMatchPlayer(matchId: number, playerSlot: 1 | 2, playerId: number) {
  if (playerSlot === 1) {
    await sql`UPDATE matches SET player1_id = ${playerId} WHERE id = ${matchId}`;
  } else {
    await sql`UPDATE matches SET player2_id = ${playerId} WHERE id = ${matchId}`;
  }
}

export async function getAdminByUsername(username: string) {
  const result = await sql`SELECT * FROM admin_users WHERE username = ${username}`;
  return result[0] || null;
}

export async function createAdminUser(username: string, passwordHash: string) {
  const result = await sql`
    INSERT INTO admin_users (username, password_hash)
    VALUES (${username}, ${passwordHash})
    RETURNING *
  `;
  return result[0];
}

// Initialize database on first import
export async function ensureInitialized() {
  try {
    await initDatabase();
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}
