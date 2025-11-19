import Link from 'next/link';
import { getPlayerCount } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const playerCount = await getPlayerCount();

  return (
    <main className="game-container">
      {/* Hero Section */}
      <section className="py-12 text-center">
        <div className="mb-12">
          <div className="text-6xl mb-6">🏰</div>
          <h1 className="pixel-title text-4xl md:text-5xl mb-6">
            COUPE QUEBEC<br />
            AOE2
          </h1>
          <div className="pixel-text text-xl mb-4 pixel-text-gold">
            ⚔️ NEW YEAR TOURNAMENT 2025 ⚔️
          </div>
        </div>

        {/* Main Info Card */}
        <div className="pixel-card max-w-3xl mx-auto mb-12">
          <div className="space-y-6">
            <div className="pixel-text text-sm leading-relaxed" style={{ color: '#2A1A0A' }}>
              <div className="text-base font-bold mb-4 pixel-text-gold">
                === HEAR YE! HEAR YE! ===
              </div>
              <p className="mb-4">
                EPIC 20-WARRIOR BATTLE AWAITS!<br/>
                SINGLE ELIMINATION TOURNAMENT!<br/>
                PROVE YOUR MIGHT IN AOE2!
              </p>
            </div>

            {/* Player Counter with Pixel HP Bar Style */}
            <div>
              <div className="hp-bar mb-2">
                <div
                  className="hp-bar-fill gold"
                  style={{ width: `${(playerCount / 20) * 100}%` }}
                />
              </div>
              <div className="pixel-text text-base pixel-text-gold">
                [{playerCount}/20] WARRIORS ASSEMBLED
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/register" className="btn-pixel btn-gold">
                ⚔️ JOIN BATTLE
              </Link>
              <Link href="/brackets" className="btn-pixel">
                🏆 BRACKETS
              </Link>
              <Link href="/players" className="btn-pixel btn-stone">
                👥 WARRIORS
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tournament Format Section */}
      <section className="py-12">
        <h2 className="pixel-title text-3xl text-center mb-12 pixel-text-white">
          ⚔️ TOURNAMENT INFO ⚔️
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1 - Stone Style */}
          <div className="stone-card">
            <div className="text-center">
              <div className="text-5xl mb-4">🛡️</div>
              <h3 className="pixel-text text-sm mb-4 pixel-text-white">
                SINGLE<br/>ELIMINATION
              </h3>
              <hr className="pixel-hr" />
              <p className="pixel-text text-xs leading-relaxed pixel-text-white">
                20 WARRIORS<br/>
                TOP 4 GET BYES<br/>
                CLASSIC BRACKET
              </p>
            </div>
          </div>

          {/* Card 2 - Wood Style */}
          <div className="pixel-card">
            <div className="text-center">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="pixel-text text-sm mb-4 pixel-text-gold">
                5 GLORIOUS<br/>ROUNDS
              </h3>
              <hr className="pixel-hr" />
              <p className="pixel-text text-xs leading-relaxed" style={{ color: '#2A1A0A' }}>
                ROUND OF 16<br/>
                TO CHAMPIONSHIP<br/>
                EVERY BATTLE COUNTS!
              </p>
            </div>
          </div>

          {/* Card 3 - Stone Style */}
          <div className="stone-card">
            <div className="text-center">
              <div className="text-5xl mb-4">🎊</div>
              <h3 className="pixel-text text-sm mb-4 pixel-text-white">
                NEW YEAR<br/>CELEBRATION
              </h3>
              <hr className="pixel-hr" />
              <p className="pixel-text text-xs leading-relaxed pixel-text-white">
                FRIENDLY FUN<br/>
                GLORY & HONOR<br/>
                EPIC NOSTALGIA!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 text-center">
        <div className="pixel-card max-w-2xl mx-auto enchanted">
          <h2 className="pixel-title text-3xl mb-6 pixel-text-gold">
            🎯 READY? 🎯
          </h2>
          <p className="pixel-text text-sm mb-8 leading-relaxed" style={{ color: '#2A1A0A' }}>
            THE GATES ARE OPEN!<br/>
            CLAIM YOUR SPOT!<br/>
            FORGE YOUR DESTINY!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register" className="btn-pixel btn-gold text-base">
              ⚔️ REGISTER NOW
            </Link>
            <Link href="/players" className="btn-pixel btn-stone text-base">
              👥 SEE WARRIORS
            </Link>
          </div>
          <div className="mt-8">
            <div className="pixel-text text-xs pixel-text-gold">
              ✨ RING IN THE NEW YEAR WITH EPIC BATTLES! ✨
            </div>
          </div>
        </div>
      </section>

      {/* Pixel Art Decoration */}
      <div className="text-center py-8 opacity-30">
        <div className="pixel-text text-xs">
          ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
        </div>
      </div>
    </main>
  );
}
