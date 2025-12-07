import type { ExecutionContext, SideEffect, ParcTalkValue, ParcTalkObject } from './core';
import type { CMFKVector } from '@/state/types';
import { updateCMFK, convertFromCMFKVector, convertToCMFKVector, getCMFKSummary, computePriority } from '@/services/cmfk-engine';

type SideEffectHandler = (effect: SideEffect) => void;

function parseCMFKDelta(args: ParcTalkValue[]): Partial<CMFKVector> {
  if (args.length === 0) return {};
  
  const first = args[0];
  if (typeof first === 'object' && first !== null && !Array.isArray(first)) {
    const obj = first as ParcTalkObject;
    return {
      correctness: typeof obj.correctness === 'number' ? obj.correctness : undefined,
      misconception: typeof obj.misconception === 'number' ? obj.misconception : undefined,
      fog: typeof obj.fog === 'number' ? obj.fog : undefined,
      knowingness: typeof obj.knowingness === 'number' ? obj.knowingness : undefined,
    };
  }
  
  return {};
}

export const cmfkBindings = {
  execute(
    target: string,
    action: string,
    args: ParcTalkValue[],
    context: ExecutionContext,
    addSideEffect: SideEffectHandler
  ): ParcTalkValue {
    
    switch (target) {
      case 'fog':
        return this.handleFog(action, args, context, addSideEffect);
      case 'meaning':
        return this.handleMeaning(action, args, context, addSideEffect);
      case 'cmfk':
        return this.handleCMFK(action, args, context, addSideEffect);
      default:
        return null;
    }
  },

  handleFog(
    action: string,
    args: ParcTalkValue[],
    context: ExecutionContext,
    addSideEffect: SideEffectHandler
  ): ParcTalkValue {
    switch (action) {
      case 'collapse': {
        const targetCard = args[0] as string | undefined;
        const cmfk = convertFromCMFKVector(context.userCMFK);
        const updated = updateCMFK(cmfk, { type: 'success', magnitude: 0.8 });
        const newVector = convertToCMFKVector(updated);
        
        addSideEffect({
          type: 'cmfk_update',
          target: targetCard || context.cardId,
          payload: { 
            cmfk: newVector,
            operation: 'fog.collapse',
            message: 'Fog collapsed - clarity increased'
          }
        });
        
        return { fog: newVector.fog, collapsed: true };
      }
      
      case 'increase': {
        const amount = typeof args[0] === 'number' ? args[0] : 0.1;
        const newFog = Math.min(1, context.userCMFK.fog + amount);
        
        addSideEffect({
          type: 'cmfk_update',
          target: context.cardId,
          payload: { 
            cmfk: { ...context.userCMFK, fog: newFog },
            operation: 'fog.increase'
          }
        });
        
        return { fog: newFog };
      }
      
      case 'decrease': {
        const amount = typeof args[0] === 'number' ? args[0] : 0.1;
        const newFog = Math.max(0, context.userCMFK.fog - amount);
        
        addSideEffect({
          type: 'cmfk_update',
          target: context.cardId,
          payload: { 
            cmfk: { ...context.userCMFK, fog: newFog },
            operation: 'fog.decrease'
          }
        });
        
        return { fog: newFog };
      }
      
      case 'get':
        return context.userCMFK.fog;
      
      default:
        return null;
    }
  },

  handleMeaning(
    action: string,
    args: ParcTalkValue[],
    context: ExecutionContext,
    addSideEffect: SideEffectHandler
  ): ParcTalkValue {
    switch (action) {
      case 'flow': {
        const flowPath = args[0] as string;
        const [source, destination] = flowPath.split('.');
        
        addSideEffect({
          type: 'cmfk_update',
          target: source,
          payload: {
            operation: 'meaning.flow',
            source,
            destination,
            flowPath,
            message: `Meaning flowing from ${source} to ${destination || 'self'}`
          }
        });
        
        const cmfk = convertFromCMFKVector(context.userCMFK);
        const updated = updateCMFK(cmfk, { type: 'view', magnitude: 0.6 });
        
        return { 
          flowing: true, 
          from: source, 
          to: destination,
          newKnowingness: convertToCMFKVector(updated).knowingness
        };
      }
      
      case 'connect': {
        const sources = args as string[];
        
        addSideEffect({
          type: 'cmfk_update',
          target: 'meaning_network',
          payload: {
            operation: 'meaning.connect',
            sources,
            message: `Connected meaning nodes: ${sources.join(', ')}`
          }
        });
        
        return { connected: sources };
      }
      
      case 'extract': {
        const target = args[0] as string;
        const summary = getCMFKSummary(convertFromCMFKVector(context.userCMFK));
        
        return {
          target,
          summary,
          priority: computePriority(convertFromCMFKVector(context.userCMFK))
        };
      }
      
      default:
        return null;
    }
  },

  handleCMFK(
    action: string,
    args: ParcTalkValue[],
    context: ExecutionContext,
    addSideEffect: SideEffectHandler
  ): ParcTalkValue {
    switch (action) {
      case 'get':
        return context.userCMFK;
      
      case 'set': {
        const delta = parseCMFKDelta(args);
        const newCMFK = { ...context.userCMFK, ...delta };
        
        addSideEffect({
          type: 'cmfk_update',
          target: context.cardId,
          payload: { cmfk: newCMFK, operation: 'cmfk.set' }
        });
        
        return newCMFK;
      }
      
      case 'update': {
        const eventType = args[0] as string;
        const magnitude = typeof args[1] === 'number' ? args[1] : 0.5;
        
        const cmfk = convertFromCMFKVector(context.userCMFK);
        const updated = updateCMFK(cmfk, { 
          type: eventType as any, 
          magnitude 
        });
        const newVector = convertToCMFKVector(updated);
        
        addSideEffect({
          type: 'cmfk_update',
          target: context.cardId,
          payload: { cmfk: newVector, operation: 'cmfk.update', eventType }
        });
        
        return newVector;
      }
      
      case 'priority':
        return computePriority(convertFromCMFKVector(context.userCMFK));
      
      case 'summary':
        return getCMFKSummary(convertFromCMFKVector(context.userCMFK));
      
      default:
        return null;
    }
  }
};
