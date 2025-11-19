import { getAllMatches, getAllPlayers } from '@/lib/supabase';
import BracketView from '@/components/BracketView';

export const dynamic = 'force-dynamic';

export default async function BracketsPage() {
  const matches = await getAllMatches();
  const players = await getAllPlayers();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Tournament Bracket
      </h1>
      <BracketView matches={matches} players={players} />
    </main>
  );
}
