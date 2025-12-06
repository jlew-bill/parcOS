import { useParcOSStore } from './store';
import { GameCard, simulateLiveUpdate } from '@/services/sports-data';
import { nanoid } from 'nanoid';

/**
 * BILL Sports Commands
 * AI-driven sports analysis and card generation
 */

export const billSportsCommands = {
  /**
   * Analyze a game and return insights
   */
  analyzeGame: (game: GameCard): string => {
    const scoreDiff = Math.abs(game.homeTeam.score - game.awayTeam.score);
    const leader = game.homeTeam.score > game.awayTeam.score ? game.homeTeam.team : game.awayTeam.team;
    
    let analysis = `${game.league} Game Analysis:\n`;
    analysis += `${game.homeTeam.team} vs ${game.awayTeam.team}\n`;
    analysis += `Status: ${game.status.toUpperCase()}\n`;
    analysis += `Score: ${game.homeTeam.score} - ${game.awayTeam.score}\n`;
    
    if (game.status === 'live') {
      analysis += `Quarter: ${game.quarter}\n`;
      analysis += `Leader: ${leader} (+${scoreDiff})\n`;
      if (game.momentum) {
        analysis += `Momentum: ${game.momentum.team} is ${game.momentum.direction === 'up' ? 'gaining' : 'losing'} momentum\n`;
      }
    }
    
    if (game.prediction) {
      analysis += `Predicted Winner: ${game.prediction.winner} (${Math.round(game.prediction.confidence * 100)}% confidence)`;
    }
    
    console.log('[BILL Sports]', analysis);
    return analysis;
  },

  /**
   * Create a momentum card for a game
   */
  createMomentumCard: (game: GameCard) => {
    const store = useParcOSStore.getState();
    const maxZ = Math.max(...Object.values(store.cards).map(c => c.position.z), 0);
    
    const momentum = game.momentum || { team: game.homeTeam.team, direction: 'stable' as const, score: 0 };
    
    const card = {
      id: nanoid(),
      type: 'card' as const,
      title: `${game.league} Momentum: ${game.homeTeam.team} vs ${game.awayTeam.team}`,
      appId: 'sports-multiview',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cmfk: { correctness: 0.7, misconception: 0, fog: 0.2, knowingness: 0.8 },
      metadata: { gameId: game.id, cardType: 'momentum' },
      position: {
        x: 200 + Math.random() * 100,
        y: 200 + Math.random() * 100,
        z: maxZ + 1
      },
      size: { width: 350, height: 280 },
      layoutState: { minimized: false, pinned: false, focused: true },
      payload: {
        game,
        momentum,
        chart: generateMomentumChart(game)
      }
    };
    
    store.addCard(card);
    store.setFocusedCard(card.id);
    return card;
  },

  /**
   * Create a prediction card
   */
  createPredictionCard: (game: GameCard) => {
    const store = useParcOSStore.getState();
    const maxZ = Math.max(...Object.values(store.cards).map(c => c.position.z), 0);
    
    const prediction = game.prediction || { winner: game.homeTeam.team, confidence: 0.5 };
    
    const card = {
      id: nanoid(),
      type: 'card' as const,
      title: `${game.league} Prediction: ${prediction.winner}`,
      appId: 'sports-multiview',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cmfk: { correctness: 0.6, misconception: 0.1, fog: 0.3, knowingness: 0.7 },
      metadata: { gameId: game.id, cardType: 'prediction' },
      position: {
        x: 200 + Math.random() * 100,
        y: 500 + Math.random() * 100,
        z: maxZ + 1
      },
      size: { width: 350, height: 280 },
      layoutState: { minimized: false, pinned: false, focused: true },
      payload: {
        game,
        prediction,
        reasoning: generatePredictionReasoning(game, prediction)
      }
    };
    
    store.addCard(card);
    store.setFocusedCard(card.id);
    return card;
  },

  /**
   * Summarize a quarter
   */
  summarizeQuarter: (game: GameCard): string => {
    if (game.status !== 'live') {
      return `Game not in progress. Status: ${game.status}`;
    }
    
    const quarter = game.quarter || 1;
    const leader = game.homeTeam.score > game.awayTeam.score ? game.homeTeam.team : game.awayTeam.team;
    const scoreDiff = Math.abs(game.homeTeam.score - game.awayTeam.score);
    
    const summary = `Q${quarter} Summary:\n${leader} leads by ${scoreDiff} points.\n` +
      `${game.homeTeam.team}: ${game.homeTeam.score}\n${game.awayTeam.team}: ${game.awayTeam.score}\n` +
      `Momentum: ${game.momentum?.direction.toUpperCase() || 'STABLE'}`;
    
    console.log('[BILL Sports]', summary);
    return summary;
  },

  /**
   * Generate a narrative card with storytelling
   */
  generateNarrativeCard: (game: GameCard) => {
    const store = useParcOSStore.getState();
    const maxZ = Math.max(...Object.values(store.cards).map(c => c.position.z), 0);
    
    const narrative = generateGameNarrative(game);
    
    const card = {
      id: nanoid(),
      type: 'card' as const,
      title: `${game.league} Narrative: ${game.homeTeam.team} vs ${game.awayTeam.team}`,
      appId: 'sports-multiview',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cmfk: { correctness: 0.8, misconception: 0, fog: 0.15, knowingness: 0.85 },
      metadata: { gameId: game.id, cardType: 'narrative' },
      position: {
        x: 600 + Math.random() * 100,
        y: 200 + Math.random() * 100,
        z: maxZ + 1
      },
      size: { width: 450, height: 350 },
      layoutState: { minimized: false, pinned: false, focused: true },
      payload: {
        game,
        narrative,
        mood: determineMood(game)
      }
    };
    
    store.addCard(card);
    store.setFocusedCard(card.id);
    return card;
  },

  /**
   * Create a highlight reel card
   */
  createHighlightCard: (game: GameCard) => {
    const store = useParcOSStore.getState();
    const maxZ = Math.max(...Object.values(store.cards).map(c => c.position.z), 0);
    
    // Get existing highlights for this game or generate mock ones if none exist
    let highlights = store.highlights.filter(h => h.gameId === game.id);
    
    // Mock generation if no real highlights yet (for demo)
    if (highlights.length === 0) {
      console.log('No highlights found, waiting for engine...');
      // In a real app we might trigger a fetch here
    }

    const card = {
      id: nanoid(),
      type: 'card' as const,
      title: `${game.league} Highlights: ${game.homeTeam.team} vs ${game.awayTeam.team}`,
      appId: 'sports-multiview', // Reuse multiview but with different payload
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cmfk: { correctness: 0.9, misconception: 0, fog: 0.1, knowingness: 0.95 },
      metadata: { gameId: game.id, cardType: 'highlights' },
      position: {
        x: 400 + Math.random() * 100,
        y: 300 + Math.random() * 100,
        z: maxZ + 1
      },
      size: { width: 400, height: 600 },
      layoutState: { minimized: false, pinned: false, focused: true },
      payload: {
        game,
        highlights,
        view: 'highlights' // New view type
      }
    };
    
    store.addCard(card);
    store.setFocusedCard(card.id);
    return card;
  }
};

