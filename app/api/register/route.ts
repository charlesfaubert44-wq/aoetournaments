import { NextRequest, NextResponse } from 'next/server';
import { getPlayerCount, getPlayerByEmail, createPlayer, getAllPlayers } from '@/lib/supabase';
import { validateRegistration, RegistrationData } from '@/lib/validation';
import { fetchPlayerElo } from '@/lib/aoe2insights';

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

    // Check registration limit
    const count = await getPlayerCount();
    if (count >= MAX_PLAYERS) {
      return NextResponse.json(
        { error: 'Tournament is full (20/20 players)' },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const existing = await getPlayerByEmail(data.email);
    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Fetch ELO from AoE2 Insights
    const elo = await fetchPlayerElo(data.steamUsername.trim());

    // Insert player
    const player = await createPlayer(
      data.name.trim(),
      data.email.trim(),
      data.steamUsername.trim(),
      elo
    );

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
    const players = await getAllPlayers();
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
