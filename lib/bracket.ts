import { getDatabase } from './db';
import { Player, Match } from './types';

export function generateBracket(): Match[] {
  const db = getDatabase();

  // Get all players
  const players = db.prepare('SELECT * FROM players ORDER BY seed ASC, registeredAt ASC').all() as Player[];

  if (players.length !== 20) {
    throw new Error(`Expected 20 players, got ${players.length}`);
  }

  // Clear existing matches
  db.prepare('DELETE FROM matches').run();

  const matches: Match[] = [];

  // Round 1 (Round of 16) - 8 matches
  // Top 4 seeds get byes, so we start with players 5-20 (16 players)
  const round1Players = players.slice(4); // Players with seed 5-20

  for (let i = 0; i < 8; i++) {
    const match = db.prepare(`
      INSERT INTO matches (round, matchNumber, player1Id, player2Id)
      VALUES (1, ?, ?, ?)
    `).run(i + 1, round1Players[i * 2].id, round1Players[i * 2 + 1].id);

    matches.push({
      id: Number(match.lastInsertRowid),
      round: 1,
      matchNumber: i + 1,
      player1Id: round1Players[i * 2].id,
      player2Id: round1Players[i * 2 + 1].id,
      winnerId: null,
      completedAt: null
    });
  }

  // Round 2 (Quarterfinals) - 8 matches
  // First 4 matches: top 4 seeds vs TBD from round 1
  const topSeeds = players.slice(0, 4);
  for (let i = 0; i < 4; i++) {
    const match = db.prepare(`
      INSERT INTO matches (round, matchNumber, player1Id, player2Id)
      VALUES (2, ?, ?, NULL)
    `).run(i + 1, topSeeds[i].id);

    matches.push({
      id: Number(match.lastInsertRowid),
      round: 2,
      matchNumber: i + 1,
      player1Id: topSeeds[i].id,
      player2Id: null,
      winnerId: null,
      completedAt: null
    });
  }

  // Next 4 matches in round 2: TBD vs TBD
  for (let i = 4; i < 8; i++) {
    const match = db.prepare(`
      INSERT INTO matches (round, matchNumber, player1Id, player2Id)
      VALUES (2, ?, NULL, NULL)
    `).run(i + 1);

    matches.push({
      id: Number(match.lastInsertRowid),
      round: 2,
      matchNumber: i + 1,
      player1Id: null,
      player2Id: null,
      winnerId: null,
      completedAt: null
    });
  }

  // Round 3 (Semifinals) - 4 matches
  for (let i = 0; i < 4; i++) {
    const match = db.prepare(`
      INSERT INTO matches (round, matchNumber, player1Id, player2Id)
      VALUES (3, ?, NULL, NULL)
    `).run(i + 1);

    matches.push({
      id: Number(match.lastInsertRowid),
      round: 3,
      matchNumber: i + 1,
      player1Id: null,
      player2Id: null,
      winnerId: null,
      completedAt: null
    });
  }

  // Round 4 (Finals) - 2 matches
  for (let i = 0; i < 2; i++) {
    const match = db.prepare(`
      INSERT INTO matches (round, matchNumber, player1Id, player2Id)
      VALUES (4, ?, NULL, NULL)
    `).run(i + 1);

    matches.push({
      id: Number(match.lastInsertRowid),
      round: 4,
      matchNumber: i + 1,
      player1Id: null,
      player2Id: null,
      winnerId: null,
      completedAt: null
    });
  }

  // Round 5 (Championship) - 1 match
  const finalMatch = db.prepare(`
    INSERT INTO matches (round, matchNumber, player1Id, player2Id)
    VALUES (5, 1, NULL, NULL)
  `).run();

  matches.push({
    id: Number(finalMatch.lastInsertRowid),
    round: 5,
    matchNumber: 1,
    player1Id: null,
    player2Id: null,
    winnerId: null,
    completedAt: null
  });

  return matches;
}

export function assignSeeds() {
  const db = getDatabase();
  const players = db.prepare('SELECT id FROM players ORDER BY registeredAt ASC').all() as { id: number }[];

  // Simple seeding: randomize
  const shuffled = players.sort(() => Math.random() - 0.5);

  shuffled.forEach((player, index) => {
    db.prepare('UPDATE players SET seed = ? WHERE id = ?').run(index + 1, player.id);
  });
}

export function updateMatchWinner(matchId: number, winnerId: number) {
  const db = getDatabase();

  // Update match
  db.prepare(`
    UPDATE matches
    SET winnerId = ?, completedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(winnerId, matchId);

  // Get match details
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(matchId) as Match;

  // Advance winner to next round
  advanceWinner(match, winnerId);
}

function advanceWinner(match: Match, winnerId: number) {
  const db = getDatabase();

  if (match.round === 5) {
    // Championship - no advancement
    return;
  }

  const nextRound = match.round + 1;
  const nextMatchNumber = Math.ceil(match.matchNumber / 2);

  const nextMatch = db.prepare(
    'SELECT * FROM matches WHERE round = ? AND matchNumber = ?'
  ).get(nextRound, nextMatchNumber) as Match;

  if (!nextMatch) {
    return;
  }

  // Determine which slot to fill
  const isPlayer1Slot = match.matchNumber % 2 === 1;

  if (isPlayer1Slot) {
    db.prepare('UPDATE matches SET player1Id = ? WHERE id = ?').run(winnerId, nextMatch.id);
  } else {
    db.prepare('UPDATE matches SET player2Id = ? WHERE id = ?').run(winnerId, nextMatch.id);
  }
}
