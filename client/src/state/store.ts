import { create } from 'zustand';
import { ParcOSState, ParcCard, ParcStack, ParcApp, ParcMessage, CMFKVector, Highlight } from './types';
import { nanoid } from 'nanoid';
import { highlightsApi, workspacesApi, gameEventsApi } from '@/lib/api';

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

  addCard: (card) => set((state) => ({
    cards: { ...state.cards, [card.id]: card }
  })),

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

  restoreCard: (id) => set((state) => {
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
  }),

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
