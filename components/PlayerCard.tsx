import { Player } from '@/lib/types';

interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  return (
    <div className="player-card">
      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-3 medieval-title text-shadow">{player.name}</h3>
        <div className="space-y-2 text-sm" style={{ color: '#432818' }}>
          <div className="flex justify-between items-center border-b border-bronze pb-2" style={{ borderColor: '#99582A40' }}>
            <span className="font-semibold" style={{ color: '#6F1D1B' }}>Steam Username:</span>
            <span className="font-medium">{player.steam_username}</span>
          </div>
          <div className="flex justify-between items-center border-b border-bronze pb-2" style={{ borderColor: '#99582A40' }}>
            <span className="font-semibold" style={{ color: '#6F1D1B' }}>ELO Rating:</span>
            <span className="font-bold text-lg" style={{ color: '#BB9457' }}>
              {player.elo !== null ? player.elo : 'N/A'}
            </span>
          </div>
          {player.seed && (
            <div className="flex justify-between items-center border-b border-bronze pb-2" style={{ borderColor: '#99582A40' }}>
              <span className="font-semibold" style={{ color: '#6F1D1B' }}>Seed:</span>
              <span className="font-bold">#{player.seed}</span>
            </div>
          )}
          <p className="text-xs pt-2 opacity-70">
            ⚔️ Registered: {new Date(player.registered_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
