const fs = require('fs');
const path = require('path');

const rawNames = [
  "Alt Balaji", "Bharti Jha", "New Sensations", "Cineon", "Ayushi Bhowmik", 
  "Family XXX", "Yessma", "Saathi", "Lil Humpers", "My Friends", 
  "Showtyme", "Rocket Reels", "Moodx", "FynLive", "Naughty America", 
  "Bulbul Play", "Savita Bhabhi", "K Drama", "Primeplay", "Story Max", 
  "Primeshots", "Titalee", "Bigplay", "Alright TV", "Wow Entertainment", 
  "Hidden Cam", "Manoranjan Play", "Manoranjan TV", "Ratri Tempt", "Crime Patrol", 
  "Mirchi OTT", "Poonam Pandey", "South Movies", "Comedy", "Aha", 
  "Bullet", "Waahplay", "Cinezoo", "Uncuttu", "UTP 4K", 
  "Chill", "Rasmalai", "Cinezy", "Chaska", "Tikutu", 
  "Brazzers", "Jinnie Jaaz", "18 Plus", "Altrax", "Mastiplay", 
  "Bulbul OTT", "Mom In Control", "Jokerr", "Rose007", "Sunday TV", 
  "Fukrey", "Boomex (Uncut)", "Hokyo", "Oye Hoye", "Sandykraft", 
  "Voovi", "Latifah", "Pumi", "Gupchup", "Jugnu", 
  "Bigshots", "Dzyreplay", "Jelly", "9RedMovies", "Hungama", 
  "Xoom TV", "Tagalog", "Patakhaxgold", "Sexmex", "Rabbit", 
  "Chaupal Punjab", "Stage", "Free Drama", "Tashan", "Shemaroo", 
  "Mommy's Boy", "MyLF", "Raven Movies", "NMX Series", "Kooku", 
  "Perumom", "Hotshots", "Swappz", "Dorcel Club", "Family Strokes", 
  "Websex Premium", "Deeper", "Kundi", "Kaama", "Hotwife XXX", 
  "Horror", "Woow", "Khiladi 69", "CRF", "Daizo Premium", 
  "Resmi Nair", "Chuski", "Xmasti", "Nuru Massage", "Extras", 
  "Raangoli", "Neonx", "Malvika Tomar", "Xprime", "Uncut Plus", 
  "Uncut 8 OTT", "Binj TV", "Korean Rigi TV", "Korean Webseries", "Rigitu Hindi", 
  "Indian Pink Lips", "Crazy Family", "Next Short", "Gogo Stream", "Foxplay", 
  "Teflix", "Plenna Filmes", "Funtyy", "Mastram", "Mom Teach Sex", 
  "Badmash TV", "Meetx", "Khattaplay", "Mooviplay", "Mastii", 
  "Tango", "Kotha", "Boom Entertainment", "Dreams Films", "Bangbros", 
  "Jauhd", "Cine Prime", "Filthy Kings", "Soltalkies", "Ox9", 
  "Leo", "Tadka Prime", "Big Movie Zoo", "Digimovieplex", "Pervy Family", 
  "Sweet Sinner", "SinFulxxx", "Delphine Films", "Balloons", "Sex Over 50", 
  "Family Pies", "Darling Sema", "Hunt", "Feneo Movies", "Xflame Movies", 
  "Hootzy", "Dramazone", "Jalsa TV", "Fun2sh", "Koyalplay", 
  "Oolala", "Crabflix", "Fliz Movies", "Hot FM", "Mallu Videos", 
  "Full Porn Movie", "Lusty Kajol Bhabhi", "Nextshot", "Luxure", "Private", 
  "Vasna", "Zoya Rathore", "Desi Prime", "Hot Prime", "Peter North", 
  "Dream Picture", "Sona Bhabhi", "Riabhabi", "Shah Ji", "KahaniPlay", 
  "Muskaan Agarwaal", "Bold Ka Adda", "Hotmaster", "Hot Kamasutra", "NF Busty", 
  "Lube Series", "Club XXX", "Cineboot", "Drama Box", "Sex Hub", 
  "Hit Prime", "Iba Movies", "Mastibex", "Viral MMS", "Neha Gupta", 
  "Sarthak Salunkhe", "Queen Hub", "Brandi Love", "Dant Daniels", "Xtramoood", 
  "Le Couple", "Pure Mature", "Porn India Studio", "Moor Malabika", "Aishwarya Agrawal", 
  "My Desi Wife", "Kamini Bhabhi", "Naughty Wife", "Rose Creation", "Hotcum30", 
  "Tonight's Girlfriend", "Saintporn", "Pornstar Legends 4K", "Aayushi Jaiswal", "Xmastinight Movies", 
  "Nude Scenes", "Chikooflix", "Nazar", "Pornechic", "KLIKK", 
  "Fidelity", "Loveherfilms", "Saavan TV", "Oops Family", "1UpMovies", 
  "RioPlus", "MG39", "Yasmina Khan", "Chiku Electricity", "Eightshots", 
  "Namaste Flix", "Mange TV", "Hothit", "Creative Pervert", "Dugru", 
  "Pilt Flix", "Aunt Judys XXX", "Pretty Dirty", "Cobblah Studio", "Janaki", 
  "Africa-XXX", "XXX Lust World", "Inkasex", "Gulab", "Adult Time", 
  "Pyari Gudiya", "Monique Fuentes", "Hunters", "Mintxmovies", "Mrs Entertainer", 
  "Pthu Singh", "Hotty", "Ragin", "Jayesh Gupta", "XY2Z Masti", 
  "Uncut Akku", "Indian Xshot", "Shyna Khatri", "Priya Rey", "Nehal Vadeliya", 
  "Pull App", "Makhan", "Priyanka Chaurasia", "Fugi Mo", "jFlix", 
  "Ridhima Tiwari", "Pure Taboo", "Besharams", "Battameez2", "Ritu Pandey", 
  "Navarasa", "Sigma Series", "Banana Prime", "Bull", "Desiflix", 
  "Jalva", "Triflicks", "Bengali Movies"
];

