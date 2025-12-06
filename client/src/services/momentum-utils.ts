import { CMFKVector, HighlightType } from '@/state/types';

export interface GameEvent {
  type: HighlightType;
  scoreDiff: number;
  leadChange: boolean;
  isBigPlay: boolean;
  team: string;
  text: string;
}

export interface MomentumAnalysis {
  delta: number;
  isShift: boolean;
  direction: 'up' | 'down' | 'stable';
}

/**
 * Calculates CMFK vector for a given sports event
 * 
 * Correctness (C): How "right" or successful the play was (TD = 1.0, Turnover = 0.0)
 * Misconception (M): Unexpectedness or error magnitude (Interception = 0.8)
 * Fog (F): Volatility or chaos in the game state (Close game = high fog)
 * Knowingness (K): Dominance or momentum (Run = high K)
 */
export function scorePlayCMFK(event: GameEvent): CMFKVector {
  let c = 0.5;
  let m = 0.0;
  let f = 0.2;
  let k = 0.5;

  switch (event.type) {
    case 'score_change':
      c = 0.8;
      k = 0.6 + (event.scoreDiff > 0 ? 0.1 : 0);
      break;
    case 'lead_change':
      c = 0.9;
      f = 0.8; // High volatility
      k = 0.7;
      break;
    case 'run':
      c = 0.9;
      k = 0.9; // Pure dominance
      break;
    case 'momentum_reversal':
      c = 0.7;
      m = 0.4; // Unexpected
      f = 0.6;
      break;
    case 'turnover':
      c = 0.1; // Bad for one team
      m = 0.9; // Mistake
      f = 0.7;
      break;
    case 'big_play':
      c = 1.0;
      k = 0.8;
      f = 0.5;
      break;
    case 'injury':
      c = 0.2;
      f = 0.9; // Chaos/Uncertainty
      break;
  }

  // Adjust for magnitude
  if (event.isBigPlay) {
    k += 0.1;
    f += 0.1;
  }

  return {
    correctness: Math.min(c, 1),
    misconception: Math.min(m, 1),
    fog: Math.min(f, 1),
    knowingness: Math.min(k, 1)
  };
}

/**
 * Analyzes momentum shift based on event data
 */
export function analyzeMomentumShift(event: GameEvent): MomentumAnalysis {
  let delta = 0;
  let isShift = false;
  let direction: 'up' | 'down' | 'stable' = 'stable';

  // Base delta on event type
  switch (event.type) {
    case 'score_change':
      delta = 15;
      break;
    case 'lead_change':
      delta = 45;
      isShift = true;
      break;
    case 'run':
      delta = 35;
      direction = 'up';
      break;
    case 'momentum_reversal':
      delta = 50;
      isShift = true;
      break;
    case 'turnover':
      delta = 40;
      isShift = true;
      direction = 'down';
      break;
    case 'big_play':
      delta = 25;
      direction = 'up';
      break;
  }

  // Adjust direction based on score diff if available
  if (event.scoreDiff > 0 && direction === 'stable') {
    direction = 'up';
  }

  return {
    delta,
    isShift,
    direction
  };
}
