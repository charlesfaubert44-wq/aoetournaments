import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Use /tmp for Vercel serverless environment
const isVercel = process.env.VERCEL === '1';
const dbPath = isVercel
  ? path.join('/tmp', 'tournament.db')
  : (process.env.DATABASE_PATH || path.join(process.cwd(), 'tournament.db'));

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Always initialize tables (especially important for Vercel /tmp which is ephemeral)
    console.log('Ensuring database tables exist...');
    ensureInitialized(db);
  }
  return db;
}

function ensureInitialized(database: Database.Database) {
  // Create Players table
  database.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      aoe2Username TEXT NOT NULL,
      preferredCiv TEXT NOT NULL,
      registeredAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      seed INTEGER
    )
  `);

  // Create Matches table
  database.exec(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      round INTEGER NOT NULL,
      matchNumber INTEGER NOT NULL,
      player1Id INTEGER REFERENCES players(id),
      player2Id INTEGER REFERENCES players(id),
      winnerId INTEGER REFERENCES players(id),
      completedAt DATETIME
    )
  `);

  // Create AdminUsers table
  database.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL
    )
  `);

  console.log('Database tables initialized');
}

export function initDatabase() {
  const db = getDatabase();

  // Create Players table
  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      aoe2Username TEXT NOT NULL,
      preferredCiv TEXT NOT NULL,
      registeredAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      seed INTEGER
    )
  `);

  // Create Matches table
  db.exec(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      round INTEGER NOT NULL,
      matchNumber INTEGER NOT NULL,
      player1Id INTEGER REFERENCES players(id),
      player2Id INTEGER REFERENCES players(id),
      winnerId INTEGER REFERENCES players(id),
      completedAt DATETIME
    )
  `);

  // Create AdminUsers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL
    )
  `);

  console.log('Database initialized successfully');
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}
