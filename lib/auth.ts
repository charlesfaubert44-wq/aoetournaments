import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { getAdminByUsername } from './supabase';

const SESSION_COOKIE = 'admin_session';

export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  const admin = await getAdminByUsername(username);

  if (!admin) {
    return false;
  }

  return await bcrypt.compare(password, admin.password_hash);
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
