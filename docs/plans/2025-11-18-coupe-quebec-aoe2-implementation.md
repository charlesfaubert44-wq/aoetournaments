# Coupe Québec AOE2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Next.js tournament platform for 20-player Age of Empires 2 tournament with registration, bracket display, and admin management.

**Architecture:** Next.js 14 App Router with TypeScript, SQLite database, server-side rendering for public pages, server actions for mutations, session-based admin authentication.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, better-sqlite3, bcrypt, next-intl

---

## Task 1: Project Initialization and Dependencies

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `tailwind.config.ts`
- Create: `.env.local`

**Step 1: Initialize Next.js project**

Run:
```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

When prompted:
- Would you like to use TypeScript? **Yes**
- Would you like to use ESLint? **Yes**
- Would you like to use Tailwind CSS? **Yes**
- Would you like to use `src/` directory? **No**
- Would you like to use App Router? **Yes**
- Would you like to customize the default import alias? **No**

Expected: Project scaffolded with Next.js 14, TypeScript, Tailwind CSS

**Step 2: Install additional dependencies**

Run:
```bash
npm install better-sqlite3 bcryptjs next-intl
npm install -D @types/better-sqlite3 @types/bcryptjs
```

Expected: Dependencies installed successfully

**Step 3: Create environment variables file**

Create `.env.local`:
```env
TOURNAMENT_CODE=QUEBEC2025
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme123
SESSION_SECRET=your-secret-key-change-in-production
DATABASE_PATH=./tournament.db
```

**Step 4: Update .gitignore**

Add to `.gitignore`:
```
# Database
*.db
*.db-journal

# Environment
.env.local
.env*.local
```

**Step 5: Commit**

Run:
```bash
git add .
git commit -m "chore: initialize Next.js project with dependencies"
```

---

## Task 2: Database Schema and Setup

**Files:**
- Create: `lib/db.ts`
- Create: `lib/types.ts`
- Create: `scripts/init-db.ts`

**Step 1: Define TypeScript types**

Create `lib/types.ts`:
```typescript
export interface Player {
  id: number;
  name: string;
  email: string;
  aoe2Username: string;
  preferredCiv: string;
  registeredAt: string;
  seed: number | null;
}

export interface Match {
  id: number;
  round: number;
  matchNumber: number;
  player1Id: number | null;
  player2Id: number | null;
  winnerId: number | null;
  completedAt: string | null;
}

export interface AdminUser {
  id: number;
  username: string;
  passwordHash: string;
}

export const AOE2_CIVILIZATIONS = [
  'Aztecs', 'Berbers', 'Britons', 'Bulgarians', 'Burmese',
  'Byzantines', 'Celts', 'Chinese', 'Cumans', 'Ethiopians',
  'Franks', 'Goths', 'Huns', 'Incas', 'Indians',
  'Italians', 'Japanese', 'Khmer', 'Koreans', 'Lithuanians',
  'Magyars', 'Malay', 'Malians', 'Mayans', 'Mongols',
  'Persians', 'Portuguese', 'Saracens', 'Slavs', 'Spanish',
  'Tatars', 'Teutons', 'Turks', 'Vietnamese', 'Vikings'
] as const;

export type Civilization = typeof AOE2_CIVILIZATIONS[number];
```

**Step 2: Create database utility**

Create `lib/db.ts`:
```typescript
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'tournament.db');

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
  }
  return db;
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
```

**Step 3: Create database initialization script**

Create `scripts/init-db.ts`:
```typescript
import { initDatabase, getDatabase, closeDatabase } from '../lib/db';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Initializing database...');
  initDatabase();

  const db = getDatabase();

  // Create default admin user
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'changeme123';
  const passwordHash = await bcrypt.hash(password, 10);

  const existingAdmin = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);

  if (!existingAdmin) {
    db.prepare('INSERT INTO admin_users (username, passwordHash) VALUES (?, ?)').run(username, passwordHash);
    console.log(`Admin user created: ${username}`);
  } else {
    console.log('Admin user already exists');
  }

  closeDatabase();
  console.log('Database initialization complete');
}

main().catch(console.error);
```

**Step 4: Add script to package.json**

Modify `package.json`, add to scripts:
```json
{
  "scripts": {
    "init-db": "tsx scripts/init-db.ts"
  }
}
```

**Step 5: Install tsx for running TypeScript scripts**

Run:
```bash
npm install -D tsx
```

**Step 6: Initialize the database**

Run:
```bash
npm run init-db
```

Expected: "Database initialization complete" message, `tournament.db` file created

**Step 7: Commit**

Run:
```bash
git add lib/ scripts/ package.json package-lock.json
git commit -m "feat: add database schema and initialization"
```

---

## Task 3: Registration System - Backend

**Files:**
- Create: `app/api/register/route.ts`
- Create: `lib/validation.ts`

**Step 1: Create validation utilities**

Create `lib/validation.ts`:
```typescript
import { AOE2_CIVILIZATIONS } from './types';

export interface RegistrationData {
  name: string;
  email: string;
  aoe2Username: string;
  preferredCiv: string;
  tournamentCode: string;
}

