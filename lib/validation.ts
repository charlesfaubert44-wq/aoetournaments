import { AOE2_CIVILIZATIONS } from './types';

export interface RegistrationData {
  name: string;
  email: string;
  aoe2Username: string;
  preferredCiv: string;
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

  if (!data.aoe2Username || data.aoe2Username.trim().length < 2) {
    errors.push('AoE2 username must be at least 2 characters');
  }

  if (!data.preferredCiv || !AOE2_CIVILIZATIONS.includes(data.preferredCiv as any)) {
    errors.push('Valid civilization is required');
  }

  if (!data.tournamentCode) {
    errors.push('Tournament code is required');
  }

  return { valid: errors.length === 0, errors };
}