// Clean and deduplicate while preserving order
const uniqueNames = [];
const seenSlugs = new Set();

const categorize = (name) => {
  const n = name.toLowerCase();
  if (n.includes('korean') || n.includes('k drama') || n.includes('drama box') || n.includes('free drama') || n.includes('dramazone')) return 'Drama';
  if (n.includes('comedy') || n.includes('fukrey') || n.includes('alright')) return 'Comedy';
  if (n.includes('south') || n.includes('aha') || n.includes('chaupal') || n.includes('stage') || n.includes('tashan') || n.includes('bengali') || n.includes('klikk') || n.includes('shemaroo')) return 'Regional';
  if (n.includes('brazzers') || n.includes('naughty america') || n.includes('xxx') || n.includes('porn') || n.includes('sex') || n.includes('bangbros') || n.includes('pure taboo') || n.includes('bhabhi') || n.includes('18 plus') || n.includes('sensations') || n.includes('adult') || n.includes('hot') || n.includes('nude') || n.includes('uncut')) return '18+ Exclusive';
  if (n.includes('alt balaji') || n.includes('hungama') || n.includes('kooku') || n.includes('primeplay') || n.includes('voovi') || n.includes('rabbit') || n.includes('ullu') || n.includes('cine prime')) return 'Indian OTT';
  if (n.includes('tagalog') || n.includes('filmes') || n.includes('gogo') || n.includes('foxplay') || n.includes('africa')) return 'International';
  return 'Web Series';
};

const colors = [
  '#E11D48', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D', // reds
  '#9333EA', '#7C3AED', '#6D28D9', '#5B21B6',             // purples
  '#D97706', '#B45309', '#0D9488', '#0891B2', '#2563EB'  // ambers, teals, blues
];

const channels = [];

for (let i = 0; i < rawNames.length; i++) {
  const name = rawNames[i].trim();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  if (seenSlugs.has(slug)) continue;
  seenSlugs.add(slug);

  const category = categorize(name);
  const color = colors[i % colors.length];
  
  // High quality avatars / gradients
  const subCount = Math.floor(100 + (Math.sin(i) * 0.5 + 0.5) * 2400) + 'K';
  const contentCount = Math.floor(15 + (Math.cos(i) * 0.5 + 0.5) * 85);
  const rating = Number((4.2 + (Math.sin(i * 3) * 0.5 + 0.5) * 0.75).toFixed(1));

  channels.push({
    id: slug,
    name: name,
    slug: slug,
    category: category,
    logo: `https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=200&auto=format&fit=crop&q=60`,
    bannerUrl: `https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80`,
    description: `Official channel for ${name}. Stream high-definition movies, original episodes, and exclusive videos on PROZ MOVIE.`,
    contentCount: contentCount,
    subscribers: subCount,
    rating: rating,
    featured: (i < 15 || name === 'Alt Balaji' || name === 'Aha' || name === 'Chaupal Punjab' || name === 'Shemaroo' || name === 'K Drama'),
    color: color
  });
}

const fileContent = `import { Channel } from '@/types/channel';

export const CHANNELS_DATA: Channel[] = ${JSON.stringify(channels, null, 2)};

export function getAllChannels(): Channel[] {
  return CHANNELS_DATA;
}

export function getChannelById(id: string): Channel | undefined {
  return CHANNELS_DATA.find((c) => c.id === id || c.slug === id);
}

export function getChannelsByCategory(category: string): Channel[] {
  if (category === 'All' || !category) return CHANNELS_DATA;
  if (category === 'Popular') return CHANNELS_DATA.filter((c) => c.featured || (c.rating && c.rating >= 4.7));
  return CHANNELS_DATA.filter((c) => c.category.toLowerCase() === category.toLowerCase());
}

export function searchChannels(query: string, category: string = 'All'): Channel[] {
  let list = CHANNELS_DATA;
  if (category && category !== 'All') {
    list = getChannelsByCategory(category);
  }
  if (!query || !query.trim()) {
    return list;
  }
  const q = query.toLowerCase().trim();
  return list.filter((c) => 
    c.name.toLowerCase().includes(q) || 
    c.category.toLowerCase().includes(q) ||
    c.description.toLowerCase().includes(q)
  );
}
`;

fs.writeFileSync(path.join(__dirname, '../src/lib/data/channelsData.ts'), fileContent, 'utf8');
console.log(`Generated ${channels.length} channels in src/lib/data/channelsData.ts`);
