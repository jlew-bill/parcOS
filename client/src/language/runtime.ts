import { 
  type ExecutionContext, 
  type ExecutionResult, 
  type SideEffect,
  type ParcTalkNode,
  type ParcTalkProgram,
  type ParcTalkValue,
  type CardNode,
  type CommandNode,
  type AnimateNode,
  createDefaultContext
} from './core';
import { parseScript } from './interpreter';
import { cmfkBindings } from './shapes';
import { billBindings } from './bill-api';
import { uiBindings } from './ui-api';

const DESTRUCTIVE_ACTIONS = new Set([
  'delete', 'remove', 'clear', 'reset', 'destroy', 'drop'
]);

export class ParcTalkRuntime {
  private context: ExecutionContext;
  private sideEffects: SideEffect[] = [];

  constructor(context?: Partial<ExecutionContext>) {
    this.context = { ...createDefaultContext(), ...context };
  }

  execute(source: string): ExecutionResult {
    try {
      const program = parseScript(source);
      return this.executeProgram(program);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        sideEffects: []
      };
    }
  }

  executeProgram(program: ParcTalkProgram): ExecutionResult {
    this.sideEffects = [];
    let lastValue: ParcTalkValue = null;

    try {
      for (const statement of program.statements) {
        lastValue = this.executeNode(statement);
      }

      return {
        success: true,
        value: lastValue,
        sideEffects: this.sideEffects
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Execution error',
        sideEffects: this.sideEffects
      };
    }
  }

  private executeNode(node: ParcTalkNode): ParcTalkValue {
    switch (node.type) {
      case 'card':
        return this.executeCard(node as CardNode);
      case 'command':
        return this.executeCommand(node as CommandNode);
      case 'animate':
        return this.executeAnimate(node as AnimateNode);
      default:
        return null;
    }
  }

  private executeCard(node: CardNode): ParcTalkValue {
    this.context.cardId = node.name;
    
    for (const stmt of node.body) {
      this.executeNode(stmt);
    }
    
    return { cardName: node.name, executed: true };
  }

  private executeCommand(node: CommandNode): ParcTalkValue {
    const { target, action, args } = node;

    if (this.context.sandbox && DESTRUCTIVE_ACTIONS.has(action)) {
      throw new Error(`Destructive action '${action}' is not allowed in sandbox mode`);
    }

    if (target === 'fog' || target === 'meaning' || target === 'cmfk') {
      return cmfkBindings.execute(target, action, args, this.context, this.addSideEffect.bind(this));
    }

    if (target === 'bill') {
      return billBindings.execute(action, args, this.context, this.addSideEffect.bind(this));
    }

    if (target === 'window' || target === 'dock' || target === 'set') {
      return uiBindings.execute(target, action, args, this.context, this.addSideEffect.bind(this));
    }

    if (!target) {
      return this.executeBuiltinAction(action, args);
    }

    return this.executeMethodCall(target, action, args);
  }

  private executeBuiltinAction(action: string, args: ParcTalkValue[]): ParcTalkValue {
    switch (action) {
      case 'open':
        this.addSideEffect({
          type: 'card_open',
          target: args[0] as string,
          payload: { cardName: args[0] }
        });
        return { opened: args[0] };
      
      case 'close':
        this.addSideEffect({
          type: 'card_close',
          target: args[0] as string,
          payload: { cardName: args[0] }
        });
        return { closed: args[0] };
      
      case 'log':
        this.addSideEffect({
          type: 'log',
          payload: { message: args.join(' ') }
        });
        return null;
      
      default:
        return null;
    }
  }

  private executeMethodCall(target: string, action: string, args: ParcTalkValue[]): ParcTalkValue {
    if (target.startsWith('open.')) {
      const subAction = target.split('.')[1];
      return uiBindings.execute('open', subAction, args, this.context, this.addSideEffect.bind(this));
    }

    this.addSideEffect({
      type: 'bill_command',
      target,
      payload: { action, args }
    });

    return { target, action, args };
  }

  private executeAnimate(node: AnimateNode): ParcTalkValue {
    this.addSideEffect({
      type: 'card_animate',
      target: node.target || this.context.cardId,
      payload: { 
        animation: node.animation,
        options: node.options || {}
      }
    });
    return { animated: node.animation };
  }

  private addSideEffect(effect: SideEffect): void {
    this.sideEffects.push(effect);
  }

  getContext(): ExecutionContext {
    return this.context;
  }

  setVariable(name: string, value: ParcTalkValue): void {
    this.context.variables.set(name, value);
  }

  getVariable(name: string): ParcTalkValue {
    return this.context.variables.get(name) ?? null;
  }

  setSandbox(enabled: boolean): void {
    this.context.sandbox = enabled;
  }
}

export function createRuntime(context?: Partial<ExecutionContext>): ParcTalkRuntime {
  return new ParcTalkRuntime(context);
}

export function runScript(source: string, context?: Partial<ExecutionContext>): ExecutionResult {
  const runtime = createRuntime(context);
  return runtime.execute(source);
}

export function runScriptUnsafe(source: string, context?: Partial<ExecutionContext>): ExecutionResult {
  const runtime = createRuntime({ ...context, sandbox: false });
  return runtime.execute(source);
}
