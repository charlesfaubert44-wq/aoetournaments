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

    await updateMatchWinner(matchId, winnerId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Match update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update match' },
      { status: 500 }
    );
  }
}