export function validateRegistration(data: RegistrationData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!data.email || !data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push('Valid email is required');
  }

  if (!data.aoe2Username || data.aoe2Username.trim().length < 2) {
    errors.push('AoE2 username must be at least 2 characters');
  }

  if (!data.preferredCiv || !AOE2_CIVILIZATIONS.includes(data.preferredCiv as any)) {
    errors.push('Valid civilization is required');
  }

  if (!data.tournamentCode) {
    errors.push('Tournament code is required');
  }

  return { valid: errors.length === 0, errors };
}
```

**Step 2: Create registration API route**

Create `app/api/register/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { validateRegistration, RegistrationData } from '@/lib/validation';

const MAX_PLAYERS = 20;

export async function POST(request: NextRequest) {
  try {
    const data: RegistrationData = await request.json();

    // Validate input
    const validation = validateRegistration(data);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Verify tournament code
    if (data.tournamentCode !== process.env.TOURNAMENT_CODE) {
      return NextResponse.json(
        { error: 'Invalid tournament code' },
        { status: 403 }
      );
    }

    const db = getDatabase();

    // Check registration limit
    const count = db.prepare('SELECT COUNT(*) as count FROM players').get() as { count: number };
    if (count.count >= MAX_PLAYERS) {
      return NextResponse.json(
        { error: 'Tournament is full (20/20 players)' },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const existing = db.prepare('SELECT id FROM players WHERE email = ?').get(data.email);
    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Insert player
    const result = db.prepare(`
      INSERT INTO players (name, email, aoe2Username, preferredCiv)
      VALUES (?, ?, ?, ?)
    `).run(data.name.trim(), data.email.trim(), data.aoe2Username.trim(), data.preferredCiv);

    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json({ success: true, player }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = getDatabase();
    const players = db.prepare('SELECT * FROM players ORDER BY registeredAt ASC').all();
    const count = players.length;

    return NextResponse.json({ players, count, maxPlayers: MAX_PLAYERS });
  } catch (error) {
    console.error('Get players error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Step 3: Test the API manually**

Run dev server:
```bash
npm run dev
```

Test with curl:
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Player","email":"test@example.com","aoe2Username":"TestWarrior","preferredCiv":"Franks","tournamentCode":"QUEBEC2025"}'
```

Expected: 201 response with player data

**Step 4: Commit**

Run:
```bash
git add app/api/register/ lib/validation.ts
git commit -m "feat: add registration API endpoint with validation"
```

---

## Task 4: Registration System - Frontend

**Files:**
- Create: `app/register/page.tsx`
- Create: `components/RegistrationForm.tsx`

**Step 1: Create registration form component**

Create `components/RegistrationForm.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { AOE2_CIVILIZATIONS } from '@/lib/types';

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    aoe2Username: '',
    preferredCiv: '',
    tournamentCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
        <h2 className="text-2xl font-bold text-green-800 mb-2">Registration Successful!</h2>
        <p className="text-green-700">You&apos;re registered for Coupe Québec AOE2!</p>
        <a href="/players" className="mt-4 inline-block text-blue-600 hover:underline">
          View All Players →
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8 space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="aoe2Username" className="block text-sm font-medium mb-1">
          AoE2 Username
        </label>
        <input
          id="aoe2Username"
          type="text"
          required
          value={formData.aoe2Username}
          onChange={(e) => setFormData({ ...formData, aoe2Username: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="preferredCiv" className="block text-sm font-medium mb-1">
          Preferred Civilization
        </label>
        <select
          id="preferredCiv"
          required
          value={formData.preferredCiv}
          onChange={(e) => setFormData({ ...formData, preferredCiv: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Select a civilization...</option>
          {AOE2_CIVILIZATIONS.map((civ) => (
            <option key={civ} value={civ}>
              {civ}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="tournamentCode" className="block text-sm font-medium mb-1">
          Tournament Code
        </label>
        <input
          id="tournamentCode"
          type="password"
          required
          value={formData.tournamentCode}
          onChange={(e) => setFormData({ ...formData, tournamentCode: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
```

**Step 2: Create registration page**

Create `app/register/page.tsx`:
```typescript
import RegistrationForm from '@/components/RegistrationForm';

export default function RegisterPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Register for Coupe Québec AOE2
      </h1>
      <RegistrationForm />
    </main>
  );
}
```

**Step 3: Test registration form**

Run:
```bash
npm run dev
```

Navigate to: http://localhost:3000/register

Expected: Registration form displays, can submit and see success message

**Step 4: Commit**

Run:
```bash
git add app/register/ components/RegistrationForm.tsx
git commit -m "feat: add registration form frontend"
```

---

## Task 5: Players Gallery Page

**Files:**
- Create: `app/players/page.tsx`
- Create: `components/PlayerCard.tsx`

**Step 1: Create player card component**

Create `components/PlayerCard.tsx`:
```typescript
import { Player } from '@/lib/types';

interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold mb-2">{player.name}</h3>
      <div className="space-y-1 text-sm text-gray-600">
        <p><span className="font-medium">AoE2:</span> {player.aoe2Username}</p>
        <p><span className="font-medium">Civilization:</span> {player.preferredCiv}</p>
        <p className="text-xs text-gray-400">
          Registered: {new Date(player.registeredAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
```

**Step 2: Create players page**

Create `app/players/page.tsx`:
```typescript
import { getDatabase } from '@/lib/db';
import { Player } from '@/lib/types';
import PlayerCard from '@/components/PlayerCard';

export const dynamic = 'force-dynamic';

export default function PlayersPage() {
  const db = getDatabase();
  const players = db.prepare('SELECT * FROM players ORDER BY registeredAt ASC').all() as Player[];

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-4">
        Registered Players
      </h1>
      <p className="text-center text-gray-600 mb-8">
        {players.length} / 20 players registered
      </p>

      {players.length === 0 ? (
        <p className="text-center text-gray-500">No players registered yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}
    </main>
  );
}
```

**Step 3: Test players page**

Run:
```bash
npm run dev
```

Navigate to: http://localhost:3000/players

Expected: Shows registered players in grid layout

**Step 4: Commit**

Run:
```bash
git add app/players/ components/PlayerCard.tsx
git commit -m "feat: add players gallery page"
```

---

## Task 6: Bracket Generation Logic

**Files:**
- Create: `lib/bracket.ts`
- Create: `app/api/admin/bracket/route.ts`

**Step 1: Create bracket generation utility**

Create `lib/bracket.ts`:
```typescript
import { getDatabase } from './db';
import { Player, Match } from './types';

export function generateBracket(): Match[] {
  const db = getDatabase();

  // Get all players
  const players = db.prepare('SELECT * FROM players ORDER BY seed ASC, registeredAt ASC').all() as Player[];

  if (players.length !== 20) {
    throw new Error(`Expected 20 players, got ${players.length}`);
  }

  // Clear existing matches
  db.prepare('DELETE FROM matches').run();

  const matches: Match[] = [];

  // Round 1 (Round of 16) - 8 matches
  // Top 4 seeds get byes, so we start with players 5-20 (16 players)
  const round1Players = players.slice(4); // Players with seed 5-20

  for (let i = 0; i < 8; i++) {
    const match = db.prepare(`
      INSERT INTO matches (round, matchNumber, player1Id, player2Id)
      VALUES (1, ?, ?, ?)
    `).run(i + 1, round1Players[i * 2].id, round1Players[i * 2 + 1].id);

    matches.push({
      id: Number(match.lastInsertRowid),
      round: 1,
      matchNumber: i + 1,
      player1Id: round1Players[i * 2].id,
      player2Id: round1Players[i * 2 + 1].id,
      winnerId: null,
      completedAt: null
    });
  }

  // Round 2 (Quarterfinals) - 8 matches
  // First 4 matches: top 4 seeds vs TBD from round 1
  const topSeeds = players.slice(0, 4);
  for (let i = 0; i < 4; i++) {
    const match = db.prepare(`
      INSERT INTO matches (round, matchNumber, player1Id, player2Id)
      VALUES (2, ?, ?, NULL)
    `).run(i + 1, topSeeds[i].id);

    matches.push({
      id: Number(match.lastInsertRowid),
      round: 2,
      matchNumber: i + 1,
      player1Id: topSeeds[i].id,
      player2Id: null,
      winnerId: null,
      completedAt: null
    });
  }

  // Next 4 matches in round 2: TBD vs TBD
  for (let i = 4; i < 8; i++) {
    const match = db.prepare(`
      INSERT INTO matches (round, matchNumber, player1Id, player2Id)
      VALUES (2, ?, NULL, NULL)
    `).run(i + 1);

    matches.push({
      id: Number(match.lastInsertRowid),
      round: 2,
      matchNumber: i + 1,
      player1Id: null,
      player2Id: null,
      winnerId: null,
      completedAt: null
    });
  }

  // Round 3 (Semifinals) - 4 matches
  for (let i = 0; i < 4; i++) {
    const match = db.prepare(`
      INSERT INTO matches (round, matchNumber, player1Id, player2Id)
      VALUES (3, ?, NULL, NULL)
    `).run(i + 1);

    matches.push({
      id: Number(match.lastInsertRowid),
      round: 3,
      matchNumber: i + 1,
      player1Id: null,
      player2Id: null,
      winnerId: null,
      completedAt: null
    });
  }

  // Round 4 (Finals) - 2 matches
  for (let i = 0; i < 2; i++) {
    const match = db.prepare(`
      INSERT INTO matches (round, matchNumber, player1Id, player2Id)
      VALUES (4, ?, NULL, NULL)
    `).run(i + 1);

    matches.push({
      id: Number(match.lastInsertRowid),
      round: 4,
      matchNumber: i + 1,
      player1Id: null,
      player2Id: null,
      winnerId: null,
      completedAt: null
    });
  }

  // Round 5 (Championship) - 1 match
  const finalMatch = db.prepare(`
    INSERT INTO matches (round, matchNumber, player1Id, player2Id)
    VALUES (5, 1, NULL, NULL)
  `).run();

  matches.push({
    id: Number(finalMatch.lastInsertRowid),
    round: 5,
    matchNumber: 1,
    player1Id: null,
    player2Id: null,
    winnerId: null,
    completedAt: null
  });

  return matches;
}

export function assignSeeds() {
  const db = getDatabase();
  const players = db.prepare('SELECT id FROM players ORDER BY registeredAt ASC').all() as { id: number }[];

  // Simple seeding: randomize
  const shuffled = players.sort(() => Math.random() - 0.5);

  shuffled.forEach((player, index) => {
    db.prepare('UPDATE players SET seed = ? WHERE id = ?').run(index + 1, player.id);
  });
}

export function updateMatchWinner(matchId: number, winnerId: number) {
  const db = getDatabase();

  // Update match
  db.prepare(`
    UPDATE matches
    SET winnerId = ?, completedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(winnerId, matchId);

  // Get match details
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(matchId) as Match;

  // Advance winner to next round
  advanceWinner(match, winnerId);
}

function advanceWinner(match: Match, winnerId: number) {
  const db = getDatabase();

  if (match.round === 5) {
    // Championship - no advancement
    return;
  }

  const nextRound = match.round + 1;
  const nextMatchNumber = Math.ceil(match.matchNumber / 2);

  const nextMatch = db.prepare(
    'SELECT * FROM matches WHERE round = ? AND matchNumber = ?'
  ).get(nextRound, nextMatchNumber) as Match;

  if (!nextMatch) {
    return;
  }

  // Determine which slot to fill
  const isPlayer1Slot = match.matchNumber % 2 === 1;

  if (isPlayer1Slot) {
    db.prepare('UPDATE matches SET player1Id = ? WHERE id = ?').run(winnerId, nextMatch.id);
  } else {
    db.prepare('UPDATE matches SET player2Id = ? WHERE id = ?').run(winnerId, nextMatch.id);
  }
}
```

**Step 2: Create bracket API route**

Create `app/api/admin/bracket/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateBracket, assignSeeds } from '@/lib/bracket';

export async function POST(request: NextRequest) {
  try {
    // Assign random seeds
    assignSeeds();

    // Generate bracket
    const matches = generateBracket();

    return NextResponse.json({ success: true, matches });
  } catch (error: any) {
    console.error('Bracket generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate bracket' },
      { status: 500 }
    );
  }
}
```

**Step 3: Commit**

Run:
```bash
git add lib/bracket.ts app/api/admin/bracket/
git commit -m "feat: add bracket generation logic"
```

---

## Task 7: Bracket Display Page

**Files:**
- Create: `app/brackets/page.tsx`
- Create: `components/BracketView.tsx`

**Step 1: Create bracket view component**

Create `components/BracketView.tsx`:
```typescript
'use client';

import { Match, Player } from '@/lib/types';

interface BracketViewProps {
  matches: Match[];
  players: Player[];
}

export default function BracketView({ matches, players }: BracketViewProps) {
  const getPlayerName = (playerId: number | null) => {
    if (!playerId) return 'TBD';
    const player = players.find(p => p.id === playerId);
    return player ? player.aoe2Username : 'Unknown';
  };

  const getRoundName = (round: number) => {
    switch (round) {
      case 1: return 'Round of 16';
      case 2: return 'Quarterfinals';
      case 3: return 'Semifinals';
      case 4: return 'Finals';
      case 5: return 'Championship';
      default: return `Round ${round}`;
    }
  };

  const groupedMatches = matches.reduce((acc, match) => {
    if (!acc[match.round]) acc[match.round] = [];
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Bracket has not been generated yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedMatches).map(([round, roundMatches]) => (
        <div key={round}>
          <h2 className="text-2xl font-bold mb-4">{getRoundName(Number(round))}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roundMatches.map((match) => (
              <div key={match.id} className="border border-gray-300 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-2">Match {match.matchNumber}</div>
                <div className="space-y-2">
                  <div className={`p-2 rounded ${match.winnerId === match.player1Id ? 'bg-green-100 font-bold' : 'bg-gray-50'}`}>
                    {getPlayerName(match.player1Id)}
                  </div>
                  <div className="text-center text-gray-400">vs</div>
                  <div className={`p-2 rounded ${match.winnerId === match.player2Id ? 'bg-green-100 font-bold' : 'bg-gray-50'}`}>
                    {getPlayerName(match.player2Id)}
                  </div>
                </div>
                {match.winnerId && (
                  <div className="mt-2 text-sm text-green-600 font-medium">
                    Winner: {getPlayerName(match.winnerId)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Step 2: Create brackets page**

Create `app/brackets/page.tsx`:
```typescript
import { getDatabase } from '@/lib/db';
import { Match, Player } from '@/lib/types';
import BracketView from '@/components/BracketView';

export const dynamic = 'force-dynamic';

export default function BracketsPage() {
  const db = getDatabase();
  const matches = db.prepare('SELECT * FROM matches ORDER BY round ASC, matchNumber ASC').all() as Match[];
  const players = db.prepare('SELECT * FROM players').all() as Player[];

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Tournament Bracket
      </h1>
      <BracketView matches={matches} players={players} />
    </main>
  );
}
```

**Step 3: Test bracket page**

Run:
```bash
npm run dev
```

Navigate to: http://localhost:3000/brackets

Expected: Shows "Bracket has not been generated yet" or displays matches if generated

**Step 4: Commit**

Run:
```bash
git add app/brackets/ components/BracketView.tsx
git commit -m "feat: add bracket display page"
```

---

## Task 8: Admin Authentication

**Files:**
- Create: `lib/auth.ts`
- Create: `app/api/admin/login/route.ts`
- Create: `app/api/admin/logout/route.ts`
- Create: `middleware.ts`

**Step 1: Create auth utilities**

Create `lib/auth.ts`:
```typescript
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { getDatabase } from './db';

const SESSION_COOKIE = 'admin_session';

export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  const db = getDatabase();
  const admin = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username) as any;

  if (!admin) {
    return false;
  }

  return await bcrypt.compare(password, admin.passwordHash);
}

export async function createSession(username: string) {
  const cookieStore = await cookies();
  // Simple session - just store username (in production, use signed JWT)
  cookieStore.set(SESSION_COOKIE, username, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 // 24 hours
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return session?.value || null;
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}
```

**Step 2: Create login API route**

Create `app/api/admin/login/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    const valid = await verifyAdmin(username, password);

    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    await createSession(username);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Step 3: Create logout API route**

Create `app/api/admin/logout/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth';

export async function POST() {
  await deleteSession();
  return NextResponse.json({ success: true });
}
```

**Step 4: Create middleware for route protection**

Create `middleware.ts`:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes (except login page and API)
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    const session = request.cookies.get('admin_session');

    if (!session) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
```

**Step 5: Commit**

Run:
```bash
git add lib/auth.ts app/api/admin/login/ app/api/admin/logout/ middleware.ts
git commit -m "feat: add admin authentication system"
```

---

## Task 9: Admin Login and Dashboard Pages

**Files:**
- Create: `app/admin/page.tsx`
- Create: `app/admin/dashboard/page.tsx`
- Create: `components/AdminLoginForm.tsx`
- Create: `components/AdminDashboard.tsx`

**Step 1: Create admin login form**

Create `components/AdminLoginForm.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-12 space-y-4">
      <h1 className="text-2xl font-bold text-center">Admin Login</h1>

      <div>
        <label htmlFor="username" className="block text-sm font-medium mb-1">
          Username
        </label>
        <input
          id="username"
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

**Step 2: Create admin login page**

Create `app/admin/page.tsx`:
```typescript
import AdminLoginForm from '@/components/AdminLoginForm';

export default function AdminLoginPage() {
  return (
    <main className="container mx-auto px-4">
      <AdminLoginForm />
    </main>
  );
}
```

**Step 3: Create admin dashboard component**

Create `components/AdminDashboard.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Player, Match } from '@/lib/types';

interface AdminDashboardProps {
  initialPlayers: Player[];
  initialMatches: Match[];
}

export default function AdminDashboard({ initialPlayers, initialMatches }: AdminDashboardProps) {
  const [players, setPlayers] = useState(initialPlayers);
  const [matches, setMatches] = useState(initialMatches);
  const [generating, setGenerating] = useState(false);
  const router = useRouter();

  const handleGenerateBracket = async () => {
    if (!confirm('Generate tournament bracket? This will reset any existing bracket.')) {
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/admin/bracket', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to generate bracket');
      }

      router.refresh();
      alert('Bracket generated successfully!');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
    router.refresh();
  };

  const handleUpdateWinner = async (matchId: number, winnerId: number) => {
    try {
      const response = await fetch('/api/admin/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, winnerId })
      });

      if (!response.ok) {
        throw new Error('Failed to update match');
      }

      router.refresh();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getPlayerName = (playerId: number | null) => {
    if (!playerId) return 'TBD';
    const player = players.find(p => p.id === playerId);
    return player ? `${player.name} (${player.aoe2Username})` : 'Unknown';
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Logout
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Tournament Status</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600">{players.length}</div>
            <div className="text-gray-600">Registered Players</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">{matches.length}</div>
            <div className="text-gray-600">Total Matches</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600">
              {matches.filter(m => m.winnerId).length}
            </div>
            <div className="text-gray-600">Completed Matches</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Bracket Management</h2>
        <button
          onClick={handleGenerateBracket}
          disabled={generating || players.length !== 20}
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {generating ? 'Generating...' : 'Generate Bracket'}
        </button>
        {players.length !== 20 && (
          <p className="mt-2 text-sm text-red-600">Need exactly 20 players to generate bracket</p>
        )}
      </div>

      {matches.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Match Results</h2>
          <div className="space-y-4">
            {matches.map((match) => (
              <div key={match.id} className="border border-gray-200 rounded p-4">
                <div className="font-medium mb-2">
                  Round {match.round}, Match {match.matchNumber}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div>{getPlayerName(match.player1Id)}</div>
                    <div className="text-gray-500">vs</div>
                    <div>{getPlayerName(match.player2Id)}</div>
                  </div>
                  {match.player1Id && match.player2Id && !match.winnerId && (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleUpdateWinner(match.id, match.player1Id!)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Player 1 Wins
                      </button>
                      <button
                        onClick={() => handleUpdateWinner(match.id, match.player2Id!)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Player 2 Wins
                      </button>
                    </div>
                  )}
                  {match.winnerId && (
                    <div className="text-green-600 font-medium">
                      Winner: {getPlayerName(match.winnerId)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Registered Players</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">AoE2 Username</th>
                <th className="text-left p-2">Civilization</th>
                <th className="text-left p-2">Seed</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.id} className="border-b">
                  <td className="p-2">{player.name}</td>
                  <td className="p-2">{player.email}</td>
                  <td className="p-2">{player.aoe2Username}</td>
                  <td className="p-2">{player.preferredCiv}</td>
                  <td className="p-2">{player.seed || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

**Step 4: Create admin dashboard page**

Create `app/admin/dashboard/page.tsx`:
```typescript
import { getDatabase } from '@/lib/db';
import { Player, Match } from '@/lib/types';
import AdminDashboard from '@/components/AdminDashboard';

export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  const db = getDatabase();
  const players = db.prepare('SELECT * FROM players ORDER BY seed ASC, registeredAt ASC').all() as Player[];
  const matches = db.prepare('SELECT * FROM matches ORDER BY round ASC, matchNumber ASC').all() as Match[];

  return (
    <main className="container mx-auto px-4 py-8">
      <AdminDashboard initialPlayers={players} initialMatches={matches} />
    </main>
  );
}
```

**Step 5: Create match update API route**

Create `app/api/admin/match/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { updateMatchWinner } from '@/lib/bracket';
import { isAuthenticated } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { matchId, winnerId } = await request.json();

    if (!matchId || !winnerId) {
      return NextResponse.json(
        { error: 'matchId and winnerId required' },
        { status: 400 }
      );
    }

    updateMatchWinner(matchId, winnerId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Match update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update match' },
      { status: 500 }
    );
  }
}
```

**Step 6: Test admin flow**

Run:
```bash
npm run dev
```

1. Navigate to http://localhost:3000/admin
2. Login with credentials from .env.local (admin/changeme123)
3. Should redirect to dashboard
4. Test generating bracket (need 20 players registered first)

**Step 7: Commit**

Run:
```bash
git add app/admin/ components/Admin* app/api/admin/match/
git commit -m "feat: add admin dashboard and match management"
```

---

## Task 10: Landing Page

**Files:**
- Create: `app/page.tsx`
- Create: `components/Navigation.tsx`
- Modify: `app/layout.tsx`

**Step 1: Create navigation component**

Create `components/Navigation.tsx`:
```typescript
import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Coupe Québec AOE2
          </Link>
          <div className="flex gap-6">
            <Link href="/register" className="hover:text-gray-300">
              Register
            </Link>
            <Link href="/players" className="hover:text-gray-300">
              Players
            </Link>
            <Link href="/brackets" className="hover:text-gray-300">
              Brackets
            </Link>
            <Link href="/admin" className="hover:text-gray-300 text-sm">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

**Step 2: Update layout to include navigation**

Modify `app/layout.tsx`:
```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Coupe Québec AOE2",
  description: "Age of Empires 2 Tournament - 20 Player Competition",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
```

**Step 3: Create landing page**

Modify `app/page.tsx`:
```typescript
import Link from 'next/link';
import { getDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const db = getDatabase();
  const playerCount = db.prepare('SELECT COUNT(*) as count FROM players').get() as { count: number };

  return (
    <main className="container mx-auto px-4">
      <section className="py-20 text-center">
        <h1 className="text-6xl font-bold mb-4 text-gray-900">
          Coupe Québec AOE2
        </h1>
        <p className="text-2xl text-gray-600 mb-8">
          Age of Empires 2 Tournament
        </p>
        <p className="text-lg text-gray-700 mb-12 max-w-2xl mx-auto">
          Join us for an epic 20-player single-elimination tournament!
          Reunite with old friends and compete for glory in the ultimate
          Age of Empires 2 showdown.
        </p>

        <div className="flex gap-4 justify-center mb-12">
          <Link
            href="/register"
            className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700"
          >
            Register Now
          </Link>
          <Link
            href="/brackets"
            className="px-8 py-4 bg-gray-600 text-white text-lg font-semibold rounded-lg hover:bg-gray-700"
          >
            View Brackets
          </Link>
        </div>

        <div className="text-xl font-semibold">
          <span className="text-blue-600">{playerCount.count}</span> / 20 Players Registered
        </div>
      </section>

      <section className="py-12 bg-gray-50 -mx-4 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Tournament Format</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Single Elimination</h3>
              <p className="text-gray-600">
                Classic bracket format with 20 players. Top 4 seeds receive first-round byes.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">5 Rounds</h3>
              <p className="text-gray-600">
                From Round of 16 to Championship. Every match counts!
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Friendly Competition</h3>
              <p className="text-gray-600">
                Casual tournament for friends. Focus on fun and nostalgia!
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Play?</h2>
        <p className="text-gray-600 mb-6">
          Registration is open! Secure your spot in the tournament.
        </p>
        <Link
          href="/register"
          className="inline-block px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700"
        >
          Register for Coupe Québec AOE2
        </Link>
      </section>
    </main>
  );
}
```

**Step 4: Test landing page**

Run:
```bash
npm run dev
```

Navigate to: http://localhost:3000

Expected: Landing page with hero section, tournament format, CTAs, and navigation

**Step 5: Commit**

Run:
```bash
git add app/page.tsx app/layout.tsx components/Navigation.tsx
git commit -m "feat: add landing page and navigation"
```

---

## Task 11: Basic Internationalization Setup

**Files:**
- Create: `i18n/config.ts`
- Create: `i18n/translations/en.json`
- Create: `i18n/translations/fr.json`
- Create: `components/LanguageToggle.tsx`

**Step 1: Install i18n dependency**

Run:
```bash
npm install next-intl
```

**Step 2: Create i18n configuration**

Create `i18n/config.ts`:
```typescript
export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'fr';
```

**Step 3: Create English translations**

Create `i18n/translations/en.json`:
```json
{
  "nav": {
    "home": "Home",
    "register": "Register",
    "players": "Players",
    "brackets": "Brackets",
    "admin": "Admin"
  },
  "home": {
    "title": "Coupe Québec AOE2",
    "subtitle": "Age of Empires 2 Tournament",
    "description": "Join us for an epic 20-player single-elimination tournament! Reunite with old friends and compete for glory in the ultimate Age of Empires 2 showdown.",
    "registerNow": "Register Now",
    "viewBrackets": "View Brackets",
    "playersRegistered": "Players Registered"
  },
  "register": {
    "title": "Register for Coupe Québec AOE2",
    "name": "Full Name",
    "email": "Email",
    "aoe2Username": "AoE2 Username",
    "preferredCiv": "Preferred Civilization",
    "tournamentCode": "Tournament Code",
    "submit": "Register",
    "success": "Registration Successful!",
    "successMessage": "You're registered for Coupe Québec AOE2!"
  }
}
```

**Step 4: Create French translations**

Create `i18n/translations/fr.json`:
```json
{
  "nav": {
    "home": "Accueil",
    "register": "S'inscrire",
    "players": "Joueurs",
    "brackets": "Tournoi",
    "admin": "Admin"
  },
  "home": {
    "title": "Coupe Québec AOE2",
    "subtitle": "Tournoi Age of Empires 2",
    "description": "Rejoignez-nous pour un tournoi épique à élimination directe de 20 joueurs! Retrouvez vos vieux amis et affrontez-vous pour la gloire dans l'ultime compétition Age of Empires 2.",
    "registerNow": "S'inscrire maintenant",
    "viewBrackets": "Voir les matchs",
    "playersRegistered": "Joueurs inscrits"
  },
  "register": {
    "title": "Inscription Coupe Québec AOE2",
    "name": "Nom complet",
    "email": "Courriel",
    "aoe2Username": "Nom d'utilisateur AoE2",
    "preferredCiv": "Civilisation préférée",
    "tournamentCode": "Code du tournoi",
    "submit": "S'inscrire",
    "success": "Inscription réussie!",
    "successMessage": "Vous êtes inscrit à la Coupe Québec AOE2!"
  }
}
```

**Step 5: Create language toggle component**

Create `components/LanguageToggle.tsx`:
```typescript
'use client';

import { useState } from 'react';

export default function LanguageToggle() {
  const [locale, setLocale] = useState<'en' | 'fr'>('fr');

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'fr' : 'en';
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
    // In a full implementation, this would trigger a re-render with new translations
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
    >
      {locale === 'en' ? 'FR' : 'EN'}
    </button>
  );
}
```

**Step 6: Add language toggle to navigation**

Modify `components/Navigation.tsx`:
```typescript
import Link from 'next/link';
import LanguageToggle from './LanguageToggle';

export default function Navigation() {
  return (
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Coupe Québec AOE2
          </Link>
          <div className="flex gap-6 items-center">
            <Link href="/register" className="hover:text-gray-300">
              Register
            </Link>
            <Link href="/players" className="hover:text-gray-300">
              Players
            </Link>
            <Link href="/brackets" className="hover:text-gray-300">
              Brackets
            </Link>
            <Link href="/admin" className="hover:text-gray-300 text-sm">
              Admin
            </Link>
            <LanguageToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
```

**Step 7: Commit**

Run:
```bash
git add i18n/ components/LanguageToggle.tsx components/Navigation.tsx package.json package-lock.json
git commit -m "feat: add basic i18n setup with FR/EN toggle"
```

**Note:** Full i18n integration with next-intl requires more setup. This provides the foundation. For full implementation, refer to next-intl documentation.

---

## Task 12: Styling and Polish

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

**Step 1: Enhance Tailwind configuration with AoE2 theme**

Modify `tailwind.config.ts`:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        medieval: {
          gold: '#D4AF37',
          crimson: '#DC143C',
          stone: '#708090',
          bronze: '#CD7F32',
        }
      },
      fontFamily: {
        medieval: ['Georgia', 'serif'],
      }
    },
  },
  plugins: [],
};
export default config;
```

**Step 2: Add custom global styles**

Modify `app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-50;
}

h1, h2, h3, h4, h5, h6 {
  @apply font-medieval;
}

.btn-primary {
  @apply px-6 py-3 bg-medieval-gold text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors;
}

.btn-secondary {
  @apply px-6 py-3 bg-medieval-crimson text-white font-semibold rounded-lg hover:bg-red-700 transition-colors;
}

.card {
  @apply bg-white rounded-lg shadow-md p-6 border border-gray-200;
}

.tournament-bracket-match {
  @apply border-2 border-medieval-stone rounded-lg p-4 bg-white hover:shadow-lg transition-shadow;
}
```

**Step 3: Test styling**

Run:
```bash
npm run dev
```

Navigate through pages to see updated styling.

**Step 4: Commit**

Run:
```bash
git add tailwind.config.ts app/globals.css
git commit -m "style: add AoE2 medieval theme colors and custom styles"
```

---

## Task 13: README and Documentation

**Files:**
- Create: `README.md`

**Step 1: Create comprehensive README**

Create `README.md`:
```markdown
# Coupe Québec AOE2 - Tournament Platform

A Next.js web application for managing a 20-player Age of Empires 2 tournament.

## Features

- **Player Registration**: Simple form with tournament code protection
- **Tournament Brackets**: Single-elimination bracket display with live updates
- **Admin Dashboard**: Manage players, generate brackets, report match results
- **Bilingual Support**: French and English (basic setup)
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite (better-sqlite3)
- **Styling**: Tailwind CSS
- **Authentication**: Session-based (bcrypt)
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file:
   ```env
   TOURNAMENT_CODE=QUEBEC2025
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=changeme123
   SESSION_SECRET=your-secret-key-change-in-production
   DATABASE_PATH=./tournament.db
   ```

4. Initialize the database:
   ```bash
   npm run init-db
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Usage

### For Players

1. Navigate to `/register`
2. Fill in your details and the tournament code
3. View all registered players at `/players`
4. Check the tournament bracket at `/brackets`

### For Admins

1. Navigate to `/admin`
2. Login with admin credentials
3. Generate bracket when 20 players are registered
4. Report match results from the dashboard

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import repository in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

**Note**: For production, consider using Vercel Postgres instead of SQLite for better persistence.

## Project Structure

```
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── brackets/          # Bracket display
│   ├── players/           # Player gallery
│   └── register/          # Registration form
├── components/            # React components
├── lib/                   # Utilities and core logic
│   ├── db.ts             # Database setup
│   ├── bracket.ts        # Bracket generation
│   ├── auth.ts           # Authentication
│   └── types.ts          # TypeScript types
├── i18n/                 # Internationalization
├── docs/plans/           # Design and implementation docs
└── scripts/              # Utility scripts
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `TOURNAMENT_CODE` | Registration access code | `QUEBEC2025` |
| `ADMIN_USERNAME` | Admin login username | `admin` |
| `ADMIN_PASSWORD` | Admin login password | `changeme123` |
| `SESSION_SECRET` | Session signing secret | Random string |
| `DATABASE_PATH` | SQLite database path | `./tournament.db` |

## License

MIT

## Support

For issues or questions, contact the tournament organizer.
```

**Step 2: Commit**

Run:
```bash
git add README.md
git commit -m "docs: add comprehensive README"
```

---

## Task 14: Final Testing and Deployment Preparation

**Files:**
- Create: `.env.production.example`
- Create: `vercel.json`
- Create: `.gitignore` updates

**Step 1: Create production environment template**

Create `.env.production.example`:
```env
TOURNAMENT_CODE=change-this-code
ADMIN_USERNAME=admin
ADMIN_PASSWORD=use-strong-password-here
SESSION_SECRET=generate-random-secret-at-least-32-chars
DATABASE_PATH=./tournament.db
NODE_ENV=production
```

**Step 2: Create Vercel configuration**

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

**Step 3: Update .gitignore**

Ensure `.gitignore` includes:
```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env.production

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# database
*.db
*.db-journal
*.db-shm
*.db-wal
```

**Step 4: Build and test production build**

Run:
```bash
npm run build
```

Expected: Build completes successfully

Run production server locally:
```bash
npm start
```

Test all pages and functionality.

**Step 5: Commit**

Run:
```bash
git add .env.production.example vercel.json .gitignore
git commit -m "chore: add deployment configuration and production env template"
```

---

## Final Checklist

Before deployment, verify:

- [ ] Database initialization works (`npm run init-db`)
- [ ] Registration form validates and saves players
- [ ] Players page displays all registered players
- [ ] Admin login works with credentials from `.env.local`
- [ ] Admin can generate bracket with 20 players
- [ ] Admin can update match results
- [ ] Bracket page displays matches correctly
- [ ] Winner advancement works through rounds
- [ ] All pages are responsive (test mobile view)
- [ ] Navigation links work correctly
- [ ] Environment variables are set for production
- [ ] Build completes without errors

---

## Deployment Steps

1. Create GitHub repository and push code
2. Create Vercel account and import repository
3. Set environment variables in Vercel dashboard
4. Deploy!
5. Test production deployment
6. Share registration link with friends

---

## Post-Deployment

- Monitor registrations in admin dashboard
- Generate bracket when 20 players registered
- Update match results as tournament progresses
- Celebrate with friends! 🎮🏆
