export interface Player {
  id: number;
  name: string;
  email: string;
  aoe2Username: string;
  preferredCiv: string;
  registeredAt: string;
  seed: number | null;
}

export interface Match {
  id: number;
  round: number;
  matchNumber: number;
  player1Id: number | null;
  player2Id: number | null;
  winnerId: number | null;
  completedAt: string | null;
}

export interface AdminUser {
  id: number;
  username: string;
  passwordHash: string;
}

export const AOE2_CIVILIZATIONS = [
  'Aztecs', 'Berbers', 'Britons', 'Bulgarians', 'Burmese',
  'Byzantines', 'Celts', 'Chinese', 'Cumans', 'Ethiopians',
  'Franks', 'Goths', 'Huns', 'Incas', 'Indians',
  'Italians', 'Japanese', 'Khmer', 'Koreans', 'Lithuanians',
  'Magyars', 'Malay', 'Malians', 'Mayans', 'Mongols',
  'Persians', 'Portuguese', 'Saracens', 'Slavs', 'Spanish',
  'Tatars', 'Teutons', 'Turks', 'Vietnamese', 'Vikings'
] as const;

export type Civilization = typeof AOE2_CIVILIZATIONS[number];
