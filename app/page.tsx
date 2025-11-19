import Link from 'next/link';
import { getDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const db = getDatabase();
  const playerCount = db.prepare('SELECT COUNT(*) as count FROM players').get() as { count: number };

  return (
    <main className="container mx-auto px-4">
      <section className="py-20 text-center">
        <h1 className="text-6xl font-bold mb-4 text-gray-900">
          Coupe Québec AOE2
        </h1>
        <p className="text-2xl text-gray-600 mb-8">
          Age of Empires 2 Tournament
        </p>
        <p className="text-lg text-gray-700 mb-12 max-w-2xl mx-auto">
          Join us for an epic 20-player single-elimination tournament!
          Reunite with old friends and compete for glory in the ultimate
          Age of Empires 2 showdown.
        </p>

        <div className="flex gap-4 justify-center mb-12">
          <Link
            href="/register"
            className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700"
          >
            Register Now
          </Link>
          <Link
            href="/brackets"
            className="px-8 py-4 bg-gray-600 text-white text-lg font-semibold rounded-lg hover:bg-gray-700"
          >
            View Brackets
          </Link>
        </div>

        <div className="text-xl font-semibold">
          <span className="text-blue-600">{playerCount.count}</span> / 20 Players Registered
        </div>
      </section>

      <section className="py-12 bg-gray-50 -mx-4 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Tournament Format</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Single Elimination</h3>
              <p className="text-gray-600">
                Classic bracket format with 20 players. Top 4 seeds receive first-round byes.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">5 Rounds</h3>
              <p className="text-gray-600">
                From Round of 16 to Championship. Every match counts!
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Friendly Competition</h3>
              <p className="text-gray-600">
                Casual tournament for friends. Focus on fun and nostalgia!
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Play?</h2>
        <p className="text-gray-600 mb-6">
          Registration is open! Secure your spot in the tournament.
        </p>
        <Link
          href="/register"
          className="inline-block px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700"
        >
          Register for Coupe Québec AOE2
        </Link>
      </section>
    </main>
  );
}