// Helper functions
function generateMomentumChart(game: GameCard): string {
  const momentum = game.momentum?.score || 0;
  const bars = '█'.repeat(Math.min(momentum, 10));
  return `Momentum: [${bars}] ${momentum}pt swing`;
}

function generatePredictionReasoning(game: GameCard, prediction: any): string {
  const confidence = Math.round(prediction.confidence * 100);
  const scoreDiff = Math.abs(game.homeTeam.score - game.awayTeam.score);
  
  if (confidence > 75) return `${prediction.winner} is heavily favored based on current performance.`;
  if (confidence > 60) return `${prediction.winner} has a solid edge in this matchup.`;
  if (confidence > 45) return `This is a close call, but slight edge to ${prediction.winner}.`;
  return `Either team could win - too close to call.`;
}

function generateGameNarrative(game: GameCard): string {
  const leader = game.homeTeam.score > game.awayTeam.score ? game.homeTeam.team : game.awayTeam.team;
  const scoreDiff = Math.abs(game.homeTeam.score - game.awayTeam.score);
  
  if (game.status === 'final') {
    return `Final: ${leader} defeated their opponent ${game.homeTeam.score}-${game.awayTeam.score}. A decisive victory that will be remembered.`;
  }
  
  if (game.status === 'live' && game.quarter && game.quarter > 2) {
    return `In the ${game.quarter === 4 ? 'final' : 'late'} stages, ${leader} maintains a crucial ${scoreDiff}-point lead. The intensity is rising as we approach the finish.`;
  }
  
  if (game.status === 'live') {
    return `Early in the game, ${leader} has jumped out to a ${scoreDiff}-point advantage. ${game.awayTeam.team} will need to regroup and mount a comeback.`;
  }
  
  return `An upcoming matchup between two teams looking to prove themselves. ${game.homeTeam.team} will host ${game.awayTeam.team}.`;
}

function determineMood(game: GameCard): string {
  if (game.status === 'final') return 'reflective';
  if (game.status === 'live') return game.momentum?.direction === 'up' ? 'intense' : 'tense';
  return 'anticipatory';
}
