import { useParcOSStore } from '@/state/store';
import { appRegistry } from '@/services/app-registry';
import { nanoid } from 'nanoid';
import type { CMFKVector, ParcCard } from '@/state/types';

export type CommandResult = {
  success: boolean;
  message: string;
  action?: string;
  data?: any;
};

type CommandPattern = {
  patterns: RegExp[];
  action: string;
  execute: (match: RegExpMatchArray | null, input: string) => CommandResult;
  category?: 'organizational' | 'app-launch' | 'recovery' | 'query' | 'utility';
};

type ScoredSuggestion = {
  text: string;
  command: string;
  score: number;
  category?: string;
};

const getStore = () => useParcOSStore.getState();

export function fuzzyMatch(input: string, target: string): number {
  if (!input || !target) return 0;
  
  const inputLower = input.toLowerCase().trim();
  const targetLower = target.toLowerCase().trim();
  
  if (inputLower === targetLower) return 1;
  if (targetLower.includes(inputLower)) {
    return 0.8 + (0.2 * (inputLower.length / targetLower.length));
  }
  if (inputLower.includes(targetLower)) {
    return 0.7 + (0.2 * (targetLower.length / inputLower.length));
  }
  
  const distance = levenshteinDistance(inputLower, targetLower);
  const maxLen = Math.max(inputLower.length, targetLower.length);
  
  if (maxLen === 0) return 1;
  
  const normalizedDistance = distance / maxLen;
  const score = Math.max(0, 1 - normalizedDistance);
  
  let bonus = 0;
  if (targetLower.startsWith(inputLower.substring(0, 3))) {
    bonus += 0.1;
  }
  
  const inputWords = inputLower.split(/\s+/);
  const targetWords = targetLower.split(/\s+/);
  const matchingWords = inputWords.filter(w => 
    targetWords.some(tw => tw.includes(w) || w.includes(tw))
  );
  bonus += 0.05 * matchingWords.length;
  
  return Math.min(1, score + bonus);
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

function findBestAppMatch(query: string): { appId: string; appName: string; score: number } | null {
  const apps = appRegistry.getAll();
  let bestMatch: { appId: string; appName: string; score: number } | null = null;
  
  const aliases: Record<string, string[]> = {
    'sports-multiview': ['sports', 'multiview', 'games', 'live'],
    'nil-dashboard': ['nil', 'deals', 'athletes', 'endorsements'],
    'classroom-board': ['classroom', 'class', 'board', 'education', 'learning'],
    'generic-browser': ['browser', 'web', 'internet'],
    'creator-studio': ['creator', 'studio', 'video', 'content'],
    'system-tools': ['system', 'tools', 'settings', 'config']
  };
  
  for (const app of apps) {
    let score = fuzzyMatch(query, app.name);
    
    const appAliases = aliases[app.id] || [];
    for (const alias of appAliases) {
      const aliasScore = fuzzyMatch(query, alias);
      if (aliasScore > score) {
        score = aliasScore * 0.95;
      }
    }
    
    const idScore = fuzzyMatch(query, app.id.replace(/-/g, ' '));
    if (idScore > score) {
      score = idScore * 0.9;
    }
    
    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { appId: app.id, appName: app.name, score };
    }
  }
  
  return bestMatch && bestMatch.score >= 0.4 ? bestMatch : null;
}

function createCardFromApp(appId: string): ParcCard | null {
  const app = appRegistry.get(appId);
  if (!app) return null;
  
  const offsetX = (Math.random() - 0.5) * 100;
  const offsetY = (Math.random() - 0.5) * 100;
  const centerX = (window.innerWidth - app.defaultSize.width) / 2 + offsetX;
  const centerY = (window.innerHeight - app.defaultSize.height) / 2 + offsetY;
  
  const store = getStore();
  const existingCards = Object.values(store.cards);
  const maxZ = existingCards.length > 0 
    ? Math.max(...existingCards.map(c => c.position.z)) + 1 
    : 10;
  
  const newCard: ParcCard = {
    id: nanoid(),
    type: 'card',
    title: app.name,
    appId: app.id,
    stackId: store.activeStack || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    cmfk: { correctness: 0, misconception: 0, fog: 0.5, knowingness: 0.1 },
    metadata: { workspace: store.activeWorkspace || 'default' },
    position: { x: centerX, y: centerY, z: maxZ },
    size: { width: app.defaultSize.width, height: app.defaultSize.height },
    layoutState: { minimized: false, pinned: false, focused: true },
    payload: {}
  };
  
  return newCard;
}

