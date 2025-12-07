import { create } from 'zustand';
import { ParcOSState, ParcCard, ParcStack, ParcApp, ParcMessage, CMFKVector, Highlight, SnapZoneType, SNAP_ZONE_DEFINITIONS, CardLink } from './types';
import { nanoid } from 'nanoid';
import { highlightsApi, workspacesApi, gameEventsApi } from '@/lib/api';
import { spatialEngine } from '@/services/spatial-engine';

const INITIAL_CMFK: CMFKVector = {
  correctness: 0,
  misconception: 0,
  fog: 0.5,
  knowingness: 0.1
};

export const useParcOSStore = create<ParcOSState>((set, get) => ({
  userCMFK: INITIAL_CMFK,
  cards: {},
  stacks: {},
  apps: {},
  messages: [],
  focusedCardId: null,
  workspaceName: "Creator Studio",
  activeWorkspace: null,
  activeStack: null,
  sportsMode: "default",
  cinemaSideCardId: null,
  isBillOpen: false,
  minimizedCards: [],
  lastCardPositions: {},
  highlights: [],
  highlightTimelineScroll: 0,
  activeSnapZone: null,
  isDragging: false,
  draggingCardId: null,
  linkedCards: [],
  highlightedTeam: null,
  cinemaCardId: null,
  cinemaOriginalState: null,

  addCard: (card) => {
    set((state) => ({
      cards: { ...state.cards, [card.id]: card }
    }));
    get().recomputeSpatialLayout();
  },

  updateCardPosition: (id, pos) => set((state) => {
    const card = state.cards[id];
    if (!card) return state;
    return {
      cards: {
        ...state.cards,
        [id]: {
          ...card,
          position: { ...card.position, x: pos.x, y: pos.y }
        }
      }
    };
  }),

  setFocusedCard: (id) => set((state) => {
    const maxZ = Math.max(...Object.values(state.cards).map(c => c.position.z), 0);
    const card = state.cards[id];
    
    if (!card) return { focusedCardId: id };

    // Unfocus all other cards
    const updatedCards: Record<string, ParcCard> = {};
    Object.keys(state.cards).forEach(cid => {
      updatedCards[cid] = {
        ...state.cards[cid],
        layoutState: { ...state.cards[cid].layoutState, focused: cid === id }
      };
    });

    return {
      focusedCardId: id,
      cards: {
        ...updatedCards,
        [id]: {
          ...updatedCards[id],
          position: { ...updatedCards[id].position, z: maxZ + 1 },
          layoutState: { ...updatedCards[id].layoutState, focused: true }
        }
      }
    };
  }),

  sendMessage: (msg) => {
    set((state) => ({ messages: [...state.messages, msg] }));
    if (msg.toId === 'broadcast') {
      console.log('Broadcast message:', msg);
    }
  },

  createStack: (stack) => set((state) => ({
    stacks: { ...state.stacks, [stack.id]: stack }
  })),

  registerApp: (app) => set((state) => ({
    apps: { ...state.apps, [app.slug]: app }
  })),

  toggleBill: () => set((state) => ({ isBillOpen: !state.isBillOpen })),
  setBillOpen: (isOpen) => set({ isBillOpen: isOpen }),

  minimizeCard: (id) => set((state) => {
    const card = state.cards[id];
    if (!card) return state;
    
    return {
      minimizedCards: [...state.minimizedCards, id],
      lastCardPositions: { ...state.lastCardPositions, [id]: { x: card.position.x, y: card.position.y } },
      cards: {
        ...state.cards,
        [id]: {
          ...card,
          layoutState: { ...card.layoutState, minimized: true }
        }
      }
    };
  }),

  restoreCard: (id) => {
    set((state) => {
      const card = state.cards[id];
      const lastPos = state.lastCardPositions[id];
      
      if (!card) return state;
      
      const maxZ = Math.max(...Object.values(state.cards).map(c => c.position.z), 0);
      
      return {
        minimizedCards: state.minimizedCards.filter(cid => cid !== id),
        cards: {
          ...state.cards,
          [id]: {
            ...card,
            layoutState: { ...card.layoutState, minimized: false, focused: true },
            position: {
              x: lastPos?.x ?? card.position.x,
              y: lastPos?.y ?? card.position.y,
              z: maxZ + 1
            }
          }
        },
        focusedCardId: id
      };
    });
    get().recomputeSpatialLayout();
  },

  setActiveWorkspace: (workspace, stack) => set({ 
    activeWorkspace: workspace, 
    activeStack: stack 
  }),

  spawnSportsDefaultCards: (stackId) => {
    const store = get();
    
    const defaultCards = [
      {
        title: 'Sports MultiView',
        appId: 'sports-multiview',
        payload: {}
      },
      {
        title: 'Sports Odds',
        appId: 'sports-multiview',
        payload: { view: 'odds' }
      },
      {
        title: 'Sports Stats',
        appId: 'sports-multiview',
        payload: { view: 'stats' }
      }
    ];

    defaultCards.forEach((card, idx) => {
      const newCard: ParcCard = {
        id: nanoid(),
        type: 'card',
        title: card.title,
        appId: card.appId,
        stackId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        cmfk: INITIAL_CMFK,
        metadata: { workspace: 'SPORTS' },
        position: { 
          x: 120 + (idx * 100), 
          y: 120, 
          z: 5 + idx 
        },
        size: { width: 360, height: 520 },
        layoutState: { minimized: false, pinned: false, focused: idx === 0 },
        payload: card.payload
      };

      store.addCard(newCard);
      if (idx === 0) store.setFocusedCard(newCard.id);
    });

    console.log('[Workspace] Spawned 3 Sports cards for stack:', stackId);
  },

  enterSportsCinema: (cardId) => set((state) => ({
    sportsMode: "cinema",
    focusedCardId: cardId,
    cinemaSideCardId: null
  })),

  exitSportsCinema: () => set({
    sportsMode: "default",
    cinemaSideCardId: null
  }),

  setSideCardId: (cardId) => set({ cinemaSideCardId: cardId }),

  getVisibleCards: () => {
    const state = get();
    const allCards = Object.values(state.cards);
    
    // Filter by active stack if one is set
    if (state.activeStack) {
      return allCards.filter(card => card.stackId === state.activeStack && !card.layoutState.minimized);
    }
    
    // Otherwise show all non-minimized cards
    return allCards.filter(card => !card.layoutState.minimized);
  },

  addHighlight: (highlight) => {
    set((state) => ({
      highlights: [...state.highlights, highlight]
    }));
    
    const cmfkScore = highlight.cmfk 
      ? (highlight.cmfk.correctness + highlight.cmfk.knowingness) / 2 
      : 0.5;
    const momentumDelta = highlight.momentum?.delta || 0;
    
    highlightsApi.create({
      id: highlight.id,
      gameId: highlight.gameId,
      timestamp: highlight.timestamp,
      description: highlight.summary,
      team: highlight.teams?.home || 'Unknown',
      eventType: highlight.type,
      cmfkScore,
      momentumDelta,
      metadata: { 
        teams: highlight.teams, 
        value: highlight.value,
        cmfk: highlight.cmfk,
        momentum: highlight.momentum
      }
    }).catch(err => {
      console.error('[Store] Failed to persist highlight:', err);
    });
  },

  getHighlightsByGame: (gameId) => {
    return get().highlights.filter(h => h.gameId === gameId);
  },

  setHighlightTimelineScroll: (scroll) => set({ highlightTimelineScroll: scroll }),

  loadHighlightsFromApi: async (gameId?: string) => {
    try {
      const dbHighlights = await highlightsApi.getAll(gameId);
      const highlights: Highlight[] = dbHighlights.map(h => ({
        id: h.id,
        gameId: h.gameId,
        timestamp: h.timestamp,
        type: (h.eventType as Highlight['type']) || 'score_change',
        summary: h.description,
        teams: (h.metadata as any)?.teams,
        value: (h.metadata as any)?.value,
        createdAt: typeof h.createdAt === 'object' ? (h.createdAt as Date).toISOString() : String(h.createdAt),
        cmfk: (h.metadata as any)?.cmfk,
        momentum: (h.metadata as any)?.momentum
      }));
      set({ highlights });
      console.log('[Store] Loaded', highlights.length, 'highlights from API');
    } catch (err) {
      console.error('[Store] Failed to load highlights:', err);
    }
  },

  saveWorkspaceState: async (workspaceName: string, stackId: string) => {
    const state = get();
    const cards = Object.values(state.cards).filter(c => c.stackId === stackId);
    
    try {
      await workspacesApi.save({
        workspaceName,
        stackId,
        userId: null,
        cards: cards as any,
        metadata: { 
          savedAt: new Date().toISOString(),
          focusedCardId: state.focusedCardId
        }
      });
      console.log('[Store] Saved workspace state:', workspaceName, stackId);
    } catch (err) {
      console.error('[Store] Failed to save workspace state:', err);
    }
  },

  loadWorkspaceState: async (workspaceName: string, stackId: string) => {
    try {
      const state = await workspacesApi.get(workspaceName, stackId);
      if (state && state.cards) {
        const cards = state.cards as ParcCard[];
        const cardsRecord: Record<string, ParcCard> = {};
        cards.forEach(card => {
          cardsRecord[card.id] = card;
        });
        set({ cards: cardsRecord });
        console.log('[Store] Loaded workspace state:', workspaceName, stackId);
        return true;
      }
      return false;
    } catch (err) {
      console.error('[Store] Failed to load workspace state:', err);
      return false;
    }
  },

  setActiveSnapZone: (zone) => set({ activeSnapZone: zone }),

  setDragging: (isDragging, cardId) => set({ isDragging, draggingCardId: cardId }),

  snapCardToZone: (cardId, zone) => set((state) => {
    const card = state.cards[cardId];
    if (!card) return state;

    const zoneDef = SNAP_ZONE_DEFINITIONS[zone];
    if (!zoneDef) return state;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const parseValue = (value: number | string, total: number): number => {
      if (typeof value === 'number') return value;
      if (value.includes('%')) {
        return (parseFloat(value) / 100) * total;
      }
      if (value.includes('calc')) {
        const match = value.match(/calc\((\d+)%\s*([+-])\s*(\d+)px\)/);
        if (match) {
          const percent = parseFloat(match[1]);
          const operator = match[2];
          const pixels = parseFloat(match[3]);
          const baseValue = (percent / 100) * total;
          return operator === '+' ? baseValue + pixels : baseValue - pixels;
        }
      }
      return parseFloat(value) || 0;
    };

    const newX = parseValue(zoneDef.x, windowWidth);
    const newY = parseValue(zoneDef.y, windowHeight);
    const newWidth = parseValue(zoneDef.width, windowWidth);
    const newHeight = parseValue(zoneDef.height, windowHeight);

    const maxZ = Math.max(...Object.values(state.cards).map(c => c.position.z), 0);

    return {
      cards: {
        ...state.cards,
        [cardId]: {
          ...card,
          position: { x: newX, y: newY, z: maxZ + 1 },
          size: { width: newWidth, height: newHeight },
          layoutState: { ...card.layoutState, focused: true }
        }
      },
      focusedCardId: cardId,
      activeSnapZone: null,
      isDragging: false,
      draggingCardId: null
    };
  }),

  tileCards: () => {
    const state = get();
    const visibleCards = Object.values(state.cards).filter(c => !c.layoutState.minimized);
    const count = visibleCards.length;
    
    if (count === 0) return { count: 0, cols: 0, rows: 0 };

    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight - 48;
    const padding = 20;
    const cardWidth = (windowWidth - padding * (cols + 1)) / cols;
    const cardHeight = (windowHeight - padding * (rows + 1)) / rows;

    const updatedCards: Record<string, ParcCard> = { ...state.cards };
    
    visibleCards.forEach((card, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      
      updatedCards[card.id] = {
        ...card,
        position: {
          x: padding + col * (cardWidth + padding),
          y: 48 + padding + row * (cardHeight + padding),
          z: idx + 1
        },
        size: { width: cardWidth, height: cardHeight }
      };
    });

    set({ cards: updatedCards });
    console.log(`[BILL] Tiled ${count} cards in ${cols}x${rows} grid`);
    return { count, cols, rows };
  },

  cascadeCards: () => {
    const state = get();
    const visibleCards = Object.values(state.cards).filter(c => !c.layoutState.minimized);
    const count = visibleCards.length;
    
    if (count === 0) return { count: 0 };

    const offsetX = 30;
    const offsetY = 30;
    const startX = 100;
    const startY = 100;

    const updatedCards: Record<string, ParcCard> = { ...state.cards };
    
    visibleCards.forEach((card, idx) => {
      updatedCards[card.id] = {
        ...card,
        position: {
          x: startX + idx * offsetX,
          y: startY + idx * offsetY,
          z: idx + 1
        },
        size: { width: 450, height: 400 }
      };
    });

    set({ cards: updatedCards, focusedCardId: visibleCards[visibleCards.length - 1]?.id || null });
    console.log(`[BILL] Cascaded ${count} cards`);
    return { count };
  },

  gridLayout: () => {
    const state = get();
    const visibleCards = Object.values(state.cards).filter(c => !c.layoutState.minimized);
    const count = visibleCards.length;
    
    if (count === 0) return { count: 0, cols: 0, rows: 0 };

    let cols: number, rows: number;
    if (count <= 2) {
      cols = count;
      rows = 1;
    } else if (count <= 4) {
      cols = 2;
      rows = 2;
    } else if (count <= 6) {
      cols = 3;
      rows = 2;
    } else {
      cols = 3;
      rows = Math.ceil(count / 3);
    }

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight - 48;
    const gap = 16;
    const cardWidth = (windowWidth - gap * (cols + 1)) / cols;
    const cardHeight = (windowHeight - gap * (rows + 1)) / rows;

    const updatedCards: Record<string, ParcCard> = { ...state.cards };
    
    visibleCards.forEach((card, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      
      updatedCards[card.id] = {
        ...card,
        position: {
          x: gap + col * (cardWidth + gap),
          y: 48 + gap + row * (cardHeight + gap),
          z: idx + 1
        },
        size: { width: cardWidth, height: cardHeight }
      };
    });

    set({ cards: updatedCards });
    console.log(`[BILL] Grid layout ${count} cards in ${cols}x${rows}`);
    return { count, cols, rows };
  },

  stackCards: () => {
    const state = get();
    const visibleCards = Object.values(state.cards).filter(c => !c.layoutState.minimized);
    const count = visibleCards.length;
    
    if (count === 0) return { count: 0 };

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const cardWidth = 500;
    const cardHeight = 400;
    const centerX = (windowWidth - cardWidth) / 2;
    const centerY = (windowHeight - cardHeight) / 2;

    const updatedCards: Record<string, ParcCard> = { ...state.cards };
    
    visibleCards.forEach((card, idx) => {
      updatedCards[card.id] = {
        ...card,
        position: {
          x: centerX,
          y: centerY,
          z: idx + 1
        },
        size: { width: cardWidth, height: cardHeight }
      };
    });

    set({ cards: updatedCards, focusedCardId: visibleCards[visibleCards.length - 1]?.id || null });
    console.log(`[BILL] Stacked ${count} cards`);
    return { count };
  },

  minimizeAllCards: () => {
    const state = get();
    const visibleCards = Object.values(state.cards).filter(c => !c.layoutState.minimized);
    const count = visibleCards.length;
    
    if (count === 0) return { count: 0 };

    const updatedCards: Record<string, ParcCard> = { ...state.cards };
    const newMinimizedCards = [...state.minimizedCards];
    const newLastPositions = { ...state.lastCardPositions };
    
    visibleCards.forEach(card => {
      updatedCards[card.id] = {
        ...card,
        layoutState: { ...card.layoutState, minimized: true }
      };
      newMinimizedCards.push(card.id);
      newLastPositions[card.id] = { x: card.position.x, y: card.position.y };
    });

    set({ 
      cards: updatedCards, 
      minimizedCards: newMinimizedCards,
      lastCardPositions: newLastPositions,
      focusedCardId: null 
    });
    console.log(`[BILL] Minimized ${count} cards`);
    return { count };
  },

  restoreAllCards: () => {
    const state = get();
    const minimizedCardIds = state.minimizedCards;
    const count = minimizedCardIds.length;
    
    if (count === 0) return { count: 0 };

    const updatedCards: Record<string, ParcCard> = { ...state.cards };
    let lastCardId: string | null = null;
    
    minimizedCardIds.forEach((cardId, idx) => {
      const card = state.cards[cardId];
      if (card) {
        const lastPos = state.lastCardPositions[cardId];
        updatedCards[cardId] = {
          ...card,
          layoutState: { ...card.layoutState, minimized: false },
          position: {
            x: lastPos?.x ?? card.position.x,
            y: lastPos?.y ?? card.position.y,
            z: idx + 1
          }
        };
        lastCardId = cardId;
      }
    });

    set({ 
      cards: updatedCards, 
      minimizedCards: [],
      focusedCardId: lastCardId 
    });
    console.log(`[BILL] Restored ${count} cards`);
    get().recomputeSpatialLayout();
    return { count };
  },

  focusCardByName: (name: string) => {
    const state = get();
    const lowerName = name.toLowerCase().trim();
    const allCards = Object.values(state.cards);
    
    const matchedCard = allCards.find(card => 
      card.title.toLowerCase().includes(lowerName) ||
      lowerName.includes(card.title.toLowerCase())
    );
    
    if (matchedCard) {
      const maxZ = Math.max(...allCards.map(c => c.position.z), 0);
      
      const updatedCards: Record<string, ParcCard> = {};
      Object.keys(state.cards).forEach(cid => {
        updatedCards[cid] = {
          ...state.cards[cid],
          layoutState: { ...state.cards[cid].layoutState, focused: cid === matchedCard.id, minimized: false }
        };
      });
      
      updatedCards[matchedCard.id] = {
        ...updatedCards[matchedCard.id],
        position: { ...updatedCards[matchedCard.id].position, z: maxZ + 1 }
      };

      set({ 
        cards: updatedCards, 
        focusedCardId: matchedCard.id,
        minimizedCards: state.minimizedCards.filter(id => id !== matchedCard.id)
      });
      console.log(`[BILL] Focused card: ${matchedCard.title}`);
      return { found: true, cardId: matchedCard.id, title: matchedCard.title };
    }
    
    console.log(`[BILL] Could not find card matching: ${name}`);
    return { found: false };
  },

  snapCurrentCard: (zone: 'left' | 'right' | 'center') => {
    const state = get();
    const focusedCardId = state.focusedCardId;
    
    if (!focusedCardId) {
      console.log('[BILL] No focused card to snap');
      return { success: false };
    }
    
    get().snapCardToZone(focusedCardId, zone);
    console.log(`[BILL] Snapped card to ${zone}`);
    return { success: true, cardId: focusedCardId };
  },

  closeCard: (id: string) => set((state) => {
    const { [id]: removed, ...remainingCards } = state.cards;
    return {
      cards: remainingCards,
      focusedCardId: state.focusedCardId === id ? null : state.focusedCardId,
      minimizedCards: state.minimizedCards.filter(cid => cid !== id)
    };
  }),

  updateCardSize: (id, size) => set((state) => {
    const card = state.cards[id];
    if (!card) return state;
    return {
      cards: {
        ...state.cards,
        [id]: { ...card, size }
      }
    };
  }),

  linkCards: (cardId1: string, cardId2: string, linkType: string) => set((state) => {
    const existingLink = state.linkedCards.find(
      link => link.cardIds.includes(cardId1) && link.cardIds.includes(cardId2)
    );
    if (existingLink) {
      console.log('[Link] Cards already linked:', cardId1, cardId2);
      return state;
    }
    const newLink: CardLink = { cardIds: [cardId1, cardId2], linkType };
    console.log('[Link] Linking cards:', cardId1, cardId2, linkType);
    return { linkedCards: [...state.linkedCards, newLink] };
  }),

  unlinkCards: (cardId1: string, cardId2: string) => set((state) => {
    const newLinkedCards = state.linkedCards.filter(
      link => !(link.cardIds.includes(cardId1) && link.cardIds.includes(cardId2))
    );
    console.log('[Link] Unlinking cards:', cardId1, cardId2);
    return { linkedCards: newLinkedCards, highlightedTeam: null };
  }),

  getLinkedCards: (cardId: string) => {
    const state = get();
    const linkedCardIds: string[] = [];
    state.linkedCards.forEach(link => {
      if (link.cardIds.includes(cardId)) {
        link.cardIds.forEach(id => {
          if (id !== cardId && !linkedCardIds.includes(id)) {
            linkedCardIds.push(id);
          }
        });
      }
    });
    return linkedCardIds;
  },

  setHighlightedTeam: (team: string | null) => set((state) => {
    console.log('[Link] Setting highlighted team:', team);
    return { highlightedTeam: team };
  }),

  enterCinema: (cardId: string) => set((state) => {
    const card = state.cards[cardId];
    if (!card) return state;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    const cinemaWidth = windowWidth * 0.7;
    const cinemaHeight = windowHeight * 0.7;
    const cinemaX = (windowWidth - cinemaWidth) / 2;
    const cinemaY = (windowHeight - cinemaHeight) / 2;

    const maxZ = Math.max(...Object.values(state.cards).map(c => c.position.z), 0);

    console.log('[Cinema] Entering cinema mode for card:', cardId);

    return {
      cinemaCardId: cardId,
      cinemaOriginalState: {
        position: { ...card.position },
        size: { ...card.size }
      },
      focusedCardId: cardId,
      cards: {
        ...state.cards,
        [cardId]: {
          ...card,
          position: { x: cinemaX, y: cinemaY, z: maxZ + 100 },
          size: { width: cinemaWidth, height: cinemaHeight },
          layoutState: { ...card.layoutState, focused: true }
        }
      }
    };
  }),

  exitCinema: () => set((state) => {
    const cardId = state.cinemaCardId;
    const originalState = state.cinemaOriginalState;
    
    if (!cardId || !originalState) {
      return { cinemaCardId: null, cinemaOriginalState: null };
    }

    const card = state.cards[cardId];
    if (!card) {
      return { cinemaCardId: null, cinemaOriginalState: null };
    }

    console.log('[Cinema] Exiting cinema mode for card:', cardId);

    return {
      cinemaCardId: null,
      cinemaOriginalState: null,
      cards: {
        ...state.cards,
        [cardId]: {
          ...card,
          position: originalState.position,
          size: originalState.size
        }
      }
    };
  }),

  updateCardCMFK: (cardId: string, cmfk: CMFKVector, recomputeLayout = true) => {
    set((state) => {
      const card = state.cards[cardId];
      if (!card) return state;
      return {
        cards: {
          ...state.cards,
          [cardId]: {
            ...card,
            cmfk,
            updatedAt: new Date().toISOString()
          }
        }
      };
    });
    
    if (recomputeLayout) {
      get().recomputeSpatialLayout();
    }
  },

  recomputeSpatialLayout: (workspace?: string) => {
    const state = get();
    
    let cardsToLayout = Object.values(state.cards).filter(card => {
      if (card.layoutState.minimized) return false;
      if (card.layoutState.pinned) return false;
      if (workspace && card.metadata?.workspace !== workspace) return false;
      return true;
    });
    
    if (cardsToLayout.length === 0) {
      console.log('[Spatial] No cards to layout');
      return;
    }
    
    const layoutedCards = spatialEngine.layoutCards(cardsToLayout);
    
    const updatedCards: Record<string, ParcCard> = { ...state.cards };
    
    layoutedCards.forEach((card, idx) => {
      updatedCards[card.id] = {
        ...card,
        position: {
          ...card.position,
          z: idx + 1
        }
      };
    });
    
    set({ cards: updatedCards });
    console.log(`[Spatial] Recomputed layout for ${cardsToLayout.length} cards`);
  }
}));

