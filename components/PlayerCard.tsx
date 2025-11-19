import { Player } from '@/lib/types';

interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  const eloPercentage = player.elo ? Math.min((player.elo / 2000) * 100, 100) : 0;

  return (
    <div className="player-pixel">
      <div className="relative z-10">
        {/* Player Name - Pixel Style */}
        <h3 className="pixel-text text-sm mb-4 pixel-text-gold text-center uppercase">
          {player.name.substring(0, 20)}
        </h3>

        {/* ELO Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="pixel-text text-xs" style={{ color: '#2A1A0A' }}>ELO:</span>
            <span className="pixel-text text-xs pixel-text-gold">
              {player.elo !== null ? player.elo : 'N/A'}
            </span>
          </div>
          {player.elo && (
            <div className="hp-bar">
              <div
                className="hp-bar-fill gold"
                style={{ width: `${eloPercentage}%` }}
              />
            </div>
          )}
        </div>

        <hr className="pixel-hr" />

        {/* Player Details */}
        <div className="space-y-2 mt-4">
          <div className="flex justify-between items-center">
            <span className="pixel-text text-xs" style={{ color: '#4A4A4A' }}>STEAM:</span>
            <span className="pixel-text text-xs" style={{ color: '#2A1A0A' }}>
              {player.steam_username.substring(0, 15)}
            </span>
          </div>

          {player.seed && (
            <div className="flex justify-between items-center">
              <span className="pixel-text text-xs" style={{ color: '#4A4A4A' }}>SEED:</span>
              <span className="pixel-text text-xs pixel-text-gold">
                #{player.seed}
              </span>
            </div>
          )}

          <div className="pt-2 text-center">
            <div className="pixel-text text-xs opacity-60" style={{ color: '#4A4A4A' }}>
              ⚔️ {new Date(player.registered_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
