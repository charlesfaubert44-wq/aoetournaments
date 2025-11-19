'use client';

import { Match, Player } from '@/lib/types';

interface BracketViewProps {
  matches: Match[];
  players: Player[];
}

export default function BracketView({ matches, players }: BracketViewProps) {
  const getPlayerName = (playerId: number | null) => {
    if (!playerId) return 'TBD';
    const player = players.find(p => p.id === playerId);
    return player ? player.aoe2Username : 'Unknown';
  };

  const getRoundName = (round: number) => {
    switch (round) {
      case 1: return 'Round of 16';
      case 2: return 'Quarterfinals';
      case 3: return 'Semifinals';
      case 4: return 'Finals';
      case 5: return 'Championship';
      default: return `Round ${round}`;
    }
  };

  const groupedMatches = matches.reduce((acc, match) => {
    if (!acc[match.round]) acc[match.round] = [];
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Bracket has not been generated yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedMatches).map(([round, roundMatches]) => (
        <div key={round}>
          <h2 className="text-2xl font-bold mb-4">{getRoundName(Number(round))}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roundMatches.map((match) => (
              <div key={match.id} className="border border-gray-300 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-2">Match {match.matchNumber}</div>
                <div className="space-y-2">
                  <div className={`p-2 rounded ${match.winnerId === match.player1Id ? 'bg-green-100 font-bold' : 'bg-gray-50'}`}>
                    {getPlayerName(match.player1Id)}
                  </div>
                  <div className="text-center text-gray-400">vs</div>
                  <div className={`p-2 rounded ${match.winnerId === match.player2Id ? 'bg-green-100 font-bold' : 'bg-gray-50'}`}>
                    {getPlayerName(match.player2Id)}
                  </div>
                </div>
                {match.winnerId && (
                  <div className="mt-2 text-sm text-green-600 font-medium">
                    Winner: {getPlayerName(match.winnerId)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
