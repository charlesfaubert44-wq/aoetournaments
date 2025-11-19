export interface Player {
  id: number;
  name: string;
  email: string;
  aoe2_username: string;
  preferred_civ: string;
  registered_at: string;
  seed: number | null;
}

export interface Match {
  id: number;
  round: number;
  match_number: number;
  player1_id: number | null;
  player2_id: number | null;
  winner_id: number | null;
  completed_at: string | null;
}

export interface AdminUser {
  id: number;
  username: string;
  password_hash: string;
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
