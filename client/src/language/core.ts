import type { CMFKVector } from '@/state/types';

export type ParcTalkValue = 
  | string 
  | number 
  | boolean 
  | null 
  | undefined
  | ParcTalkObject 
  | CMFKVector
  | ParcTalkValue[]
  | Record<string, unknown>;

export interface ParcTalkObject {
  [key: string]: ParcTalkValue | undefined;
}

export interface ParcTalkToken {
  type: 'keyword' | 'identifier' | 'string' | 'number' | 'operator' | 'punctuation' | 'newline';
  value: string;
  line: number;
  column: number;
}

export interface ParcTalkNode {
  type: string;
  [key: string]: any;
}

export interface CardNode extends ParcTalkNode {
  type: 'card';
  name: string;
  body: ParcTalkNode[];
}

export interface CommandNode extends ParcTalkNode {
  type: 'command';
  target?: string;
  action: string;
  args: ParcTalkValue[];
}

export interface PropertyNode extends ParcTalkNode {
  type: 'property';
  name: string;
  value: ParcTalkValue;
}

export interface AnimateNode extends ParcTalkNode {
  type: 'animate';
  animation: string;
  target?: string;
  options?: ParcTalkObject;
}

export interface FlowNode extends ParcTalkNode {
  type: 'flow';
  source: string;
  destination?: string;
}

export interface ParcTalkProgram {
  type: 'program';
  statements: ParcTalkNode[];
}

export const KEYWORDS = [
  'card', 'window', 'dock', 'spatial',
  'open', 'close', 'animate', 'move', 'resize',
  'set', 'get', 'flow', 'collapse', 'highlight',
  'if', 'else', 'while', 'for', 'return',
  'fog', 'meaning', 'cmfk', 'bill'
] as const;

export type Keyword = typeof KEYWORDS[number];

export const OPERATORS = [
  '.', ':', '=', '==', '!=', '<', '>', '<=', '>=',
  '+', '-', '*', '/', '%',
  '&&', '||', '!',
  '=>'
] as const;

export const PUNCTUATION = [
  '{', '}', '(', ')', '[', ']', ',', ';'
] as const;

export interface ExecutionContext {
  cardId?: string;
  workspaceId?: string;
  userCMFK: CMFKVector;
  variables: Map<string, ParcTalkValue>;
  sandbox: boolean;
}

export function createDefaultContext(): ExecutionContext {
  return {
    variables: new Map(),
    userCMFK: { correctness: 0, misconception: 0, fog: 0.5, knowingness: 0.1 },
    sandbox: true
  };
}

export interface ExecutionResult {
  success: boolean;
  value?: ParcTalkValue;
  error?: string;
  sideEffects: SideEffect[];
}

export interface SideEffect {
  type: 'card_open' | 'card_close' | 'card_move' | 'card_resize' | 'card_animate' |
        'window_move' | 'window_resize' | 'dock_highlight' |
        'spatial_toggle' | 'cmfk_update' | 'bill_command' | 'log';
  target?: string;
  payload: ParcTalkObject;
}

export function isKeyword(value: string): value is Keyword {
  return KEYWORDS.includes(value as Keyword);
}

export function isOperator(value: string): boolean {
  return OPERATORS.includes(value as any);
}

export function isPunctuation(char: string): boolean {
  return PUNCTUATION.includes(char as any);
}
