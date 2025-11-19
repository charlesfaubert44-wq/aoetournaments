'use client';

import { useState } from 'react';
import { AOE2_CIVILIZATIONS } from '@/lib/types';

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    aoe2Username: '',
    preferredCiv: '',
    tournamentCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
        <h2 className="text-2xl font-bold text-green-800 mb-2">Registration Successful!</h2>
        <p className="text-green-700">You&apos;re registered for Coupe Québec AOE2!</p>
        <a href="/players" className="mt-4 inline-block text-blue-600 hover:underline">
          View All Players →
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8 space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="aoe2Username" className="block text-sm font-medium mb-1">
          AoE2 Username
        </label>
        <input
          id="aoe2Username"
          type="text"
          required
          value={formData.aoe2Username}
          onChange={(e) => setFormData({ ...formData, aoe2Username: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="preferredCiv" className="block text-sm font-medium mb-1">
          Preferred Civilization
        </label>
        <select
          id="preferredCiv"
          required
          value={formData.preferredCiv}
          onChange={(e) => setFormData({ ...formData, preferredCiv: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Select a civilization...</option>
          {AOE2_CIVILIZATIONS.map((civ) => (
            <option key={civ} value={civ}>
              {civ}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="tournamentCode" className="block text-sm font-medium mb-1">
          Tournament Code
        </label>
        <input
          id="tournamentCode"
          type="password"
          required
          value={formData.tournamentCode}
          onChange={(e) => setFormData({ ...formData, tournamentCode: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
