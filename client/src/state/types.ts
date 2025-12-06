// CMFK vector (cognitive state)
export interface CMFKVector {
  correctness: number;      // 0–1
  misconception: number;    // 0–1
  fog: number;              // 0–1
  knowingness: number;      // 0–1
}

// Base object for anything in the OS
export interface ParcObject {
  id: string;
  type: string;             // "card" | "stack" | "app" | "user" | ...
  title: string;
  createdAt: string;
  updatedAt: string;
  cmfk: CMFKVector;
  metadata: Record<string, any>;
}

// A visual card on the canvas
export interface ParcCard extends ParcObject {
  type: "card";
  stackId?: string;
  appId?: string;           // which app/component renders it
  position: { x: number; y: number; z: number };
  size: { width: number; height: number };
  layoutState: {
    minimized: boolean;
    pinned: boolean;
    focused: boolean;
  };
  payload: any;             // app-specific data (e.g., dashboard config)
}

// A collection of cards (HyperCard stack)
export interface ParcStack extends ParcObject {
  type: "stack";
  cardIds: string[];
  domain: string;           // "sports" | "classroom" | "nil" | "system" | ...
}

// An app definition (OOP "class" for cards)
export interface ParcApp extends ParcObject {
  type: "app";
  slug: string;             // "sports-multiview", "nil-dashboard", etc.
  icon: string;
  defaultConfig: any;
  // The front-end maps this to a React component
}

// Messages for OOP-style communication
export interface ParcMessage {
  id: string;
  fromId: string;
  toId: string | "broadcast";
  type: string;             // "FOCUS", "UPDATE_DATA", "SUMMARIZE", ...
  payload: any;
  timestamp: string;
}

export type HighlightType = 'score_change' | 'lead_change' | 'run' | 'momentum_reversal' | 'injury' | 'turnover' | 'big_play';

export interface Highlight {
  id: string;
  gameId: string;
  timestamp: string;
  type: HighlightType;
  summary: string;
  teams?: { home: string; away: string };
  value?: string;
  createdAt: string;
  cmfk?: CMFKVector;
  momentum?: {
    delta: number;
    isShift: boolean;
    direction: 'up' | 'down' | 'stable';
  };
}

export interface ParcOSState {
  userCMFK: CMFKVector;
  cards: Record<string, ParcCard>;
  stacks: Record<string, ParcStack>;
  apps: Record<string, ParcApp>;
  messages: ParcMessage[];
  focusedCardId: string | null;
  workspaceName: string;
  activeWorkspace: string | null;        // e.g., 'SPORTS', 'NIL', 'CLASSROOM'
  activeStack: string | null;            // e.g., 'sports', 'nil', 'classroom'
  sportsMode: "default" | "cinema";      // SPORTS workspace mode
  cinemaSideCardId: string | null;       // Sidecard showing BILL analysis
  isBillOpen: boolean;
  minimizedCards: string[];              // IDs of minimized cards
  lastCardPositions: Record<string, { x: number; y: number }>; // For restore
  highlights: Highlight[];
  highlightTimelineScroll: number;
  
  // Actions
  addCard: (card: ParcCard) => void;
  updateCardPosition: (id: string, pos: { x: number; y: number }) => void;
  setFocusedCard: (id: string) => void;
  sendMessage: (msg: ParcMessage) => void;
  createStack: (stack: ParcStack) => void;
  registerApp: (app: ParcApp) => void;
  toggleBill: () => void;
  setBillOpen: (isOpen: boolean) => void;
  minimizeCard: (id: string) => void;
  restoreCard: (id: string) => void;
  setActiveWorkspace: (workspace: string | null, stack: string | null) => void;
  spawnSportsDefaultCards: (stackId: string) => void;
  enterSportsCinema: (cardId: string) => void;
  exitSportsCinema: () => void;
  setSideCardId: (cardId: string | null) => void;
  getVisibleCards: () => ParcCard[];
  addHighlight: (highlight: Highlight) => void;
  getHighlightsByGame: (gameId: string) => Highlight[];
  setHighlightTimelineScroll: (scroll: number) => void;
}
