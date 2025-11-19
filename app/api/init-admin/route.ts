import { NextResponse } from 'next/server';
import { getAdminByUsername, createAdminUser } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const username = (process.env.ADMIN_USERNAME || 'admin').trim();
    const password = (process.env.ADMIN_PASSWORD || 'changeme123').trim();
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if admin already exists
    const existingAdmin = await getAdminByUsername(username);

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        username
      });
    }

    // Create admin user
    await createAdminUser(username, passwordHash);

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
