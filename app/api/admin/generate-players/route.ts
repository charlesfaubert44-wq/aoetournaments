import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const demoPlayers = [
  { name: "Jean Tremblay", email: "jean.tremblay@example.com", steam_username: "JeanTheConqueror", elo: 1250 },
  { name: "Marie Dubois", email: "marie.dubois@example.com", steam_username: "MarieLaReine", elo: 1180 },
  { name: "Pierre Gagnon", email: "pierre.gagnon@example.com", steam_username: "PierreTheStrong", elo: 1320 },
  { name: "Sophie Lavoie", email: "sophie.lavoie@example.com", steam_username: "SophieArcher", elo: 1145 },
  { name: "Luc Bergeron", email: "luc.bergeron@example.com", steam_username: "LucTheViking", elo: 1410 },
  { name: "Isabelle Roy", email: "isabelle.roy@example.com", steam_username: "IsabelleSamurai", elo: 1275 },
  { name: "Marc Côté", email: "marc.cote@example.com", steam_username: "MarcTheKnight", elo: 1195 },
  { name: "Julie Bouchard", email: "julie.bouchard@example.com", steam_username: "JulieWarrior", elo: 1380 },
  { name: "André Morin", email: "andre.morin@example.com", steam_username: "AndreTheMongol", elo: 1225 },
  { name: "Nathalie Fortin", email: "nathalie.fortin@example.com", steam_username: "NathalieEagle", elo: 1305 },
  { name: "François Lévesque", email: "francois.levesque@example.com", steam_username: "FrancoisKhan", elo: 1165 },
  { name: "Catherine Simard", email: "catherine.simard@example.com", steam_username: "CathTheEmpress", elo: 1450 },
  { name: "Daniel Lefebvre", email: "daniel.lefebvre@example.com", steam_username: "DanielCrusader", elo: 1290 },
  { name: "Sylvie Pelletier", email: "sylvie.pelletier@example.com", steam_username: "SylvieSpear", elo: 1210 },
  { name: "Robert Gagné", email: "robert.gagne@example.com", steam_username: "RobertTheBrave", elo: 1340 },
  { name: "Chantal Bélanger", email: "chantal.belanger@example.com", steam_username: "ChantalArcher", elo: 1155 },
  { name: "Martin Girard", email: "martin.girard@example.com", steam_username: "MartinWarlord", elo: 1425 },
  { name: "Louise Nadeau", email: "louise.nadeau@example.com", steam_username: "LouiseTheSwift", elo: 1235 },
  { name: "Patrick Beaulieu", email: "patrick.beaulieu@example.com", steam_username: "PatrickChampion", elo: 1365 },
  { name: "Diane Paquette", email: "diane.paquette@example.com", steam_username: "DianeTheGreat", elo: 1260 }
];

export async function POST() {
  try {
    // Delete all existing matches
    await supabase
      .from('matches')
      .delete()
      .neq('id', 0);

    // Delete all existing players
    await supabase
      .from('players')
      .delete()
      .neq('id', 0);

    // Insert all demo players
    const { data, error } = await supabase
      .from('players')
      .insert(demoPlayers)
      .select();

    if (error) {
      console.error('Error creating players:', error);
      return NextResponse.json(
        { error: 'Failed to create players', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Created ${data.length} demo players`,
      players: data
    });
  } catch (error: any) {
    console.error('Generate players error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
