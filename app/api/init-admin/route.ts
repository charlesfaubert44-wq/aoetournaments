import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const db = getDatabase();

    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'changeme123';
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if admin already exists
    const existingAdmin = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        username
      });
    }

    // Create admin user
    db.prepare('INSERT INTO admin_users (username, passwordHash) VALUES (?, ?)').run(username, passwordHash);

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      username
    });
  } catch (error: any) {
    console.error('Admin initialization error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to initialize admin user'
      },
      { status: 500 }
    );
  }
}
