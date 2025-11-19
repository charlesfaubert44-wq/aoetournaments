export interface Player {
  id: number;
  name: string;
  email: string;
  steam_username: string;
  elo: number | null;
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
