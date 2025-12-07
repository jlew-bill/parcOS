import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, ArrowRight, Mic, CheckCircle, XCircle, Command } from 'lucide-react';
import { useParcOSStore } from '@/state/store';
import { BillCommandProcessor, CommandResult } from '@/services/bill-commands';

export const BillOverlay: React.FC = () => {
  const isOpen = useParcOSStore(state => state.isBillOpen);
  const toggleBill = useParcOSStore(state => state.toggleBill);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<CommandResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'b' && (e.metaKey || e.ctrlKey)) {
        toggleBill();
      }
      if (e.key === 'Escape' && isOpen) {
        toggleBill();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggleBill]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setResponse(null);
      setQuery('');
    }
  }, [isOpen]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    executeCommand(query);
  };

  const executeCommand = (command: string) => {
    if (!command.trim()) return;

    setIsExecuting(true);
    
    setTimeout(() => {
      const result = BillCommandProcessor.process(command);
      
      if (result) {
        setResponse(result);
        if (result.success) {
          setQuery('');
        }
      } else {
        setResponse({
          success: false,
          message: "I didn't understand that command. Try 'arrange workspace', 'cascade', 'grid layout', or 'focus [card name]'."
        });
      }
      
      setIsExecuting(false);
      
      setTimeout(() => {
        if (result?.success) {
          setResponse(null);
        }
      }, 3000);
    }, 150);
  };

  const handleSuggestionClick = (command: string) => {
    setQuery(command);
    executeCommand(command);
  };

  const suggestions = BillCommandProcessor.getSuggestions();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[600px] z-[100]"
        >
          <div className="glass-panel-dark rounded-3xl p-4 flex flex-col gap-4 border border-indigo-500/30 shadow-[0_0_50px_rgba(79,70,229,0.2)]">
            <div className="flex items-start gap-4">
              <motion.div 
                className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/40"
                animate={isExecuting ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: isExecuting ? Infinity : 0, duration: 0.6 }}
              >
                <Bot className="w-6 h-6 text-white" />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white mb-1">BILL <span className="text-white/40 font-normal">AI Toolsmith</span></h3>
                <AnimatePresence mode="wait">
                  {response ? (
                    <motion.div
                      key="response"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className={`flex items-start gap-2 text-sm ${response.success ? 'text-green-300' : 'text-amber-300'}`}
                    >
                      {response.success ? (
                        <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      )}
                      <span>{response.message}</span>
                    </motion.div>
                  ) : (
                    <motion.p 
                      key="prompt"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-indigo-200/80"
                    >
                      I can arrange your workspace, focus cards, or organize your layout. What do you need?
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="relative">
              <input 
                ref={inputRef}
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try 'arrange workspace' or 'cascade cards'..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-24 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                data-testid="input-bill-query"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button 
                  type="button"
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                  data-testid="button-bill-mic"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <motion.button 
                  type="submit"
                  className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-colors disabled:opacity-50"
                  disabled={isExecuting || !query.trim()}
                  whileTap={{ scale: 0.95 }}
                  data-testid="button-bill-submit"
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </form>
            
            <div className="flex flex-wrap gap-2 pb-1">
              {suggestions.slice(0, 6).map(suggestion => (
                <motion.button 
                  key={suggestion.command} 
                  onClick={() => handleSuggestionClick(suggestion.command)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-indigo-600/30 border border-white/5 hover:border-indigo-500/30 text-xs text-white/70 hover:text-white whitespace-nowrap transition-all flex items-center gap-1.5"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  data-testid={`button-suggestion-${suggestion.command.replace(/\s+/g, '-')}`}
                >
                  <Command className="w-3 h-3 text-indigo-400" />
                  {suggestion.text}
                </motion.button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 text-[10px] text-white/30 border-t border-white/5 pt-2">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-white/10 rounded text-[9px]">⌘B</kbd> toggle
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-white/10 rounded text-[9px]">Enter</kbd> execute
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-white/10 rounded text-[9px]">Esc</kbd> close
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
