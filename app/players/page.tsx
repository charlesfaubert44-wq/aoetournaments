import { getDatabase } from '@/lib/db';
import { Player } from '@/lib/types';
import PlayerCard from '@/components/PlayerCard';

export const dynamic = 'force-dynamic';

export default function PlayersPage() {
  const db = getDatabase();
  const players = db.prepare('SELECT * FROM players ORDER BY registeredAt ASC').all() as Player[];

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-4">
        Registered Players
      </h1>
      <p className="text-center text-gray-600 mb-8">
        {players.length} / 20 players registered
      </p>

      {players.length === 0 ? (
        <p className="text-center text-gray-500">No players registered yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}
    </main>
  );
}
