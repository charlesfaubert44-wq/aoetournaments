import { NextRequest, NextResponse } from 'next/server';
import { generateBracket, assignSeeds } from '@/lib/bracket';

export async function POST(request: NextRequest) {
  try {
    // Assign random seeds
    await assignSeeds();

    // Generate bracket
    const matches = await generateBracket();

    return NextResponse.json({ success: true, matches });
  } catch (error: any) {
    console.error('Bracket generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate bracket' },
      { status: 500 }
    );
  }
}
