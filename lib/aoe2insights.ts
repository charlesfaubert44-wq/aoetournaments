/**
 * Fetch player ELO from AoE2 Insights API
 * https://www.aoe2insights.com/
 */

export async function fetchPlayerElo(steamUsername: string): Promise<number | null> {
  try {
    // AoE2 Insights uses aoe2.net API
    // Search for player by name
    const searchUrl = `https://aoe2.net/api/leaderboard?game=aoe2de&leaderboard_id=3&search=${encodeURIComponent(steamUsername)}`;

    const response = await fetch(searchUrl);

    if (!response.ok) {
      console.error('Failed to fetch ELO from AoE2 Insights:', response.statusText);
      return null;
    }

    const data = await response.json();

    // Check if player was found
    if (!data.leaderboard || data.leaderboard.length === 0) {
      console.log(`Player "${steamUsername}" not found in leaderboard`);
      return null;
    }

    // Get the first match (most accurate match)
    const player = data.leaderboard[0];

    // Return the rating (ELO)
    return player.rating || null;
  } catch (error) {
    console.error('Error fetching ELO:', error);
    return null;
  }
}
