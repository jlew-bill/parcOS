/**
 * Sports Data Service
 * Fetches and parses sports data from ESPN API with mock fallback
 */

export interface GameScore {
  team: string;
  score: number;
  logo?: string;
}

export interface GameCard {
  id: string;
  league: 'NFL' | 'NBA' | 'NCAAF';
  homeTeam: GameScore;
  awayTeam: GameScore;
  status: 'scheduled' | 'live' | 'final';
  time: string;
  venue?: string;
  quarter?: number;
  momentum?: {
    team: string;
    direction: 'up' | 'down' | 'stable';
    score: number;
  };
  prediction?: {
    winner: string;
    confidence: number;
  };
  narrative?: string;
}

// Mock data for fallback
const MOCK_GAMES: GameCard[] = [
  {
    id: 'game-nfl-001',
    league: 'NFL',
    homeTeam: { team: 'Kansas City Chiefs', score: 24, logo: '🔴' },
    awayTeam: { team: 'Buffalo Bills', score: 21, logo: '🔵' },
    status: 'live',
    time: 'Q4 2:34',
    venue: 'Arrowhead Stadium',
    quarter: 4,
    momentum: { team: 'Kansas City Chiefs', direction: 'up', score: 14 },
    prediction: { winner: 'Kansas City Chiefs', confidence: 0.72 }
  },
  {
    id: 'game-nba-001',
    league: 'NBA',
    homeTeam: { team: 'Los Angeles Lakers', score: 102, logo: '🟣' },
    awayTeam: { team: 'Golden State Warriors', score: 99, logo: '🟡' },
    status: 'live',
    time: 'Q4 3:15',
    venue: 'Crypto.com Arena',
    quarter: 4,
    momentum: { team: 'Los Angeles Lakers', direction: 'stable', score: 8 },
    prediction: { winner: 'Los Angeles Lakers', confidence: 0.58 }
  },
  {
    id: 'game-ncaaf-001',
    league: 'NCAAF',
    homeTeam: { team: 'Ohio State', score: 28, logo: '🔴' },
    awayTeam: { team: 'Michigan', score: 17, logo: '🔵' },
    status: 'live',
    time: 'Q3 1:22',
    venue: 'Ohio Stadium',
    quarter: 3,
    momentum: { team: 'Ohio State', direction: 'up', score: 21 },
    prediction: { winner: 'Ohio State', confidence: 0.85 }
  },
  {
    id: 'game-nfl-002',
    league: 'NFL',
    homeTeam: { team: 'Dallas Cowboys', score: 0, logo: '⭐' },
    awayTeam: { team: 'Philadelphia Eagles', score: 0, logo: '🦅' },
    status: 'scheduled',
    time: '8:20 PM ET',
    venue: 'AT&T Stadium'
  },
  {
    id: 'game-nba-002',
    league: 'NBA',
    homeTeam: { team: 'Boston Celtics', score: 0, logo: '🍀' },
    awayTeam: { team: 'Miami Heat', score: 0, logo: '🔥' },
    status: 'scheduled',
    time: '7:30 PM ET',
    venue: 'TD Garden'
  }
];

/**
 * Fetch games from ESPN API (with fallback)
 */
export async function fetchNFLScoreboard(): Promise<GameCard[]> {
  try {
    const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard', {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) throw new Error('API failed');
    
    const data = await response.json();
    return parseESPNScoreboard(data, 'NFL');
  } catch (error) {
    console.warn('[Sports Data] NFL API failed, using mock data:', error);
    return MOCK_GAMES.filter(g => g.league === 'NFL');
  }
}

export async function fetchNBAScoreboard(): Promise<GameCard[]> {
  try {
    const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard', {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) throw new Error('API failed');
    
    const data = await response.json();
    return parseESPNScoreboard(data, 'NBA');
  } catch (error) {
    console.warn('[Sports Data] NBA API failed, using mock data:', error);
    return MOCK_GAMES.filter(g => g.league === 'NBA');
  }
}

export async function fetchNCAAFScoreboard(): Promise<GameCard[]> {
  try {
    const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard', {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) throw new Error('API failed');
    
    const data = await response.json();
    return parseESPNScoreboard(data, 'NCAAF');
  } catch (error) {
    console.warn('[Sports Data] NCAAF API failed, using mock data:', error);
    return MOCK_GAMES.filter(g => g.league === 'NCAAF');
  }
}

/**
 * Parse ESPN API response into GameCard format
 */
function parseESPNScoreboard(data: any, league: 'NFL' | 'NBA' | 'NCAAF'): GameCard[] {
  if (!data.events || !Array.isArray(data.events)) {
    console.warn('[Sports Data] Invalid ESPN response structure');
    return [];
  }

  return data.events.map((event: any, idx: number) => {
    const competitors = event.competitions[0]?.competitors || [];
    const [away, home] = competitors;

    return {
      id: `${league}-${idx}`,
      league,
      homeTeam: {
        team: home?.team?.displayName || 'Team',
        score: parseInt(home?.score) || 0,
        logo: home?.team?.logo
      },
      awayTeam: {
        team: away?.team?.displayName || 'Team',
        score: parseInt(away?.score) || 0,
        logo: away?.team?.logo
      },
      status: mapEventStatus(event.status?.type),
      time: event.status?.displayClock || event.competitions[0]?.startDate || 'TBD',
      venue: event.competitions[0]?.venue?.fullName,
      quarter: extractQuarter(event.status?.displayClock)
    };
  });
}

function mapEventStatus(statusType?: string): 'scheduled' | 'live' | 'final' {
  if (!statusType) return 'scheduled';
  if (statusType === 'STATUS_IN_PROGRESS') return 'live';
  if (statusType === 'STATUS_FINAL') return 'final';
  return 'scheduled';
}

function extractQuarter(clock?: string): number | undefined {
  if (!clock) return undefined;
  const match = clock.match(/Q(\d)/);
  return match ? parseInt(match[1]) : undefined;
}

/**
 * Fetch all scoreboards
 */
export async function fetchAllSports(): Promise<GameCard[]> {
  const [nfl, nba, ncaaf] = await Promise.all([
    fetchNFLScoreboard(),
    fetchNBAScoreboard(),
    fetchNCAAFScoreboard()
  ]);

  return [...nfl, ...nba, ...ncaaf];
}

/**
 * Mock utility: Simulate live updates
 */
export function simulateLiveUpdate(game: GameCard): GameCard {
  if (game.status !== 'live') return game;

  const rand = Math.random();
  const homeScoreDelta = rand > 0.5 ? 2 : 0;
  const awayScoreDelta = rand > 0.7 ? 3 : 0;

  return {
    ...game,
    homeTeam: { ...game.homeTeam, score: game.homeTeam.score + homeScoreDelta },
    awayTeam: { ...game.awayTeam, score: game.awayTeam.score + awayScoreDelta },
    momentum: {
      team: homeScoreDelta > awayScoreDelta ? game.homeTeam.team : game.awayTeam.team,
      direction: homeScoreDelta > awayScoreDelta ? 'up' : homeScoreDelta < awayScoreDelta ? 'down' : 'stable',
      score: Math.max(homeScoreDelta, awayScoreDelta)
    }
  };
}
