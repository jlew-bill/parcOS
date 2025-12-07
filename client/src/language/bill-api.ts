import type { ExecutionContext, SideEffect, ParcTalkValue } from './core';
import { BillCommandProcessor } from '@/services/bill-commands';

type SideEffectHandler = (effect: SideEffect) => void;

export const billBindings = {
  execute(
    action: string,
    args: ParcTalkValue[],
    context: ExecutionContext,
    addSideEffect: SideEffectHandler
  ): ParcTalkValue {
    
    switch (action) {
      case 'say':
      case 'speak':
        return this.say(args, addSideEffect);
      
      case 'command':
      case 'run':
        return this.runCommand(args, addSideEffect);
      
      case 'suggest':
        return this.suggest(context, addSideEffect);
      
      case 'help':
        return this.help(args, addSideEffect);
      
      case 'analyze':
        return this.analyze(args, context, addSideEffect);
      
      case 'open':
        return this.openBill(addSideEffect);
      
      case 'close':
        return this.closeBill(addSideEffect);
      
      case 'toggle':
        return this.toggleBill(addSideEffect);
      
      case 'launch':
        return this.launchApp(args, addSideEffect);
      
      case 'arrange':
        return this.arrangeWorkspace(args, addSideEffect);
      
      default:
        return this.genericCommand(action, args, addSideEffect);
    }
  },

  say(args: ParcTalkValue[], addSideEffect: SideEffectHandler): ParcTalkValue {
    const message = args.map(a => String(a)).join(' ');
    
    addSideEffect({
      type: 'bill_command',
      target: 'bill',
      payload: {
        action: 'say',
        message,
        display: true
      }
    });
    
    return { said: message };
  },

  runCommand(args: ParcTalkValue[], addSideEffect: SideEffectHandler): ParcTalkValue {
    const command = args[0] as string;
    
    if (!command) {
      return { success: false, error: 'No command provided' };
    }
    
    const result = BillCommandProcessor.process(command);
    
    addSideEffect({
      type: 'bill_command',
      target: 'bill',
      payload: {
        action: 'command',
        command,
        result
      }
    });
    
    if (result) {
      return {
        success: result.success,
        message: result.message,
        action: result.action,
        data: result.data
      };
    }
    
    return { success: false, message: 'Command not recognized' };
  },

  suggest(context: ExecutionContext, addSideEffect: SideEffectHandler): ParcTalkValue {
    const suggestions = BillCommandProcessor.getSuggestions(context.userCMFK);
    
    addSideEffect({
      type: 'bill_command',
      target: 'bill',
      payload: {
        action: 'suggest',
        suggestions
      }
    });
    
    return suggestions.slice(0, 5).map(s => ({
      text: s.text,
      command: s.command,
      score: s.score
    }));
  },

  help(args: ParcTalkValue[], addSideEffect: SideEffectHandler): ParcTalkValue {
    const topic = args[0] as string | undefined;
    
    const helpTopics: Record<string, string> = {
      default: `BILL is your AI assistant in parcOS. Commands: launch, arrange, analyze, suggest.`,
      launch: `Launch apps with: bill.launch("Sports"), bill.launch("NIL"), bill.launch("Classroom")`,
      arrange: `Organize cards: bill.arrange("grid"), bill.arrange("cascade"), bill.arrange("stack")`,
      cmfk: `CMFK is the Cognitive Vector: Correctness, Misconception, Fog, Knowingness (0-1 scale)`,
      parctalk: `ParcTalk is the scripting language for parcOS. Example: card "Sports" { open(); animate pulse; }`
    };
    
    const helpText = helpTopics[topic || 'default'] || helpTopics.default;
    
    addSideEffect({
      type: 'bill_command',
      target: 'bill',
      payload: {
        action: 'help',
        topic: topic || 'default',
        message: helpText
      }
    });
    
    return { topic: topic || 'default', help: helpText };
  },

  analyze(
    args: ParcTalkValue[], 
    context: ExecutionContext,
    addSideEffect: SideEffectHandler
  ): ParcTalkValue {
    const target = args[0] as string;
    
    const analysis = {
      target,
      cmfk: context.userCMFK,
      workspace: context.workspaceId,
      card: context.cardId,
      timestamp: new Date().toISOString()
    };
    
    addSideEffect({
      type: 'bill_command',
      target: 'bill',
      payload: {
        action: 'analyze',
        analysis
      }
    });
    
    return analysis;
  },

  openBill(addSideEffect: SideEffectHandler): ParcTalkValue {
    addSideEffect({
      type: 'bill_command',
      target: 'bill',
      payload: { action: 'open', isOpen: true }
    });
    return { billOpen: true };
  },

  closeBill(addSideEffect: SideEffectHandler): ParcTalkValue {
    addSideEffect({
      type: 'bill_command',
      target: 'bill',
      payload: { action: 'close', isOpen: false }
    });
    return { billOpen: false };
  },

  toggleBill(addSideEffect: SideEffectHandler): ParcTalkValue {
    addSideEffect({
      type: 'bill_command',
      target: 'bill',
      payload: { action: 'toggle' }
    });
    return { billToggled: true };
  },

  launchApp(args: ParcTalkValue[], addSideEffect: SideEffectHandler): ParcTalkValue {
    const appName = args[0] as string;
    
    addSideEffect({
      type: 'card_open',
      target: appName,
      payload: { 
        appName,
        source: 'bill.launch'
      }
    });
    
    return { launched: appName };
  },

  arrangeWorkspace(args: ParcTalkValue[], addSideEffect: SideEffectHandler): ParcTalkValue {
    const layout = (args[0] as string) || 'grid';
    
    const layoutMap: Record<string, string> = {
      grid: 'gridLayout',
      cascade: 'cascadeCards',
      stack: 'stackCards',
      tile: 'tileCards'
    };
    
    const action = layoutMap[layout] || 'gridLayout';
    
    addSideEffect({
      type: 'bill_command',
      target: 'workspace',
      payload: { 
        action,
        layout,
        source: 'bill.arrange'
      }
    });
    
    return { arranged: layout };
  },

  genericCommand(
    action: string, 
    args: ParcTalkValue[], 
    addSideEffect: SideEffectHandler
  ): ParcTalkValue {
    const commandStr = `${action} ${args.map(a => String(a)).join(' ')}`.trim();
    const result = BillCommandProcessor.process(commandStr);
    
    addSideEffect({
      type: 'bill_command',
      target: 'bill',
      payload: {
        action: 'generic',
        command: commandStr,
        result
      }
    });
    
    return result || { success: false, message: 'Unknown command' };
  }
};
