/**
 * Sports Highlights Poller
 * Polls game state and triggers highlight detection
 */

import { highlightEngine, GameState } from './highlight-engine';

// Mock game states that update every 30 seconds
const mockGames: Record<string, any> = {
  'game-nfl-001': {
    id: 'game-nfl-001',
    homeTeam: 'Kansas City Chiefs',
    awayTeam: 'Buffalo Bills',
    homeScore: 24,
    awayScore: 21,
    momentum: { team: 'Kansas City Chiefs', direction: 'up' as const }
  },
  'game-nba-001': {
    id: 'game-nba-001',
    homeTeam: 'Los Angeles Lakers',
    awayTeam: 'Golden State Warriors',
    homeScore: 102,
    awayScore: 99,
    momentum: { team: 'Los Angeles Lakers', direction: 'stable' as const }
  }
};

let pollInterval: NodeJS.Timeout | null = null;

export const startSportsHighlightPoller = () => {
  if (pollInterval) return;

  pollInterval = setInterval(() => {
    Object.keys(mockGames).forEach(gameId => {
      const game = mockGames[gameId];
      
      // Simulate random score changes
      if (Math.random() > 0.7) {
        const homeChange = Math.random() > 0.5 ? Math.floor(Math.random() * 7) : 0;
        const awayChange = Math.random() > 0.5 ? Math.floor(Math.random() * 7) : 0;
        
        if (homeChange > 0 || awayChange > 0) {
          const newState: GameState = {
            gameId,
            homeTeam: game.homeTeam,
            awayTeam: game.awayTeam,
            homeScore: game.homeScore + homeChange,
            awayScore: game.awayScore + awayChange,
            previousHomeScore: game.homeScore,
            previousAwayScore: game.awayScore,
            momentum: {
              team: homeChange > awayChange ? game.homeTeam : game.awayTeam,
              direction: homeChange > awayChange ? 'up' : homeChange < awayChange ? 'down' : 'stable'
            }
          };
          
          // Update mock game state
          mockGames[gameId] = {
            ...game,
            homeScore: newState.homeScore,
            awayScore: newState.awayScore,
            momentum: newState.momentum
          };
          
          // Trigger highlight detection
          highlightEngine.updateGameState(gameId, newState);
        }
      }
    });
  }, 30000); // Poll every 30 seconds
};

export const stopSportsHighlightPoller = () => {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
};
