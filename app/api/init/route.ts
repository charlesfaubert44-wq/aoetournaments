import { NextResponse } from 'next/server';
import { initDatabase, getDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Initialize database tables
    initDatabase();

    // Verify tables exist
    const db = getDatabase();
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      tables: tables.map((t: any) => t.name)
    });
  } catch (error: any) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to initialize database'
      },
      { status: 500 }
    );
  }
}
