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
  },

  /**
   * Arrange workspace: align windows in a neat grid, sort by card type,
   * focus the "primary" card, minimize irrelevant cards, clean overlapping
   */
  arrangeWorkspace: () => {
    const store = useParcOSStore.getState();
    const allCards = Object.values(store.cards);
    const activeStack = store.activeStack;
    
    const relevantCards = activeStack 
      ? allCards.filter(card => card.stackId === activeStack && !card.layoutState.minimized)
      : allCards.filter(card => !card.layoutState.minimized);
    
    const irrelevantCards = activeStack
      ? allCards.filter(card => card.stackId !== activeStack && !card.layoutState.minimized)
      : [];

    irrelevantCards.forEach(card => {
      store.minimizeCard(card.id);
    });

    const sortedCards = [...relevantCards].sort((a, b) => {
      if (a.appId === b.appId) return a.title.localeCompare(b.title);
      return (a.appId || '').localeCompare(b.appId || '');
    });

    const count = sortedCards.length;
    if (count === 0) {
      console.log('[BILL] arrangeWorkspace: No cards to arrange');
      return { arranged: 0, minimized: irrelevantCards.length };
    }

    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight - 48;
    const padding = 24;
    const cardWidth = (windowWidth - padding * (cols + 1)) / cols;
    const cardHeight = (windowHeight - padding * (rows + 1)) / rows;

    sortedCards.forEach((card, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      
      store.updateCardPosition(card.id, {
        x: padding + col * (cardWidth + padding),
        y: 48 + padding + row * (cardHeight + padding)
      });
      store.updateCardSize(card.id, { width: cardWidth, height: cardHeight });
    });

    if (sortedCards.length > 0) {
      store.setFocusedCard(sortedCards[0].id);
    }

    console.log(`[BILL] arrangeWorkspace: Arranged ${count} cards in ${cols}x${rows} grid, minimized ${irrelevantCards.length} irrelevant`);
    return { arranged: count, minimized: irrelevantCards.length, cols, rows };
  },

  /**
   * Center and enlarge a chosen card, like Spotlight
   */
  centerFocus: (cardId: string) => {
    const store = useParcOSStore.getState();
    const card = store.cards[cardId];
    
    if (!card) {
      console.log(`[BILL] centerFocus: Card ${cardId} not found`);
      return { success: false, reason: 'Card not found' };
    }

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    const focusWidth = windowWidth * 0.6;
    const focusHeight = windowHeight * 0.65;
    const centerX = (windowWidth - focusWidth) / 2;
    const centerY = (windowHeight - focusHeight) / 2;

    const maxZ = Math.max(...Object.values(store.cards).map(c => c.position.z), 0);
    store.updateCardPosition(cardId, { x: centerX, y: centerY, z: maxZ + 10 });
    store.updateCardSize(cardId, { width: focusWidth, height: focusHeight });
    store.setFocusedCard(cardId);

    console.log(`[BILL] centerFocus: Centered and enlarged card "${card.title}" at z=${maxZ + 10}`);
    return { success: true, cardId, title: card.title };
  },

  /**
   * Minimizes all but the currently focused card
   */
  clearClutter: () => {
    const store = useParcOSStore.getState();
    const focusedCardId = store.focusedCardId;
    const allCards = Object.values(store.cards);
    
    let minimizedCount = 0;
    
    allCards.forEach(card => {
      if (card.id !== focusedCardId && !card.layoutState.minimized) {
        store.minimizeCard(card.id);
        minimizedCount++;
      }
    });

    if (focusedCardId) {
      const focusedCard = store.cards[focusedCardId];
      if (focusedCard) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const centerX = (windowWidth - focusedCard.size.width) / 2;
        const centerY = (windowHeight - focusedCard.size.height) / 2;
        store.updateCardPosition(focusedCardId, { x: centerX, y: centerY });
      }
    }

    console.log(`[BILL] clearClutter: Minimized ${minimizedCount} cards, kept focused card`);
    return { minimized: minimizedCount, focusedCardId };
  }
};
