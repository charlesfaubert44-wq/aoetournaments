import { getDatabase } from '@/lib/db';
import { Match, Player } from '@/lib/types';
import BracketView from '@/components/BracketView';

export const dynamic = 'force-dynamic';

export default function BracketsPage() {
  const db = getDatabase();
  const matches = db.prepare('SELECT * FROM matches ORDER BY round ASC, matchNumber ASC').all() as Match[];
  const players = db.prepare('SELECT * FROM players').all() as Player[];

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Tournament Bracket
      </h1>
      <BracketView matches={matches} players={players} />
    </main>
  );
}
