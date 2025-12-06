import { CMFKVector } from './types';

export type CMFKUpdateEvent = 
  | { type: "TIME_ON_TASK"; strength?: number }
  | { type: "CONFIRMED_CORRECT"; strength?: number }
  | { type: "MISCONCEPTION_DETECTED"; strength?: number }
  | { type: "CONFUSION_SIGNALED"; strength?: number }
  | { type: "TOOL_CREATED"; strength?: number };

export function updateCMFKVector(prev: CMFKVector, event: CMFKUpdateEvent): CMFKVector {
  const s = event.strength ?? 0.1;
  
  switch (event.type) {
    case "TIME_ON_TASK":
      // Spending time usually reduces fog and slowly increases knowingness
      return {
        ...prev,
        fog: Math.max(0, prev.fog - 0.05 * s),
        knowingness: Math.min(1, prev.knowingness + 0.05 * s),
      };
      
    case "CONFIRMED_CORRECT":
      // Getting something right boosts correctness, reduces misconception and fog
      return {
        ...prev,
        correctness: Math.min(1, prev.correctness + 0.1 * s),
        misconception: Math.max(0, prev.misconception - 0.1 * s),
        fog: Math.max(0, prev.fog - 0.1 * s),
      };
      
    case "MISCONCEPTION_DETECTED":
      // Identifying a misconception increases that metric, might increase fog if user is confused why
      return {
        ...prev,
        misconception: Math.min(1, prev.misconception + 0.15 * s),
        correctness: Math.max(0, prev.correctness - 0.05 * s),
      };

    case "CONFUSION_SIGNALED":
      // User explicitly says they are lost
      return {
        ...prev,
        fog: Math.min(1, prev.fog + 0.2 * s),
        knowingness: Math.max(0, prev.knowingness - 0.05 * s),
      };
      
    case "TOOL_CREATED":
      // Creating a tool implies active mastery (constructionism)
      return {
        ...prev,
        knowingness: Math.min(1, prev.knowingness + 0.15 * s),
        fog: Math.max(0, prev.fog - 0.1 * s),
      };
      
    default:
      return prev;
  }
}

export function aggregateCMFK(vectors: CMFKVector[]): CMFKVector {
  if (vectors.length === 0) {
    return { correctness: 0, misconception: 0, fog: 0, knowingness: 0 };
  }
  
  const sum = vectors.reduce((acc, curr) => ({
    correctness: acc.correctness + curr.correctness,
    misconception: acc.misconception + curr.misconception,
    fog: acc.fog + curr.fog,
    knowingness: acc.knowingness + curr.knowingness,
  }), { correctness: 0, misconception: 0, fog: 0, knowingness: 0 });
  
  return {
    correctness: sum.correctness / vectors.length,
    misconception: sum.misconception / vectors.length,
    fog: sum.fog / vectors.length,
    knowingness: sum.knowingness / vectors.length,
  };
}
