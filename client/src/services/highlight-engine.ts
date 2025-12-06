/**
 * AI-Driven Sports Highlight Engine
 * Monitors game updates and generates highlights for key events
 */

import { Highlight, HighlightType } from '@/state/types';
import { nanoid } from 'nanoid';

export interface GameState {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  previousHomeScore?: number;
  previousAwayScore?: number;
  momentum?: { team: string; direction: 'up' | 'down' | 'stable' };
  lastUpdateTime?: string;
}

// Track game states for comparison
const gameStates: Record<string, GameState> = {};
const highlightCallbacks: Array<(highlight: Highlight) => void> = [];

export const highlightEngine = {
  /**
   * Register callback for new highlights
   */
  onHighlight: (callback: (highlight: Highlight) => void) => {
    highlightCallbacks.push(callback);
  },

  /**
   * Check for key events and generate highlights
   */
  updateGameState: (gameId: string, newState: GameState) => {
    const previousState = gameStates[gameId];
    const now = new Date().toISOString();
    const highlights: Highlight[] = [];

    if (!previousState) {
      // First update for this game
      gameStates[gameId] = newState;
      return highlights;
    }

    // 1. Score changes
    if (newState.homeScore !== previousState.homeScore || newState.awayScore !== previousState.awayScore) {
      const homeDiff = newState.homeScore - previousState.homeScore;
      const awayDiff = newState.awayScore - previousState.awayScore;
      
      if (homeDiff > 0) {
        highlights.push({
          id: nanoid(),
          gameId,
          timestamp: now,
          type: 'score_change',
          summary: `${newState.homeTeam} scores! ${homeDiff} points. (${newState.homeScore}-${newState.awayScore})`,
          teams: { home: newState.homeTeam, away: newState.awayTeam },
          value: `+${homeDiff}`,
          createdAt: now
        });
      }
      if (awayDiff > 0) {
        highlights.push({
          id: nanoid(),
          gameId,
          timestamp: now,
          type: 'score_change',
          summary: `${newState.awayTeam} scores! ${awayDiff} points. (${newState.homeScore}-${newState.awayScore})`,
          teams: { home: newState.homeTeam, away: newState.awayTeam },
          value: `+${awayDiff}`,
          createdAt: now
        });
      }

      // 2. Lead changes
      const previousLead = previousState.homeScore - previousState.awayScore;
      const currentLead = newState.homeScore - newState.awayScore;
      
      if ((previousLead > 0 && currentLead < 0) || (previousLead < 0 && currentLead > 0)) {
        const leader = currentLead > 0 ? newState.homeTeam : newState.awayTeam;
        highlights.push({
          id: nanoid(),
          gameId,
          timestamp: now,
          type: 'lead_change',
          summary: `LEAD CHANGE! ${leader} takes the lead ${Math.abs(currentLead)} points.`,
          teams: { home: newState.homeTeam, away: newState.awayTeam },
          createdAt: now
        });
      }

      // 3. Detect runs (simulate)
      if (homeDiff >= 7 || awayDiff >= 7) {
        const runTeam = homeDiff >= 7 ? newState.homeTeam : newState.awayTeam;
        const runPoints = homeDiff >= 7 ? homeDiff : awayDiff;
        highlights.push({
          id: nanoid(),
          gameId,
          timestamp: now,
          type: 'run',
          summary: `HOT START! ${runTeam} on a ${runPoints}-${runPoints === 7 ? 'point' : 'point'} run!`,
          teams: { home: newState.homeTeam, away: newState.awayTeam },
          value: `${runPoints}-${0}`,
          createdAt: now
        });
      }
    }

    // 4. Momentum reversals
    if (newState.momentum && previousState.momentum) {
      if (newState.momentum.direction !== previousState.momentum.direction) {
        highlights.push({
          id: nanoid(),
          gameId,
          timestamp: now,
          type: 'momentum_reversal',
          summary: `Momentum shift! ${newState.momentum.team} now has the edge.`,
          teams: { home: newState.homeTeam, away: newState.awayTeam },
          createdAt: now
        });
      }
    }

    // 5. Mock big plays based on large score jumps
    const maxScoreJump = Math.max(
      Math.abs(newState.homeScore - previousState.homeScore),
      Math.abs(newState.awayScore - previousState.awayScore)
    );
    
    if (maxScoreJump >= 6) {
      const plays = ['🏈 TD!', '🏀 3-Pointer!', '🏀 DUNK!', '🏈 Field Goal!'];
      const randomPlay = plays[Math.floor(Math.random() * plays.length)];
      const scoringTeam = newState.homeScore > previousState.homeScore ? newState.homeTeam : newState.awayTeam;
      
      highlights.push({
        id: nanoid(),
        gameId,
        timestamp: now,
        type: 'big_play',
        summary: `${randomPlay} ${scoringTeam}!`,
        teams: { home: newState.homeTeam, away: newState.awayTeam },
        createdAt: now
      });
    }

    // Update stored state
    gameStates[gameId] = newState;

    // Emit all highlights
    highlights.forEach(h => {
      highlightCallbacks.forEach(cb => cb(h));
    });

    return highlights;
  },

  /**
   * Clear game state (e.g., when switching games)
   */
  clearGameState: (gameId: string) => {
    delete gameStates[gameId];
  },

  /**
   * Get current game state
   */
  getGameState: (gameId: string) => gameStates[gameId]
};
