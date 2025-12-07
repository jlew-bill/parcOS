import { useParcOSStore } from '@/state/store';

export type CommandResult = {
  success: boolean;
  message: string;
  action?: string;
};

type CommandPattern = {
  patterns: RegExp[];
  action: string;
  execute: (match: RegExpMatchArray | null, input: string) => CommandResult;
};

const getStore = () => useParcOSStore.getState();

const commandPatterns: CommandPattern[] = [
  {
    patterns: [
      /\b(arrange|organize|tile)\s*(workspace|cards|windows)?\b/i,
      /\btile\b/i,
      /\bclean\s*up\b/i,
      /\bauto\s*arrange\b/i
    ],
    action: 'tileCards',
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
      /\bstagger\b/i
    ],
    action: 'cascadeCards',
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
      /\beven\s*grid\b/i
    ],
    action: 'gridLayout',
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
      /\bcenter\s*all\b/i
    ],
    action: 'stackCards',
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
      /\bhide\s*(everything|cards)\b/i
    ],
    action: 'minimizeAllCards',
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
      /\bbring\s*back\b/i,
      /\bunhide\b/i,
      /\brestore\s*(cards|windows)?\b/i
    ],
    action: 'restoreAllCards',
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
      /\bfocus\s+(?:on\s+)?(.+)/i,
      /\bshow\s+(?:me\s+)?(?:the\s+)?(.+?)(?:\s+card)?\s*$/i,
      /\bopen\s+(.+?)(?:\s+card)?\s*$/i,
      /\bbring\s+(.+?)\s+(?:to\s+)?(?:front|focus)/i
    ],
    action: 'focusCardByName',
    execute: (match) => {
      if (!match || !match[1]) {
        return { success: false, message: "Please specify which card to focus.", action: 'focusCardByName' };
      }
      const cardName = match[1].trim();
      const result = getStore().focusCardByName(cardName);
      if (!result.found) {
        return { 
          success: false, 
          message: `Couldn't find a card matching "${cardName}".`,
          action: 'focusCardByName'
        };
      }
      return {
        success: true,
        message: `Focused on "${result.title}".`,
        action: 'focusCardByName'
      };
    }
  },
  {
    patterns: [
      /\bsnap\s+(left|right|center)\b/i,
      /\bmove\s+to\s+(left|right|center)\b/i,
      /\b(left|right|center)\s+snap\b/i
    ],
    action: 'snapCurrentCard',
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
      /\bshow\s+(?:me\s+)?(?:nil\s+)?(?:deals?\s+)?(?:for\s+)?(?:athletes?\s+)?(?:from\s+)?(.+?)(?:\s+players?)?\s*$/i,
      /\bhighlight\s+(.+?)(?:\s+athletes?)?\s*$/i,
      /\blink\s+(?:to\s+)?(.+)\b/i,
      /\b(.+?)\s+athletes?\b/i
    ],
    action: 'setHighlightedTeam',
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
      /\bremove\s+(?:team\s+)?link\b/i
    ],
    action: 'clearHighlightedTeam',
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
      /\bconnect\s+cards?\b/i
    ],
    action: 'linkCards',
    execute: () => {
      return {
        success: true,
        message: "To link cards, click a team in the Sports card's Teams tab. This will highlight related NIL deals.",
        action: 'linkCards'
      };
    }
  }
];

export class BillCommandProcessor {
  static process(input: string): CommandResult | null {
    const trimmedInput = input.trim().toLowerCase();
    
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

  static getSuggestions(): Array<{ text: string; command: string }> {
    return [
      { text: 'Arrange workspace', command: 'arrange workspace' },
      { text: 'Grid layout', command: 'grid layout' },
      { text: 'Cascade cards', command: 'cascade' },
      { text: 'Stack cards', command: 'stack cards' },
      { text: 'Minimize all', command: 'close all' },
      { text: 'Show all', command: 'show all' },
      { text: 'Snap left', command: 'snap left' },
      { text: 'Snap right', command: 'snap right' },
      { text: 'Cowboys athletes', command: 'Cowboys athletes' },
      { text: 'Chiefs athletes', command: 'Chiefs athletes' },
      { text: 'Clear link', command: 'clear link' }
    ];
  }

  static isCommand(input: string): boolean {
    return this.process(input) !== null;
  }
}
