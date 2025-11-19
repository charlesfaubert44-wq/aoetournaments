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
