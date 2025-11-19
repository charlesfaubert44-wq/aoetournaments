import { getPlayersOrderedBySeed, getAllMatches } from '@/lib/supabase';
import AdminDashboard from '@/components/AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const players = await getPlayersOrderedBySeed();
  const matches = await getAllMatches();

  return (
    <main className="container mx-auto px-4 py-8">
      <AdminDashboard initialPlayers={players} initialMatches={matches} />
    </main>
  );
}
