/**
 * AI-Driven Sports Highlight Engine
 * Monitors game updates and generates highlights for key events
 */

import { Highlight, HighlightType, CMFKVector } from '@/state/types';
import { nanoid } from 'nanoid';
import { scorePlayCMFK, analyzeMomentumShift, GameEvent } from './momentum-utils';

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

    const createHighlight = (type: HighlightType, summary: string, value?: string, teams?: {home: string, away: string}): Highlight => {
      // Construct event object for scoring
      const event: GameEvent = {
        type,
        scoreDiff: Math.abs(newState.homeScore - newState.awayScore),
        leadChange: type === 'lead_change',
        isBigPlay: type === 'big_play' || type === 'run',
        team: value?.startsWith('+') ? (newState.homeScore > previousState.homeScore ? newState.homeTeam : newState.awayTeam) : 'Unknown',
        text: summary
      };

      const cmfk = scorePlayCMFK(event);
      const momentum = analyzeMomentumShift(event);

      return {
        id: nanoid(),
        gameId,
        timestamp: now,
        type,
        summary,
        teams,
        value,
        createdAt: now,
        cmfk,
        momentum
      };
    };

    // 1. Score changes
    if (newState.homeScore !== previousState.homeScore || newState.awayScore !== previousState.awayScore) {
      const homeDiff = newState.homeScore - previousState.homeScore;
      const awayDiff = newState.awayScore - previousState.awayScore;
      
      if (homeDiff > 0) {
        highlights.push(createHighlight(
          'score_change',
          `${newState.homeTeam} scores! ${homeDiff} points. (${newState.homeScore}-${newState.awayScore})`,
          `+${homeDiff}`,
          { home: newState.homeTeam, away: newState.awayTeam }
        ));
      }
      if (awayDiff > 0) {
        highlights.push(createHighlight(
          'score_change',
          `${newState.awayTeam} scores! ${awayDiff} points. (${newState.homeScore}-${newState.awayScore})`,
          `+${awayDiff}`,
          { home: newState.homeTeam, away: newState.awayTeam }
        ));
      }

      // 2. Lead changes
      const previousLead = previousState.homeScore - previousState.awayScore;
      const currentLead = newState.homeScore - newState.awayScore;
      
      if ((previousLead > 0 && currentLead < 0) || (previousLead < 0 && currentLead > 0)) {
        const leader = currentLead > 0 ? newState.homeTeam : newState.awayTeam;
        highlights.push(createHighlight(
          'lead_change',
          `LEAD CHANGE! ${leader} takes the lead ${Math.abs(currentLead)} points.`,
          undefined,
          { home: newState.homeTeam, away: newState.awayTeam }
        ));
      }

      // 3. Detect runs (simulate)
      if (homeDiff >= 7 || awayDiff >= 7) {
        const runTeam = homeDiff >= 7 ? newState.homeTeam : newState.awayTeam;
        const runPoints = homeDiff >= 7 ? homeDiff : awayDiff;
        highlights.push(createHighlight(
          'run',
          `HOT START! ${runTeam} on a ${runPoints}-${runPoints === 7 ? 'point' : 'point'} run!`,
          `${runPoints}-0`,
          { home: newState.homeTeam, away: newState.awayTeam }
        ));
      }
    }

    // 4. Momentum reversals
    if (newState.momentum && previousState.momentum) {
      if (newState.momentum.direction !== previousState.momentum.direction) {
        highlights.push(createHighlight(
          'momentum_reversal',
          `Momentum shift! ${newState.momentum.team} now has the edge.`,
          undefined,
          { home: newState.homeTeam, away: newState.awayTeam }
        ));
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
      
      highlights.push(createHighlight(
        'big_play',
        `${randomPlay} ${scoringTeam}!`,
        undefined,
        { home: newState.homeTeam, away: newState.awayTeam }
      ));
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
