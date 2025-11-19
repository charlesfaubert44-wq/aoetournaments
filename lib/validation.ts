export interface RegistrationData {
  name: string;
  email: string;
  steamUsername: string;
  tournamentCode: string;
}

export function validateRegistration(data: RegistrationData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!data.email || !data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push('Valid email is required');
  }

  if (!data.steamUsername || data.steamUsername.trim().length < 2) {
    errors.push('Steam AoE2 username must be at least 2 characters');
  }

  if (!data.tournamentCode) {
    errors.push('Tournament code is required');
  }

  return { valid: errors.length === 0, errors };
}
