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
