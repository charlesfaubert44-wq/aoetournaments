'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Player, Match } from '@/lib/types';

interface AdminDashboardProps {
  initialPlayers: Player[];
  initialMatches: Match[];
}

export default function AdminDashboard({ initialPlayers, initialMatches }: AdminDashboardProps) {
  const [players, setPlayers] = useState(initialPlayers);
  const [matches, setMatches] = useState(initialMatches);
  const [generating, setGenerating] = useState(false);
  const [tournamentCode, setTournamentCode] = useState(process.env.NEXT_PUBLIC_TOURNAMENT_CODE || 'COUPE_QUEBEC_2025');
  const [showCode, setShowCode] = useState(false);
  const router = useRouter();

  const handleGenerateBracket = async () => {
    if (!confirm('Generate tournament bracket? This will reset any existing bracket.')) {
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/admin/bracket', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to generate bracket');
      }

      router.refresh();
      alert('Bracket generated successfully!');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
    router.refresh();
  };

  const handleUpdateWinner = async (matchId: number, winnerId: number) => {
    try {
      const response = await fetch('/api/admin/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, winnerId })
      });

      if (!response.ok) {
        throw new Error('Failed to update match');
      }

      router.refresh();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getPlayerName = (playerId: number | null) => {
    if (!playerId) return 'TBD';
    const player = players.find(p => p.id === playerId);
    return player ? `${player.name} (${player.steam_username})` : 'Unknown';
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Logout
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Tournament Status</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600">{players.length}</div>
            <div className="text-gray-600">Registered Players</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">{matches.length}</div>
            <div className="text-gray-600">Total Matches</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600">
              {matches.filter(m => m.winner_id).length}
            </div>
            <div className="text-gray-600">Completed Matches</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Tournament Registration Code</h2>
        <p className="text-gray-600 mb-4">Share this code with players to allow them to register</p>
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <input
              type={showCode ? "text" : "password"}
              value={tournamentCode}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-lg"
            />
          </div>
          <button
            onClick={() => setShowCode(!showCode)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            {showCode ? 'Hide' : 'Show'}
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(tournamentCode);
              alert('Tournament code copied to clipboard!');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Copy
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Bracket Management</h2>
        <button
          onClick={handleGenerateBracket}
          disabled={generating || players.length !== 20}
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {generating ? 'Generating...' : 'Generate Bracket'}
        </button>
        {players.length !== 20 && (
          <p className="mt-2 text-sm text-red-600">Need exactly 20 players to generate bracket</p>
        )}
      </div>

      {matches.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Match Results</h2>
          <div className="space-y-4">
            {matches.map((match) => (
              <div key={match.id} className="border border-gray-200 rounded p-4">
                <div className="font-medium mb-2">
                  Round {match.round}, Match {match.match_number}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div>{getPlayerName(match.player1_id)}</div>
                    <div className="text-gray-500">vs</div>
                    <div>{getPlayerName(match.player2_id)}</div>
                  </div>
                  {match.player1_id && match.player2_id && !match.winner_id && (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleUpdateWinner(match.id, match.player1_id!)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Player 1 Wins
                      </button>
                      <button
                        onClick={() => handleUpdateWinner(match.id, match.player2_id!)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Player 2 Wins
                      </button>
                    </div>
                  )}
                  {match.winner_id && (
                    <div className="text-green-600 font-medium">
                      Winner: {getPlayerName(match.winner_id)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Registered Players</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Steam Username</th>
                <th className="text-left p-2">ELO</th>
                <th className="text-left p-2">Seed</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.id} className="border-b">
                  <td className="p-2">{player.name}</td>
                  <td className="p-2">{player.email}</td>
                  <td className="p-2">{player.steam_username}</td>
                  <td className="p-2">{player.elo !== null ? player.elo : 'N/A'}</td>
                  <td className="p-2">{player.seed || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
