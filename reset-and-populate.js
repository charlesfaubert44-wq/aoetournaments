const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uqjufpvozacbawmptzkk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxanVmcHZvemFjYmF3bXB0emtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MjQ0MTYsImV4cCI6MjA3OTEwMDQxNn0.OG6nJjI-0F2vQm1zW6ijyqJlCHELlP5rSsFwkeVf2c8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Quebec-themed demo players with realistic Steam usernames and ELOs
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

async function resetAndPopulate() {
  console.log('🗑️  Clearing existing data...\n');

  // Delete all matches
  const { error: matchError } = await supabase
    .from('matches')
    .delete()
    .neq('id', 0);

  if (matchError && matchError.code !== 'PGRST116') {
    console.error('Error deleting matches:', matchError);
  } else {
    console.log('✓ Matches cleared');
  }

  // Delete all players
  const { error: playerError } = await supabase
    .from('players')
    .delete()
    .neq('id', 0);

  if (playerError && playerError.code !== 'PGRST116') {
    console.error('Error deleting players:', playerError);
  } else {
    console.log('✓ Players cleared');
  }

  console.log('\n🎮 Creating 20 demo players...\n');

  // Insert all players
  const { data, error } = await supabase
    .from('players')
    .insert(demoPlayers)
    .select();

  if (error) {
    console.error('Error creating players:', error);
    return;
  }

  console.log(`✓ Created ${data.length} players\n`);

  // Display players sorted by ELO
  const sorted = [...data].sort((a, b) => (b.elo || 0) - (a.elo || 0));
  sorted.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name.padEnd(20)} | ${p.steam_username.padEnd(20)} | ELO: ${p.elo}`);
  });

  console.log('\n✅ Database reset complete!');
  console.log('\n📊 Next step: Generate bracket via admin dashboard');
}

resetAndPopulate();
