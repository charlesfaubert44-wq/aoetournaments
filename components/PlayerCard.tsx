import { Player } from '@/lib/types';

interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold mb-2">{player.name}</h3>
      <div className="space-y-1 text-sm text-gray-600">
        <p><span className="font-medium">AoE2:</span> {player.aoe2Username}</p>
        <p><span className="font-medium">Civilization:</span> {player.preferredCiv}</p>
        <p className="text-xs text-gray-400">
          Registered: {new Date(player.registeredAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
