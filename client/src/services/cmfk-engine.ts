import type { CMFKVector } from '../state/types';

/**
 * CMFK Engine - The "shape brain" of parcOS
 * Tracks cognitive/operational state using four metrics:
 * - c (correctness): 0-1 signal of accuracy/success
 * - m (misconception): 0-1 strength of errors/problems
 * - f (fog): 0-1 uncertainty level
 * - k (knowingness): 0-1 confidence/mastery level
 */

/** Short form CMFK (for engine internal use) */
export type CMFK = { c: number; m: number; f: number; k: number };

/** Event types that affect CMFK state */
export type CMFKEventType = "view" | "hover" | "click" | "success" | "error" | "completion" | "inactivity";

/** An event that modifies CMFK state */
export interface CMFKEvent {
  type: CMFKEventType;
  magnitude?: number; // 0-1, defaults to 0.5
}

/**
 * Clamps a value to the 0-1 range
 */
function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * Updates CMFK state based on an event
 * @param cmfk - Current CMFK state
 * @param event - The event that occurred
 * @returns Updated CMFK state with all values clamped to 0-1
 */
export function updateCMFK(cmfk: CMFK, event: CMFKEvent): CMFK {
  const mag = event.magnitude ?? 0.5;
  let { c, m, f, k } = cmfk;

  switch (event.type) {
    case "view":
    case "hover":
      // Slowly reduce fog, slightly increase knowingness
      f -= 0.02 * mag;
      k += 0.01 * mag;
      break;

    case "click":
      // Reduce fog more, increase knowingness
      f -= 0.03 * mag;
      k += 0.02 * mag;
      break;

    case "success":
    case "completion":
      // Increase correctness and knowingness, reduce fog and misconception
      c += 0.1 * mag;
      k += 0.08 * mag;
      f -= 0.05 * mag;
      m -= 0.05 * mag;
      break;

    case "error":
      // Raise misconception and fog, reduce correctness
      m += 0.08 * mag;
      f += 0.03 * mag;
      c -= 0.03 * mag;
      break;

    case "inactivity":
      // Drift knowingness down slightly, fog up slightly
      k -= 0.01;
      f += 0.01;
      break;
  }

  return {
    c: clamp(c),
    m: clamp(m),
    f: clamp(f),
    k: clamp(k)
  };
}

/**
 * Creates a default CMFK state for new objects
 * @returns Default CMFK with neutral starting values
 */
export function createDefaultCMFK(): CMFK {
  return { c: 0, m: 0, f: 0.5, k: 0.1 };
}

/**
 * Converts short form CMFK to long form CMFKVector
 * @param cmfk - Short form CMFK object
 * @returns CMFKVector with full property names
 */
export function convertToCMFKVector(cmfk: CMFK): CMFKVector {
  return {
    correctness: cmfk.c,
    misconception: cmfk.m,
    fog: cmfk.f,
    knowingness: cmfk.k
  };
}

/**
 * Converts long form CMFKVector to short form CMFK
 * @param vector - CMFKVector with full property names
 * @returns Short form CMFK object
 */
export function convertFromCMFKVector(vector: CMFKVector): CMFK {
  return {
    c: vector.correctness,
    m: vector.misconception,
    f: vector.fog,
    k: vector.knowingness
  };
}

/**
 * Computes priority score from CMFK state
 * High fog or misconception = high priority (needs attention)
 * High knowingness + low fog = low priority (mastered)
 * @param cmfk - Current CMFK state
 * @returns Priority score from 0 (low) to 1 (high)
 */
export function computePriority(cmfk: CMFK): number {
  const { c, m, f, k } = cmfk;
  
  // High priority factors: misconception and fog
  const problemSignal = (m + f) / 2;
  
  // Low priority factors: high knowingness with low fog
  const masterySignal = k * (1 - f);
  
  // Priority is high when problems are present, low when mastery is achieved
  const priority = clamp(problemSignal * 0.6 + (1 - masterySignal) * 0.4 - c * 0.1);
  
  return clamp(priority);
}

/**
 * Generates a human-readable summary of the CMFK state
 * @param cmfk - Current CMFK state
 * @returns Descriptive summary string
 */
export function getCMFKSummary(cmfk: CMFK): string {
  const { c, m, f, k } = cmfk;

  // Check for problem areas first (highest priority)
  if (m > 0.6) {
    return "Problem area (high misconception)";
  }

  // Check for high uncertainty
  if (f > 0.7) {
    return "Needs attention (high fog)";
  }

  // Check for mastery
  if (k > 0.7 && f < 0.3 && m < 0.2) {
    return "Mastered";
  }

  // Check for good progress
  if (k > 0.5 && c > 0.5 && m < 0.3) {
    return "Good progress";
  }

  // Check for learning state
  if (k > 0.3 && f > 0.3 && f < 0.6) {
    return "Learning";
  }

  // Check for early exploration
  if (k < 0.3 && f > 0.4) {
    return "Exploring";
  }

  // Check for struggling
  if (m > 0.3 && c < 0.3) {
    return "Struggling";
  }

  // Default neutral state
  return "In progress";
}

/**
 * CMFK Engine - Unified export object for easy importing
 */
export const cmfkEngine = {
  updateCMFK,
  createDefaultCMFK,
  convertToCMFKVector,
  convertFromCMFKVector,
  computePriority,
  getCMFKSummary
};
