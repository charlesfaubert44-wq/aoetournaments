import Link from 'next/link';
import { getPlayerCount } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const playerCount = await getPlayerCount();

  return (
    <main className="container mx-auto px-4 relative z-10">
      <section className="py-20 text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">🏰</div>
          <h1 className="text-7xl font-bold mb-6 medieval-title drop-shadow-lg">
            Coupe Québec AOE2
          </h1>
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-4xl">⚔️</span>
            <p className="text-3xl font-semibold" style={{ color: '#FFE6A7', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
              New Year&apos;s Tournament 2025
            </p>
            <span className="text-4xl">⚔️</span>
          </div>
        </div>

        <div className="parchment-card max-w-3xl mx-auto mb-12 p-8">
          <p className="text-xl mb-6 leading-relaxed" style={{ color: '#432818' }}>
            <span className="text-2xl font-bold block mb-4" style={{ color: '#6F1D1B' }}>
              📯 Hear Ye, Hear Ye! 📯
            </span>
            Join us for an <span className="font-bold" style={{ color: '#6F1D1B' }}>epic 20-player</span> single-elimination tournament!
            Reunite with old friends and compete for glory in the ultimate
            Age of Empires 2 showdown as we ring in the New Year!
          </p>

          <div className="text-2xl font-bold mb-6" style={{ color: '#BB9457' }}>
            <span className="text-5xl">{playerCount}</span>
            <span className="mx-2">/</span>
            <span className="text-3xl">20</span>
            <div className="text-lg mt-2" style={{ color: '#6F1D1B' }}>Warriors Assembled</div>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register" className="btn-medieval hover-lift">
              ⚔️ Join the Battle
            </Link>
            <Link href="/brackets" className="btn-burgundy hover-lift">
              🏆 View Brackets
            </Link>
            <Link href="/players" className="btn-medieval hover-lift">
              👥 See Warriors
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 -mx-4 px-4" style={{ background: 'rgba(67, 40, 24, 0.3)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 medieval-title">
            ⚔️ Tournament Format ⚔️
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="parchment-card p-6 hover-lift">
              <div className="text-4xl mb-3">🛡️</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#6F1D1B' }}>Single Elimination</h3>
              <p style={{ color: '#432818' }}>
                Classic bracket format with 20 warriors. Top 4 champions receive first-round byes.
              </p>
            </div>
            <div className="parchment-card p-6 hover-lift">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#6F1D1B' }}>5 Glorious Rounds</h3>
              <p style={{ color: '#432818' }}>
                From Round of 16 to the Grand Championship. Every battle shapes destiny!
              </p>
            </div>
            <div className="parchment-card p-6 hover-lift">
              <div className="text-4xl mb-3">🎊</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#6F1D1B' }}>New Year Celebration</h3>
              <p style={{ color: '#432818' }}>
                Friendly competition among comrades. Focus on fun, glory, and nostalgia!
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 text-center">
        <div className="parchment-card max-w-2xl mx-auto p-10">
          <h2 className="text-4xl font-bold mb-6 medieval-title">
            🎯 Ready for Battle? 🎯
          </h2>
          <p className="text-xl mb-8" style={{ color: '#432818' }}>
            The gates are open! Claim your spot in this legendary tournament
            and forge your path to victory!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register" className="btn-medieval hover-lift text-xl">
              ⚔️ Register Now
            </Link>
            <Link href="/players" className="btn-burgundy hover-lift text-xl">
              👥 View Warriors
            </Link>
          </div>
          <p className="mt-8 text-sm opacity-70" style={{ color: '#6F1D1B' }}>
            ✨ Ring in the New Year with epic battles! ✨
          </p>
        </div>
      </section>
    </main>
  );
}
