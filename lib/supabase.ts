import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing Supabase environment variables');
  }
  console.warn('⚠️ Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Database helper functions
export async function initDatabase() {
  console.log('Supabase database tables are managed via SQL Editor or migrations');
  // Tables will be created via Supabase dashboard
}

export async function getPlayerCount(): Promise<number> {
  const { count } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true });
  return count || 0;
}

export async function getPlayerByEmail(email: string) {
  const { data } = await supabase
    .from('players')
    .select('*')
    .eq('email', email)
    .single();
  return data;
}

export async function createPlayer(
  name: string,
  email: string,
  aoe2Username: string,
  preferredCiv: string
) {
  const { data, error } = await supabase
    .from('players')
    .insert({
      name,
      email,
      aoe2_username: aoe2Username,
      preferred_civ: preferredCiv,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAllPlayers() {
  const { data } = await supabase
    .from('players')
    .select('*')
    .order('registered_at', { ascending: true });
  return data || [];
}

export async function getPlayersOrderedBySeed() {
  const { data } = await supabase
    .from('players')
    .select('*')
    .order('seed', { ascending: true, nullsFirst: false })
    .order('registered_at', { ascending: true });
  return data || [];
}

export async function updatePlayerSeed(playerId: number, seed: number) {
  await supabase
    .from('players')
    .update({ seed })
    .eq('id', playerId);
}

export async function deleteAllMatches() {
  await supabase.from('matches').delete().neq('id', 0);
}

export async function createMatch(
  round: number,
  matchNumber: number,
  player1Id: number | null,
  player2Id: number | null
) {
  const { data, error } = await supabase
    .from('matches')
    .insert({
      round,
      match_number: matchNumber,
      player1_id: player1Id,
      player2_id: player2Id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAllMatches() {
  const { data } = await supabase
    .from('matches')
    .select('*')
    .order('round', { ascending: true })
    .order('match_number', { ascending: true });
  return data || [];
}

export async function getMatchById(matchId: number) {
  const { data } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single();
  return data;
}

export async function getMatchByRoundAndNumber(round: number, matchNumber: number) {
  const { data } = await supabase
    .from('matches')
    .select('*')
    .eq('round', round)
    .eq('match_number', matchNumber)
    .single();
  return data;
}

export async function updateMatchWinner(matchId: number, winnerId: number) {
  await supabase
    .from('matches')
    .update({
      winner_id: winnerId,
      completed_at: new Date().toISOString(),
    })
    .eq('id', matchId);
}

export async function updateMatchPlayer(
  matchId: number,
  playerSlot: 1 | 2,
  playerId: number
) {
  const field = playerSlot === 1 ? 'player1_id' : 'player2_id';
  await supabase
    .from('matches')
    .update({ [field]: playerId })
    .eq('id', matchId);
}

export async function getAdminByUsername(username: string) {
  const { data } = await supabase
    .from('admin_users')
    .select('*')
    .eq('username', username)
    .single();
  return data;
}

export async function createAdminUser(username: string, passwordHash: string) {
  const { data, error } = await supabase
    .from('admin_users')
    .insert({
      username,
      password_hash: passwordHash,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
