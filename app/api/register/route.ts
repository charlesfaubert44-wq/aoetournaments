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
