import { create } from 'zustand';
import { ParcOSState, ParcCard, ParcStack, ParcApp, ParcMessage, CMFKVector } from './types';
import { nanoid } from 'nanoid';

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
  isBillOpen: false,

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
    // Bring to front logic could be here (z-index)
    // For now just marking focused
    const maxZ = Math.max(...Object.values(state.cards).map(c => c.position.z), 0);
    const card = state.cards[id];
    
    if (!card) return { focusedCardId: id };

    return {
      focusedCardId: id,
      cards: {
        ...state.cards,
        [id]: {
          ...card,
          position: { ...card.position, z: maxZ + 1 },
          layoutState: { ...card.layoutState, focused: true }
        }
      }
    };
  }),

  sendMessage: (msg) => {
    set((state) => ({ messages: [...state.messages, msg] }));
    
    // Simple routing logic / effects could go here
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
  setBillOpen: (isOpen) => set({ isBillOpen: isOpen })
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

  // Create initial cards
  const card1: ParcCard = {
    id: nanoid(),
    type: 'card',
    title: 'NIL Deals Tracker',
    appId: 'nil-dashboard',
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