// Helper to initialize some default state
export const initializeState = () => {
  const store = useParcOSStore.getState();
  
  // Register default apps
  const apps: ParcApp[] = [
    {
      id: 'app-sports',
      type: 'app',
      slug: 'sports-multiview',
      title: 'Sports MultiView',
      icon: 'Trophy',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cmfk: INITIAL_CMFK,
      metadata: {},
      defaultConfig: {}
    },
    {
      id: 'app-nil',
      type: 'app',
      slug: 'nil-dashboard',
      title: 'NIL Dashboard',
      icon: 'DollarSign',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cmfk: INITIAL_CMFK,
      metadata: {},
      defaultConfig: {}
    },
    {
      id: 'app-classroom',
      type: 'app',
      slug: 'classroom-board',
      title: 'Classroom Board',
      icon: 'GraduationCap',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cmfk: INITIAL_CMFK,
      metadata: {},
      defaultConfig: {}
    },
    {
      id: 'app-browser',
      type: 'app',
      slug: 'generic-browser',
      title: 'Web Browser',
      icon: 'Globe',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cmfk: INITIAL_CMFK,
      metadata: {},
      defaultConfig: {}
    }
  ];

  apps.forEach(app => store.registerApp(app));

  // Create initial stacks
  const nilStack: ParcStack = {
    id: nanoid(),
    type: 'stack',
    title: 'NIL Stack',
    domain: 'nil',
    cardIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    cmfk: INITIAL_CMFK,
    metadata: {}
  };

  const sportsStack: ParcStack = {
    id: nanoid(),
    type: 'stack',
    title: 'Sports Stack',
    domain: 'sports',
    cardIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    cmfk: INITIAL_CMFK,
    metadata: {}
  };

  store.createStack(nilStack);
  store.createStack(sportsStack);

  // Create initial cards
  const card1: ParcCard = {
    id: nanoid(),
    type: 'card',
    title: 'NIL Deals Tracker',
    appId: 'nil-dashboard',
    stackId: nilStack.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    cmfk: INITIAL_CMFK,
    metadata: {},
    position: { x: 100, y: 100, z: 1 },
    size: { width: 400, height: 500 },
    layoutState: { minimized: false, pinned: false, focused: false },
    payload: { totalValue: 125000, deals: 4 }
  };

  const card2: ParcCard = {
    id: nanoid(),
    type: 'card',
    title: 'Live Game Stats',
    appId: 'sports-multiview',
    stackId: sportsStack.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    cmfk: INITIAL_CMFK,
    metadata: {},
    position: { x: 550, y: 150, z: 2 },
    size: { width: 600, height: 400 },
    layoutState: { minimized: false, pinned: false, focused: false },
    payload: { game: 'LAL vs GSW', score: '102 - 99' }
  };

  store.addCard(card1);
  store.addCard(card2);
};
