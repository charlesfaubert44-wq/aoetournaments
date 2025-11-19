import {
  getPlayersOrderedBySeed,
  deleteAllMatches,
  createMatch,
  getAllPlayers,
  updatePlayerSeed,
  getMatchById,
  updateMatchWinner as supabaseUpdateMatchWinner,
  updateMatchPlayer,
  getMatchByRoundAndNumber
} from './supabase';
import { Player, Match } from './types';

export async function generateBracket(): Promise<Match[]> {
  // Get all players
  const players = await getPlayersOrderedBySeed();

  if (players.length !== 20) {
    throw new Error(`Expected 20 players, got ${players.length}`);
  }

  // Clear existing matches
  await deleteAllMatches();

  const matches: Match[] = [];

  // Round 1 (Round of 16) - 8 matches
  // Top 4 seeds get byes, so we start with players 5-20 (16 players)
  const round1Players = players.slice(4); // Players with seed 5-20

  for (let i = 0; i < 8; i++) {
    const match = await createMatch(
      1,
      i + 1,
      round1Players[i * 2].id,
      round1Players[i * 2 + 1].id
    );
    matches.push(match);
  }

  // Round 2 (Quarterfinals) - 8 matches
  // First 4 matches: top 4 seeds vs TBD from round 1
  const topSeeds = players.slice(0, 4);
  for (let i = 0; i < 4; i++) {
    const match = await createMatch(2, i + 1, topSeeds[i].id, null);
    matches.push(match);
  }

  // Next 4 matches in round 2: TBD vs TBD
  for (let i = 4; i < 8; i++) {
    const match = await createMatch(2, i + 1, null, null);
    matches.push(match);
  }

  // Round 3 (Semifinals) - 4 matches
  for (let i = 0; i < 4; i++) {
    const match = await createMatch(3, i + 1, null, null);
    matches.push(match);
  }

  // Round 4 (Finals) - 2 matches
  for (let i = 0; i < 2; i++) {
    const match = await createMatch(4, i + 1, null, null);
    matches.push(match);
  }

  // Round 5 (Championship) - 1 match
  const finalMatch = await createMatch(5, 1, null, null);
  matches.push(finalMatch);

  return matches;
}

export async function assignSeeds() {
  const players = await getAllPlayers();

  // Simple seeding: randomize
  const shuffled = players.sort(() => Math.random() - 0.5);

  for (let i = 0; i < shuffled.length; i++) {
    await updatePlayerSeed(shuffled[i].id, i + 1);
  }
}

export async function updateMatchWinner(matchId: number, winnerId: number) {
  // Update match
  await supabaseUpdateMatchWinner(matchId, winnerId);

  // Get match details
  const match = await getMatchById(matchId);
  if (!match) return;

  // Advance winner to next round
  await advanceWinner(match, winnerId);
}

async function advanceWinner(match: Match, winnerId: number) {
  if (match.round === 5) {
    // Championship - no advancement
    return;
  }

  const nextRound = match.round + 1;
  const nextMatchNumber = Math.ceil(match.match_number / 2);

  const nextMatch = await getMatchByRoundAndNumber(nextRound, nextMatchNumber);

  if (!nextMatch) {
    return;
  }

  // Determine which slot to fill
  const isPlayer1Slot = match.match_number % 2 === 1;

  await updateMatchPlayer(nextMatch.id, isPlayer1Slot ? 1 : 2, winnerId);
}
