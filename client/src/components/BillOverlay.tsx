import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, ArrowRight, Mic } from 'lucide-react';
import { useParcOSStore } from '@/state/store';

export const BillOverlay: React.FC = () => {
  const isOpen = useParcOSStore(state => state.isBillOpen);
  const toggleBill = useParcOSStore(state => state.toggleBill);
  const [query, setQuery] = useState('');

  React.useEffect(() => {
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
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/40">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                 <h3 className="text-sm font-semibold text-white mb-1">BILL <span className="text-white/40 font-normal">AI Toolsmith</span></h3>
                 <p className="text-sm text-indigo-200/80">I can build custom tools, analyze your cards, or connect data sources. What do you need?</p>
              </div>
            </div>

            <div className="relative">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe a tool or task..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                autoFocus
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                 <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                    <Mic className="w-4 h-4" />
                 </button>
                 <button className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-colors">
                    <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {['Create NIL Tracker', 'Summarize Sports Feed', 'Connect Calendar'].map(suggestion => (
                <button key={suggestion} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-white/70 whitespace-nowrap transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
