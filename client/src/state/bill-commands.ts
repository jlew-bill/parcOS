import { useParcOSStore } from './store';
import { ParcCard, ParcStack } from './types';
import { nanoid } from 'nanoid';

/**
 * BILL Commands Module
 * Placeholder functions for AI-driven OS behaviors
 */

export const billCommands = {
  /**
   * Create a new card programmatically
   */
  createCard: (title: string, appId: string, stackId?: string, payload?: any) => {
    const store = useParcOSStore.getState();
    const maxZ = Math.max(...Object.values(store.cards).map(c => c.position.z), 0);
    
    const newCard: ParcCard = {
      id: nanoid(),
      type: 'card',
      title,
      appId,
      stackId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cmfk: { correctness: 0, misconception: 0, fog: 0.5, knowingness: 0.1 },
      metadata: {},
      position: {
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
        z: maxZ + 1
      },
      size: { width: 450, height: 500 },
      layoutState: { minimized: false, pinned: false, focused: true },
      payload: payload || {}
    };
    
    store.addCard(newCard);
    store.setFocusedCard(newCard.id);
    return newCard;
  },

  /**
   * Create a new stack and optional cards within it
   */
  createStack: (domain: string, title: string, cardIds: string[] = []) => {
    const store = useParcOSStore.getState();
    
    const newStack: ParcStack = {
      id: nanoid(),
      type: 'stack',
      title,
      domain,
      cardIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cmfk: { correctness: 0, misconception: 0, fog: 0.5, knowingness: 0.1 },
      metadata: {}
    };
    
    store.createStack(newStack);
    return newStack;
  },

  /**
   * Summarize a card's content (placeholder - would call LLM)
   */
  summarizeCard: (cardId: string): string => {
    const store = useParcOSStore.getState();
    const card = store.cards[cardId];
    
    if (!card) return '';
    
    // Placeholder: just create a mock summary
    const summary = `Summary of "${card.title}": This card contains data related to ${card.appId}. 
    Cognitive state - Knowingness: ${Math.round(card.cmfk.knowingness * 100)}%, 
    Fog: ${Math.round(card.cmfk.fog * 100)}%.`;
    
    console.log(`[BILL] Summarizing card ${cardId}:`, summary);
    return summary;
  },

  /**
   * Rearrange workspace by domain/stack
   */
  rearrangeWorkspace: (domain?: string) => {
    const store = useParcOSStore.getState();
    const allCards = Object.values(store.cards);
    
    if (!domain) {
      // Reset all cards to grid layout
      const cols = 3;
      const spacing = 50;
      const startX = 200;
      const startY = 150;
      
      allCards.forEach((card, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        store.updateCardPosition(card.id, {
          x: startX + col * (card.size.width + spacing),
          y: startY + row * (card.size.height + spacing)
        });
      });
      
      console.log('[BILL] Rearranged workspace to grid layout');
    } else {
      // Filter and arrange cards by domain
      const domainCards = allCards.filter(card => card.stackId === domain || card.appId?.includes(domain));
      const spacing = 30;
      
      domainCards.forEach((card, idx) => {
        store.updateCardPosition(card.id, {
          x: 100 + idx * spacing,
          y: 100 + idx * spacing
        });
      });
      
      console.log(`[BILL] Rearranged workspace for domain: ${domain}`);
    }
  },

  /**
   * Filter and show only cards from a specific stack
   */
  filterByStack: (stackId: string) => {
    console.log(`[BILL] Filtering workspace to show only stack: ${stackId}`);
    // This would be used by Canvas to conditionally render
    return stackId;
  },

  /**
   * Get workspace insights (placeholder - would analyze CMFK)
   */
  getWorkspaceInsights: (): string => {
    const store = useParcOSStore.getState();
    const allCards = Object.values(store.cards);
    
    const avgKnowingness = allCards.reduce((sum, card) => sum + card.cmfk.knowingness, 0) / allCards.length;
    const avgFog = allCards.reduce((sum, card) => sum + card.cmfk.fog, 0) / allCards.length;
    
    return `Workspace Insights: ${allCards.length} cards open. 
    Average Knowingness: ${Math.round(avgKnowingness * 100)}%, 
    Average Fog: ${Math.round(avgFog * 100)}%.`;
  }
};
