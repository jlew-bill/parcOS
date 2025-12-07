export * from './core';
export * from './interpreter';
export * from './runtime';
export { cmfkBindings } from './shapes';
export { billBindings } from './bill-api';
export { uiBindings } from './ui-api';

import { createRuntime, runScript, runScriptUnsafe, type ParcTalkRuntime } from './runtime';
import { parseScript } from './interpreter';
import { 
  type ExecutionContext, 
  type ExecutionResult, 
  type ParcTalkProgram,
  createDefaultContext 
} from './core';
import { useParcOSStore } from '@/state/store';

export class ParcTalk {
  private runtime: ParcTalkRuntime;
  
  constructor(context?: Partial<ExecutionContext>) {
    this.runtime = createRuntime(context);
  }
  
  run(source: string): ExecutionResult {
    return this.runtime.execute(source);
  }
  
  parse(source: string): ParcTalkProgram {
    return parseScript(source);
  }
  
  applySideEffects(result: ExecutionResult): void {
    if (!result.success) return;
    
    const store = useParcOSStore.getState();
    
    for (const effect of result.sideEffects) {
      this.applySideEffect(effect, store);
    }
  }
  
  private applySideEffect(effect: any, store: ReturnType<typeof useParcOSStore.getState>): void {
    switch (effect.type) {
      case 'card_open':
        console.log('[ParcTalk] Opening card:', effect.target);
        break;
      
      case 'card_close':
        if (effect.target) {
          const card = Object.values(store.cards).find(c => 
            c.title === effect.target || c.id === effect.target
          );
          if (card) {
            if (effect.payload.minimize) {
              store.minimizeCard(card.id);
            }
          }
        }
        break;
      
      case 'card_animate':
        console.log('[ParcTalk] Animating card:', effect.target, effect.payload.animation);
        break;
      
      case 'spatial_toggle':
        store.setSpatialEnabled(effect.payload.enabled);
        break;
      
      case 'bill_command':
        if (effect.payload.action === 'open') {
          store.setBillOpen(true);
        } else if (effect.payload.action === 'close') {
          store.setBillOpen(false);
        } else if (effect.payload.action === 'toggle') {
          store.toggleBill();
        } else if (effect.payload.action === 'gridLayout') {
          store.gridLayout();
        } else if (effect.payload.action === 'cascadeCards') {
          store.cascadeCards();
        } else if (effect.payload.action === 'stackCards') {
          store.stackCards();
        } else if (effect.payload.action === 'tileCards') {
          store.tileCards();
        }
        break;
      
      case 'cmfk_update':
        if (effect.payload.cmfk) {
          console.log('[ParcTalk] CMFK update:', effect.payload.cmfk);
        }
        break;
      
      case 'dock_highlight':
        console.log('[ParcTalk] Dock highlight:', effect.target, effect.payload.highlight);
        break;
      
      case 'log':
        console.log('[ParcTalk]', effect.payload.message);
        break;
    }
  }
  
  getContext(): ExecutionContext {
    return this.runtime.getContext();
  }
}

export function createParcTalk(context?: Partial<ExecutionContext>): ParcTalk {
  return new ParcTalk(context);
}

export function executeScript(source: string): ExecutionResult {
  const parctalk = createParcTalk();
  const result = parctalk.run(source);
  parctalk.applySideEffects(result);
  return result;
}

export { createRuntime, runScript, runScriptUnsafe, createDefaultContext };
