import type { ExecutionContext, SideEffect, ParcTalkValue, ParcTalkObject } from './core';

type SideEffectHandler = (effect: SideEffect) => void;

function parsePosition(args: ParcTalkValue[]): { x?: number; y?: number } {
  if (args.length >= 2 && typeof args[0] === 'number' && typeof args[1] === 'number') {
    return { x: args[0], y: args[1] };
  }
  
  const first = args[0];
  if (typeof first === 'object' && first !== null && !Array.isArray(first)) {
    const obj = first as ParcTalkObject;
    return {
      x: typeof obj.x === 'number' ? obj.x : undefined,
      y: typeof obj.y === 'number' ? obj.y : undefined
    };
  }
  
  return {};
}

function parseSize(args: ParcTalkValue[]): { width?: number; height?: number } {
  if (args.length >= 2 && typeof args[0] === 'number' && typeof args[1] === 'number') {
    return { width: args[0], height: args[1] };
  }
  
  const first = args[0];
  if (typeof first === 'object' && first !== null && !Array.isArray(first)) {
    const obj = first as ParcTalkObject;
    return {
      width: typeof obj.width === 'number' ? obj.width : undefined,
      height: typeof obj.height === 'number' ? obj.height : undefined
    };
  }
  
  return {};
}

export const uiBindings = {
  execute(
    target: string,
    action: string,
    args: ParcTalkValue[],
    context: ExecutionContext,
    addSideEffect: SideEffectHandler
  ): ParcTalkValue {
    
    switch (target) {
      case 'window':
        return this.handleWindow(action, args, context, addSideEffect);
      case 'dock':
        return this.handleDock(action, args, context, addSideEffect);
      case 'set':
        return this.handleSet(action, args, context, addSideEffect);
      case 'open':
        return this.handleOpen(action, args, context, addSideEffect);
      case 'card':
        return this.handleCard(action, args, context, addSideEffect);
      default:
        return null;
    }
  },

  handleWindow(
    action: string,
    args: ParcTalkValue[],
    context: ExecutionContext,
    addSideEffect: SideEffectHandler
  ): ParcTalkValue {
    const cardName = args[0] as string;
    const restArgs = args.slice(1);
    
    switch (action) {
      case 'move': {
        const pos = restArgs[0] as ParcTalkObject | undefined;
        const x = typeof pos?.x === 'number' ? pos.x : undefined;
        const y = typeof pos?.y === 'number' ? pos.y : undefined;
        
        addSideEffect({
          type: 'window_move',
          target: cardName,
          payload: { x, y }
        });
        
        return { moved: cardName, x, y };
      }
      
      case 'resize': {
        const size = parseSize(restArgs);
        
        addSideEffect({
          type: 'window_resize',
          target: cardName,
          payload: size
        });
        
        return { resized: cardName, ...size };
      }
      
      case 'focus': {
        addSideEffect({
          type: 'card_animate',
          target: cardName,
          payload: { animation: 'focus' }
        });
        
        return { focused: cardName };
      }
      
      case 'minimize': {
        addSideEffect({
          type: 'card_close',
          target: cardName,
          payload: { minimize: true }
        });
        
        return { minimized: cardName };
      }
      
      case 'maximize': {
        addSideEffect({
          type: 'window_resize',
          target: cardName,
          payload: { maximize: true }
        });
        
        return { maximized: cardName };
      }
      
      case 'close': {
        addSideEffect({
          type: 'card_close',
          target: cardName,
          payload: { close: true }
        });
        
        return { closed: cardName };
      }
      
      default:
        return null;
    }
  },

  handleDock(
    action: string,
    args: ParcTalkValue[],
    context: ExecutionContext,
    addSideEffect: SideEffectHandler
  ): ParcTalkValue {
    switch (action) {
      case 'highlight': {
        const appId = args[0] as string;
        
        addSideEffect({
          type: 'dock_highlight',
          target: appId,
          payload: { highlight: true }
        });
        
        return { highlighted: appId };
      }
      
      case 'unhighlight': {
        const appId = args[0] as string;
        
        addSideEffect({
          type: 'dock_highlight',
          target: appId,
          payload: { highlight: false }
        });
        
        return { unhighlighted: appId };
      }
      
      case 'bounce': {
        const appId = args[0] as string;
        
        addSideEffect({
          type: 'dock_highlight',
          target: appId,
          payload: { bounce: true }
        });
        
        return { bouncing: appId };
      }
      
      case 'badge': {
        const appId = args[0] as string;
        const count = typeof args[1] === 'number' ? args[1] : 1;
        
        addSideEffect({
          type: 'dock_highlight',
          target: appId,
          payload: { badge: count }
        });
        
        return { badged: appId, count };
      }
      
      default:
        return null;
    }
  },

  handleSet(
    action: string,
    args: ParcTalkValue[],
    context: ExecutionContext,
    addSideEffect: SideEffectHandler
  ): ParcTalkValue {
    switch (action) {
      case 'spatial': {
        const enabled = args[0] === 'on' || args[0] === true || args[0] === 1;
        
        addSideEffect({
          type: 'spatial_toggle',
          payload: { enabled }
        });
        
        return { spatialEnabled: enabled };
      }
      
      case 'workspace': {
        const workspaceName = args[0] as string;
        
        addSideEffect({
          type: 'bill_command',
          target: 'workspace',
          payload: { action: 'switch', workspace: workspaceName }
        });
        
        return { workspace: workspaceName };
      }
      
      case 'theme': {
        const theme = args[0] as string;
        
        addSideEffect({
          type: 'bill_command',
          target: 'system',
          payload: { action: 'setTheme', theme }
        });
        
        return { theme };
      }
      
      case 'focus': {
        const cardId = args[0] as string;
        
        addSideEffect({
          type: 'card_animate',
          target: cardId,
          payload: { animation: 'focus' }
        });
        
        return { focused: cardId };
      }
      
      default:
        return null;
    }
  },

  handleOpen(
    action: string,
    args: ParcTalkValue[],
    context: ExecutionContext,
    addSideEffect: SideEffectHandler
  ): ParcTalkValue {
    switch (action) {
      case 'card': {
        const cardName = args[0] as string;
        
        addSideEffect({
          type: 'card_open',
          target: cardName,
          payload: { cardName }
        });
        
        return { opened: cardName };
      }
      
      case 'browser': {
        const url = args[0] as string;
        
        addSideEffect({
          type: 'card_open',
          target: 'generic-browser',
          payload: { cardName: 'Browser', url }
        });
        
        return { opened: 'browser', url };
      }
      
      case 'bill': {
        addSideEffect({
          type: 'bill_command',
          target: 'bill',
          payload: { action: 'open', isOpen: true }
        });
        
        return { billOpen: true };
      }
      
      default:
        return null;
    }
  },

  handleCard(
    action: string,
    args: ParcTalkValue[],
    context: ExecutionContext,
    addSideEffect: SideEffectHandler
  ): ParcTalkValue {
    const cardId = context.cardId || (args[0] as string);
    
    switch (action) {
      case 'animate': {
        const animation = args[0] as string;
        const options = args[1] as ParcTalkObject | undefined;
        
        addSideEffect({
          type: 'card_animate',
          target: cardId,
          payload: { animation, options: options || {} }
        });
        
        return { animated: animation, cardId };
      }
      
      case 'move': {
        const pos = parsePosition(args);
        
        addSideEffect({
          type: 'card_move',
          target: cardId,
          payload: pos
        });
        
        return { moved: cardId, ...pos };
      }
      
      case 'resize': {
        const size = parseSize(args);
        
        addSideEffect({
          type: 'card_resize',
          target: cardId,
          payload: size
        });
        
        return { resized: cardId, ...size };
      }
      
      case 'pin': {
        addSideEffect({
          type: 'card_animate',
          target: cardId,
          payload: { animation: 'pin' }
        });
        
        return { pinned: cardId };
      }
      
      case 'unpin': {
        addSideEffect({
          type: 'card_animate',
          target: cardId,
          payload: { animation: 'unpin' }
        });
        
        return { unpinned: cardId };
      }
      
      default:
        return null;
    }
  }
};