const commandPatterns: CommandPattern[] = [
  {
    patterns: [
      /\b(?:can\s+you\s+)?(arrange|organize|tile)\s*(my\s+)?(workspace|cards|windows)?\b/i,
      /\btile\b/i,
      /\bclean\s*up\b/i,
      /\bauto\s*arrange\b/i,
      /\bplease\s+(?:arrange|organize)\b/i,
      /\btidy\s*(?:up)?\b/i,
      /\bsort\s*(?:my\s+)?cards?\b/i
    ],
    action: 'tileCards',
    category: 'organizational',
    execute: () => {
      const result = getStore().tileCards();
      if (result.count === 0) {
        return { success: false, message: "No cards to arrange.", action: 'tileCards' };
      }
      return {
        success: true,
        message: `Done! I've arranged your ${result.count} cards in a ${result.cols}x${result.rows} grid.`,
        action: 'tileCards'
      };
    }
  },
  {
    patterns: [
      /\bcascade\b/i,
      /\bwaterfall\b/i,
      /\bstagger\b/i,
      /\bdiagonal\s*layout\b/i,
      /\bstaircase\b/i
    ],
    action: 'cascadeCards',
    category: 'organizational',
    execute: () => {
      const result = getStore().cascadeCards();
      if (result.count === 0) {
        return { success: false, message: "No cards to cascade.", action: 'cascadeCards' };
      }
      return {
        success: true,
        message: `Cascaded ${result.count} cards in a staircase pattern.`,
        action: 'cascadeCards'
      };
    }
  },
  {
    patterns: [
      /\bgrid\s*(layout)?\b/i,
      /\bgrid\s*view\b/i,
      /\beven\s*grid\b/i,
      /\bmake\s*(?:a\s+)?grid\b/i,
      /\balign\s*(?:to\s+)?grid\b/i
    ],
    action: 'gridLayout',
    category: 'organizational',
    execute: () => {
      const result = getStore().gridLayout();
      if (result.count === 0) {
        return { success: false, message: "No cards to arrange in grid.", action: 'gridLayout' };
      }
      return {
        success: true,
        message: `Arranged ${result.count} cards in a ${result.cols}x${result.rows} grid layout.`,
        action: 'gridLayout'
      };
    }
  },
  {
    patterns: [
      /\bstack\s*(cards|all)?\b/i,
      /\bpile\s*(up)?\b/i,
      /\bcenter\s*all\b/i,
      /\bgroup\s*together\b/i,
      /\bconsolidate\b/i
    ],
    action: 'stackCards',
    category: 'organizational',
    execute: () => {
      const result = getStore().stackCards();
      if (result.count === 0) {
        return { success: false, message: "No cards to stack.", action: 'stackCards' };
      }
      return {
        success: true,
        message: `Stacked ${result.count} cards in the center.`,
        action: 'stackCards'
      };
    }
  },
  {
    patterns: [
      /\b(close|minimize|hide)\s*all\b/i,
      /\bclear\s*(workspace|desktop|screen)\b/i,
      /\bhide\s*(everything|cards)\b/i,
      /\bput\s+(?:them\s+)?away\b/i,
      /\bclean\s+slate\b/i
    ],
    action: 'minimizeAllCards',
    category: 'organizational',
    execute: () => {
      const result = getStore().minimizeAllCards();
      if (result.count === 0) {
        return { success: false, message: "No cards to minimize.", action: 'minimizeAllCards' };
      }
      return {
        success: true,
        message: `Minimized ${result.count} cards. Your workspace is clear.`,
        action: 'minimizeAllCards'
      };
    }
  },
  {
    patterns: [
      /\b(show|restore|open)\s*all\b/i,
      /\bbring\s*(?:them\s+)?back\b/i,
      /\bunhide\b/i,
      /\brestore\s*(cards|windows)?\b/i,
      /\bget\s+(?:my\s+)?cards?\s+back\b/i,
      /\bundo\s+minimize\b/i
    ],
    action: 'restoreAllCards',
    category: 'recovery',
    execute: () => {
      const result = getStore().restoreAllCards();
      if (result.count === 0) {
        return { success: false, message: "No minimized cards to restore.", action: 'restoreAllCards' };
      }
      return {
        success: true,
        message: `Restored ${result.count} cards to your workspace.`,
        action: 'restoreAllCards'
      };
    }
  },
  {
    patterns: [
      /\b(?:launch|create|new|start)\s+(.+?)(?:\s+card|\s+app)?\s*$/i,
      /\bopen\s+(?:a\s+)?(?:new\s+)?(.+?)(?:\s+card|\s+app)?\s*$/i,
      /\bspawn\s+(.+)\b/i,
      /\badd\s+(?:a\s+)?(?:new\s+)?(.+?)(?:\s+card)?\s*$/i
    ],
    action: 'launchApp',
    category: 'app-launch',
    execute: (match) => {
      if (!match || !match[1]) {
        return { success: false, message: "Please specify which app to launch.", action: 'launchApp' };
      }
      
      const query = match[1].trim();
      
      const skipWords = ['card', 'cards', 'all', 'everything', 'them', 'workspace'];
      if (skipWords.includes(query.toLowerCase())) {
        return { success: false, message: "Please specify an app name like 'sports', 'nil dashboard', or 'classroom'.", action: 'launchApp' };
      }
      
      const appMatch = findBestAppMatch(query);
      if (!appMatch) {
        const apps = appRegistry.getAll();
        const appNames = apps.map(a => a.name).join(', ');
        return { 
          success: false, 
          message: `Couldn't find an app matching "${query}". Available apps: ${appNames}`,
          action: 'launchApp'
        };
      }
      
      const newCard = createCardFromApp(appMatch.appId);
      if (!newCard) {
        return { success: false, message: `Failed to create card for ${appMatch.appName}.`, action: 'launchApp' };
      }
      
      getStore().addCard(newCard);
      getStore().setFocusedCard(newCard.id);
      
      return {
        success: true,
        message: `Launched ${appMatch.appName}!`,
        action: 'launchApp',
        data: { cardId: newCard.id, appId: appMatch.appId }
      };
    }
  },
  {
    patterns: [
      /\bfocus\s+(?:on\s+)?(.+)/i,
      /\bswitch\s+(?:to\s+)?(.+?)(?:\s+card)?\s*$/i,
      /\bgo\s+to\s+(.+?)(?:\s+card)?\s*$/i,
      /\bbring\s+(.+?)\s+(?:to\s+)?(?:front|focus)/i
    ],
    action: 'focusCardByName',
    category: 'utility',
    execute: (match) => {
      if (!match || !match[1]) {
        return { success: false, message: "Please specify which card to focus.", action: 'focusCardByName' };
      }
      const cardName = match[1].trim();
      
      const store = getStore();
      const cards = Object.values(store.cards).filter(c => !c.layoutState.minimized);
      
      let bestMatch: { card: ParcCard; score: number } | null = null;
      for (const card of cards) {
        const titleScore = fuzzyMatch(cardName, card.title);
        const appScore = card.appId ? fuzzyMatch(cardName, card.appId.replace(/-/g, ' ')) : 0;
        const score = Math.max(titleScore, appScore * 0.9);
        
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { card, score };
        }
      }
      
      if (!bestMatch || bestMatch.score < 0.35) {
        return { 
          success: false, 
          message: `Couldn't find a card matching "${cardName}".`,
          action: 'focusCardByName'
        };
      }
      
      store.setFocusedCard(bestMatch.card.id);
      return {
        success: true,
        message: `Focused on "${bestMatch.card.title}".`,
        action: 'focusCardByName'
      };
    }
  },
  {
    patterns: [
      /\bsnap\s+(left|right|center)\b/i,
      /\bmove\s+(?:(?:the\s+)?card\s+)?to\s+(?:the\s+)?(left|right|center)\b/i,
      /\b(left|right|center)\s+snap\b/i,
      /\bput\s+(?:it\s+)?(?:on\s+)?(?:the\s+)?(left|right|center)\b/i
    ],
    action: 'snapCurrentCard',
    category: 'utility',
    execute: (match) => {
      if (!match) {
        return { success: false, message: "Please specify a snap zone: left, right, or center.", action: 'snapCurrentCard' };
      }
      const zone = (match[1]?.toLowerCase() || 'center') as 'left' | 'right' | 'center';
      const result = getStore().snapCurrentCard(zone);
      if (!result.success) {
        return { 
          success: false, 
          message: "No card is currently focused. Click on a card first.",
          action: 'snapCurrentCard'
        };
      }
      return {
        success: true,
        message: `Snapped the current card to the ${zone}.`,
        action: 'snapCurrentCard'
      };
    }
  },
  {
    patterns: [
      /\bwhat\s+(?:cards?\s+)?(?:are\s+)?open\b/i,
      /\blist\s+(?:open\s+)?cards?\b/i,
      /\bshow\s+(?:me\s+)?(?:all\s+)?(?:my\s+)?cards?\b/i,
      /\bwhich\s+cards?\s+(?:are\s+)?(?:open|visible)\b/i,
      /\bhow\s+many\s+cards?\b/i
    ],
    action: 'listOpenCards',
    category: 'query',
    execute: () => {
      const store = getStore();
      const visibleCards = store.getVisibleCards();
      
      if (visibleCards.length === 0) {
        return {
          success: true,
          message: "No cards are currently open. Try saying 'launch sports' or 'new classroom' to create one.",
          action: 'listOpenCards',
          data: { cards: [] }
        };
      }
      
      const cardList = visibleCards.map(c => c.title).join(', ');
      const focusedCard = store.focusedCardId ? store.cards[store.focusedCardId] : null;
      const focusedNote = focusedCard ? ` (${focusedCard.title} is focused)` : '';
      
      return {
        success: true,
        message: `You have ${visibleCards.length} card${visibleCards.length === 1 ? '' : 's'} open: ${cardList}${focusedNote}`,
        action: 'listOpenCards',
        data: { cards: visibleCards.map(c => ({ id: c.id, title: c.title, appId: c.appId })) }
      };
    }
  },
  {
    patterns: [
      /\bshow\s+(?:me\s+)?(?:the\s+)?workspace\b/i,
      /\bdescribe\s+(?:the\s+)?workspace\b/i,
      /\bworkspace\s+(?:status|info)\b/i,
      /\bwhat(?:'s|s)?\s+(?:the\s+)?(?:current\s+)?workspace\b/i,
      /\bwhere\s+am\s+i\b/i
    ],
    action: 'showWorkspace',
    category: 'query',
    execute: () => {
      const store = getStore();
      const visibleCards = store.getVisibleCards();
      const minimizedCount = store.minimizedCards.length;
      const workspace = store.activeWorkspace || 'Default';
      const focusedCard = store.focusedCardId ? store.cards[store.focusedCardId] : null;
      
      let description = `You're in the ${workspace} workspace with ${visibleCards.length} visible card${visibleCards.length === 1 ? '' : 's'}`;
      
      if (minimizedCount > 0) {
        description += ` and ${minimizedCount} minimized`;
      }
      
      if (focusedCard) {
        description += `. Currently focused on: ${focusedCard.title}`;
      }
      
      return {
        success: true,
        message: description + '.',
        action: 'showWorkspace',
        data: { 
          workspace, 
          visibleCount: visibleCards.length, 
          minimizedCount,
          focusedCard: focusedCard?.title 
        }
      };
    }
  },
  {
    patterns: [
      /\bwhat(?:'s|s)?\s+focused\b/i,
      /\bwhich\s+card\s+(?:is\s+)?(?:focused|selected|active)\b/i,
      /\bcurrent\s+card\b/i,
      /\bactive\s+card\b/i,
      /\bwhat\s+(?:am\s+)?i\s+(?:looking\s+at|viewing)\b/i
    ],
    action: 'whatsFocused',
    category: 'query',
    execute: () => {
      const store = getStore();
      const focusedCard = store.focusedCardId ? store.cards[store.focusedCardId] : null;
      
      if (!focusedCard) {
        return {
          success: true,
          message: "No card is currently focused. Click on a card or say 'focus on [card name]'.",
          action: 'whatsFocused',
          data: { focused: null }
        };
      }
      
      const app = focusedCard.appId ? appRegistry.get(focusedCard.appId) : null;
      const appInfo = app ? ` (${app.name} app)` : '';
      
      return {
        success: true,
        message: `Currently focused on: ${focusedCard.title}${appInfo}`,
        action: 'whatsFocused',
        data: { focused: { id: focusedCard.id, title: focusedCard.title, appId: focusedCard.appId } }
      };
    }
  },
  {
    patterns: [
      /\blist\s+apps?\b/i,
      /\bwhat\s+apps?\s+(?:do\s+)?(?:i\s+)?have\b/i,
      /\bshow\s+(?:me\s+)?(?:available\s+)?apps?\b/i,
      /\bavailable\s+apps?\b/i,
      /\bwhat\s+(?:can\s+i|apps?\s+can\s+i)\s+(?:open|launch|use)\b/i
    ],
    action: 'listApps',
    category: 'query',
    execute: () => {
      const apps = appRegistry.getAll();
      const appList = apps.map(a => `${a.name} (${a.category})`).join(', ');
      
      return {
        success: true,
        message: `Available apps: ${appList}. Say 'launch [app name]' to open one.`,
        action: 'listApps',
        data: { apps: apps.map(a => ({ id: a.id, name: a.name, category: a.category, icon: a.icon })) }
      };
    }
  },
  {
    patterns: [
      /\bhelp\b/i,
      /\bwhat\s+can\s+(?:you|i)\s+(?:do|say)\b/i,
      /\bcommands?\b/i,
      /\bshow\s+(?:me\s+)?(?:all\s+)?(?:available\s+)?commands?\b/i,
      /\boptions?\b/i,
      /\bwhat\s+(?:are\s+)?(?:my\s+)?options?\b/i
    ],
    action: 'showHelp',
    category: 'utility',
    execute: () => {
      const helpText = `Here's what I can do:

**Organization**: "arrange workspace", "grid layout", "cascade", "stack cards"
**Window Management**: "minimize all", "restore all", "snap left/right/center"
**Launch Apps**: "launch sports", "new classroom", "open nil dashboard"
**Focus**: "focus on [card name]", "switch to [card]"
**Queries**: "what cards are open", "show workspace", "list apps", "what's focused"
**Team Linking**: "[team name] athletes", "clear link"

Just type naturally - I understand conversational phrasing too!`;

      return {
        success: true,
        message: helpText,
        action: 'showHelp'
      };
    }
  },
  {
    patterns: [
      /\bshow\s+(?:me\s+)?(?:nil\s+)?(?:deals?\s+)?(?:for\s+)?(?:athletes?\s+)?(?:from\s+)?(.+?)(?:\s+players?)?\s*$/i,
      /\bhighlight\s+(.+?)(?:\s+athletes?)?\s*$/i,
      /\blink\s+(?:to\s+)?(.+)\b/i,
      /\b(.+?)\s+athletes?\b/i
    ],
    action: 'setHighlightedTeam',
    category: 'utility',
    execute: (match) => {
      if (!match || !match[1]) {
        return { success: false, message: "Please specify a team name.", action: 'setHighlightedTeam' };
      }
      const teamName = match[1].trim();
      const knownTeams = ['Kansas City Chiefs', 'Los Angeles Lakers', 'Ohio State', 'Dallas Cowboys', 'Chiefs', 'Lakers', 'Cowboys'];
      const matchedTeam = knownTeams.find(t => 
        t.toLowerCase().includes(teamName.toLowerCase()) || 
        teamName.toLowerCase().includes(t.toLowerCase())
      );
      
      if (matchedTeam) {
        getStore().setHighlightedTeam(matchedTeam);
        return {
          success: true,
          message: `Linked NIL deals to ${matchedTeam}. Check the NIL Dashboard for matching athletes.`,
          action: 'setHighlightedTeam'
        };
      }
      
      getStore().setHighlightedTeam(teamName);
      return {
        success: true,
        message: `Highlighting NIL deals for "${teamName}".`,
        action: 'setHighlightedTeam'
      };
    }
  },
  {
    patterns: [
      /\bclear\s+(?:team\s+)?(?:link|highlight)(?:s|ing)?\b/i,
      /\bunlink\s+(?:nil|team|cards?)?\b/i,
      /\bremove\s+(?:team\s+)?link\b/i,
      /\breset\s+(?:team\s+)?(?:link|filter)s?\b/i
    ],
    action: 'clearHighlightedTeam',
    category: 'recovery',
    execute: () => {
      getStore().setHighlightedTeam(null);
      return {
        success: true,
        message: "Cleared team linking. NIL Dashboard now showing all deals.",
        action: 'clearHighlightedTeam'
      };
    }
  },
  {
    patterns: [
      /\blink\s+cards?\b/i,
      /\bconnect\s+cards?\b/i,
      /\bhow\s+(?:do\s+)?(?:i\s+)?link\b/i
    ],
    action: 'linkCards',
    category: 'utility',
    execute: () => {
      return {
        success: true,
        message: "To link cards, click a team in the Sports card's Teams tab. This will highlight related NIL deals.",
        action: 'linkCards'
      };
    }
  }
];

const baseSuggestions: Array<{ text: string; command: string; category: string; baseScore: number }> = [
  { text: 'Arrange workspace', command: 'arrange workspace', category: 'organizational', baseScore: 0.7 },
  { text: 'Grid layout', command: 'grid layout', category: 'organizational', baseScore: 0.7 },
  { text: 'Cascade cards', command: 'cascade', category: 'organizational', baseScore: 0.6 },
  { text: 'Stack cards', command: 'stack cards', category: 'organizational', baseScore: 0.6 },
  { text: 'Minimize all', command: 'close all', category: 'organizational', baseScore: 0.5 },
  { text: 'Restore all', command: 'show all', category: 'recovery', baseScore: 0.5 },
  { text: 'Snap left', command: 'snap left', category: 'utility', baseScore: 0.4 },
  { text: 'Snap right', command: 'snap right', category: 'utility', baseScore: 0.4 },
  { text: 'Launch Sports', command: 'launch sports', category: 'app-launch', baseScore: 0.6 },
  { text: 'Launch NIL Dashboard', command: 'launch nil dashboard', category: 'app-launch', baseScore: 0.6 },
  { text: 'Launch Classroom', command: 'launch classroom', category: 'app-launch', baseScore: 0.6 },
  { text: 'What cards are open', command: 'what cards are open', category: 'query', baseScore: 0.5 },
  { text: 'Show workspace', command: 'show workspace', category: 'query', baseScore: 0.5 },
  { text: 'List apps', command: 'list apps', category: 'query', baseScore: 0.5 },
  { text: 'Help', command: 'help', category: 'utility', baseScore: 0.8 },
  { text: 'Cowboys athletes', command: 'Cowboys athletes', category: 'utility', baseScore: 0.4 },
  { text: 'Chiefs athletes', command: 'Chiefs athletes', category: 'utility', baseScore: 0.4 },
  { text: 'Clear link', command: 'clear link', category: 'recovery', baseScore: 0.4 }
];

export class BillCommandProcessor {
  static process(input: string): CommandResult | null {
    const trimmedInput = input.trim();
    
    if (!trimmedInput) {
      return null;
    }

    for (const command of commandPatterns) {
      for (const pattern of command.patterns) {
        const match = input.match(pattern);
        if (match) {
          return command.execute(match, input);
        }
      }
    }

    return null;
  }

  static getSuggestions(userCMFK?: CMFKVector): ScoredSuggestion[] {
    const suggestions = baseSuggestions.map(s => ({
      text: s.text,
      command: s.command,
      category: s.category,
      score: s.baseScore
    }));

    if (!userCMFK) {
      return suggestions.sort((a, b) => b.score - a.score);
    }

    const { fog, knowingness, misconception } = userCMFK;

    for (const suggestion of suggestions) {
      let contextBonus = 0;

      if (fog > 0.5) {
        if (suggestion.category === 'organizational') {
          contextBonus += 0.3 * fog;
        }
        if (suggestion.text.toLowerCase().includes('arrange') || 
            suggestion.text.toLowerCase().includes('grid')) {
          contextBonus += 0.2;
        }
      }

      if (knowingness > 0.5) {
        if (suggestion.category === 'app-launch') {
          contextBonus += 0.3 * knowingness;
        }
        if (suggestion.category === 'query') {
          contextBonus += 0.15 * knowingness;
        }
      }

      if (misconception > 0.4) {
        if (suggestion.category === 'recovery') {
          contextBonus += 0.35 * misconception;
        }
        if (suggestion.command.includes('clear') || suggestion.command.includes('restore')) {
          contextBonus += 0.2;
        }
        if (suggestion.text === 'Help') {
          contextBonus += 0.25 * misconception;
        }
      }

      if (fog > 0.7 && suggestion.text === 'Help') {
        contextBonus += 0.3;
      }

      suggestion.score = Math.min(1, suggestion.score + contextBonus);
    }

    return suggestions.sort((a, b) => b.score - a.score);
  }

  static isCommand(input: string): boolean {
    return this.process(input) !== null;
  }

  static fuzzyMatchCard(input: string): { cardId: string; title: string; score: number } | null {
    const store = getStore();
    const cards = Object.values(store.cards).filter(c => !c.layoutState.minimized);
    
    let bestMatch: { cardId: string; title: string; score: number } | null = null;
    
    for (const card of cards) {
      const score = fuzzyMatch(input, card.title);
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { cardId: card.id, title: card.title, score };
      }
    }
    
    return bestMatch && bestMatch.score >= 0.35 ? bestMatch : null;
  }
}
