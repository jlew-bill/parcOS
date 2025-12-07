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

export type SnapZoneType = 'left' | 'right' | 'center' | 'top' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'left-third' | 'center-third' | 'right-third';

export interface SnapZoneDefinition {
  x: number | string;
  y: number | string;
  width: string;
  height: string;
}

export const SNAP_ZONE_DEFINITIONS: Record<SnapZoneType, SnapZoneDefinition> = {
  'left': { x: 0, y: 48, width: '50%', height: 'calc(100% - 48px)' },
  'right': { x: '50%', y: 48, width: '50%', height: 'calc(100% - 48px)' },
  'center': { x: '15%', y: '15%', width: '70%', height: '70%' },
  'top': { x: 0, y: 48, width: '100%', height: '35%' },
  'top-left': { x: 0, y: 48, width: '50%', height: 'calc(50% - 24px)' },
  'top-right': { x: '50%', y: 48, width: '50%', height: 'calc(50% - 24px)' },
  'bottom-left': { x: 0, y: 'calc(50% + 24px)', width: '50%', height: 'calc(50% - 24px)' },
  'bottom-right': { x: '50%', y: 'calc(50% + 24px)', width: '50%', height: 'calc(50% - 24px)' },
  'left-third': { x: 0, y: 48, width: '33.333%', height: 'calc(100% - 48px)' },
  'center-third': { x: '33.333%', y: 48, width: '33.333%', height: 'calc(100% - 48px)' },
  'right-third': { x: '66.666%', y: 48, width: '33.333%', height: 'calc(100% - 48px)' }
};

export type HighlightType = 'score_change' | 'lead_change' | 'run' | 'momentum_reversal' | 'injury' | 'turnover' | 'big_play';

export interface CardLink {
  cardIds: string[];
  linkType: string;
}

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
  activeSnapZone: SnapZoneType | null;   // Currently active snap zone
  isDragging: boolean;                    // Whether a card is being dragged
  draggingCardId: string | null;          // ID of card being dragged
  linkedCards: CardLink[];               // Cross-card linking state
  highlightedTeam: string | null;        // Currently highlighted team for NIL/Sports linking
  
  // Global cinema mode (independent of SPORTS cinema)
  cinemaCardId: string | null;           // Card currently in cinema mode
  cinemaOriginalState: {                  // Saved state for restoring after cinema exit
    position: { x: number; y: number; z: number };
    size: { width: number; height: number };
  } | null;
  
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
  loadHighlightsFromApi: (gameId?: string) => Promise<void>;
  saveWorkspaceState: (workspaceName: string, stackId: string) => Promise<void>;
  loadWorkspaceState: (workspaceName: string, stackId: string) => Promise<boolean>;
  setActiveSnapZone: (zone: SnapZoneType | null) => void;
  setDragging: (isDragging: boolean, cardId: string | null) => void;
  snapCardToZone: (cardId: string, zone: SnapZoneType) => void;
  
  // BILL window management actions
  tileCards: () => { count: number; cols: number; rows: number };
  cascadeCards: () => { count: number };
  gridLayout: () => { count: number; cols: number; rows: number };
  stackCards: () => { count: number };
  minimizeAllCards: () => { count: number };
  restoreAllCards: () => { count: number };
  focusCardByName: (name: string) => { found: boolean; cardId?: string; title?: string };
  snapCurrentCard: (zone: 'left' | 'right' | 'center') => { success: boolean; cardId?: string };
  closeCard: (id: string) => void;
  updateCardSize: (id: string, size: { width: number; height: number }) => void;
  
  // Card linking actions
  linkCards: (cardId1: string, cardId2: string, linkType: string) => void;
  unlinkCards: (cardId1: string, cardId2: string) => void;
  getLinkedCards: (cardId: string) => string[];
  setHighlightedTeam: (team: string | null) => void;
  
  // Global cinema mode actions (QuickLook-style)
  enterCinema: (cardId: string) => void;
  exitCinema: () => void;
}
