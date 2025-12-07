import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lightbulb, ArrowUp } from 'lucide-react';
import { useParcOSStore } from '@/state/store';

interface ContextualInsight {
  id: string;
  message: string;
  action?: string;
  priority: number;
}

const INSIGHT_COOLDOWN = 30000;
const INSIGHT_DISPLAY_DURATION = 5000;
const INSIGHT_CHECK_INTERVAL = 10000;

export const BillPresence: React.FC = () => {
  const cards = useParcOSStore(state => state.cards);
  const focusedCardId = useParcOSStore(state => state.focusedCardId);
  const isBillOpen = useParcOSStore(state => state.isBillOpen);
  const toggleBill = useParcOSStore(state => state.toggleBill);
  const minimizedCards = useParcOSStore(state => state.minimizedCards);
  const highlightedTeam = useParcOSStore(state => state.highlightedTeam);
  
  const [showInsight, setShowInsight] = useState(false);
  const [currentInsight, setCurrentInsight] = useState<ContextualInsight | null>(null);
  const lastInsightTimeRef = useRef(0);
  const isMountedRef = useRef(true);

  const visibleCards = useMemo(() => 
    Object.values(cards).filter(c => !minimizedCards.includes(c.id)),
    [cards, minimizedCards]
  );

  const insights = useMemo<ContextualInsight[]>(() => {
    const result: ContextualInsight[] = [];
    
    if (visibleCards.length === 0) {
      result.push({
        id: 'no-cards',
        message: "Press ⌘B to launch an app",
        action: 'launch',
        priority: 10
      });
    } else if (visibleCards.length >= 4) {
      result.push({
        id: 'many-cards',
        message: "Many cards open. Try 'arrange workspace'",
        action: 'organize',
        priority: 8
      });
    }
    
    if (minimizedCards.length > 3) {
      result.push({
        id: 'hidden-cards',
        message: `${minimizedCards.length} cards minimized. Say 'restore all'`,
        action: 'restore',
        priority: 5
      });
    }

    if (highlightedTeam) {
      result.push({
        id: 'team-linked',
        message: `Linked to ${highlightedTeam}`,
        action: 'info',
        priority: 3
      });
    }

    const hasSportsCard = visibleCards.some(c => c.appId === 'sports-multiview');
    const hasNILCard = visibleCards.some(c => c.appId === 'nil-dashboard');
    
    if (hasSportsCard && !hasNILCard && !highlightedTeam) {
      result.push({
        id: 'suggest-nil',
        message: "Click a team to see NIL deals",
        action: 'tip',
        priority: 6
      });
    }

    return result.sort((a, b) => b.priority - a.priority);
  }, [visibleCards, minimizedCards, highlightedTeam]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const tryShowInsight = useCallback(() => {
    if (!isMountedRef.current) return;
    if (isBillOpen || insights.length === 0) return;
    
    const now = Date.now();
    if (now - lastInsightTimeRef.current < INSIGHT_COOLDOWN) return;
    
    lastInsightTimeRef.current = now;
    setCurrentInsight(insights[0]);
    setShowInsight(true);
    
    setTimeout(() => {
      if (isMountedRef.current) {
        setShowInsight(false);
      }
    }, INSIGHT_DISPLAY_DURATION);
  }, [isBillOpen, insights]);

  useEffect(() => {
    if (isBillOpen) {
      setShowInsight(false);
      return;
    }

    const initialTimer = setTimeout(tryShowInsight, INSIGHT_CHECK_INTERVAL);
    
    const interval = setInterval(tryShowInsight, INSIGHT_CHECK_INTERVAL);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isBillOpen, tryShowInsight]);

  if (isBillOpen) return null;

  return (
    <>
      <motion.button
        onClick={toggleBill}
        className="fixed bottom-6 right-6 z-[90] group"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        data-testid="button-bill-presence"
      >
        <motion.div
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-lg shadow-indigo-600/40 relative overflow-hidden"
          animate={{
            boxShadow: [
              '0 10px 25px -5px rgba(79, 70, 229, 0.4)',
              '0 10px 35px -5px rgba(139, 92, 246, 0.5)',
              '0 10px 25px -5px rgba(79, 70, 229, 0.4)',
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/20"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <Sparkles className="w-7 h-7 text-white relative z-10" />
          
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900 opacity-0 group-hover:opacity-100"
            initial={false}
            transition={{ duration: 0.2 }}
          />
        </motion.div>

        <motion.div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-white/60 whitespace-nowrap opacity-0 group-hover:opacity-100"
          initial={false}
          transition={{ duration: 0.2 }}
        >
          ⌘B
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {showInsight && currentInsight && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 10, x: 10 }}
            className="fixed bottom-24 right-6 z-[89] max-w-[220px]"
          >
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-3 border border-indigo-500/30 shadow-xl shadow-indigo-500/10">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-600/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white/80 leading-relaxed">
                    {currentInsight.message}
                  </p>
                </div>
              </div>
              
              <motion.button
                onClick={toggleBill}
                className="mt-2 w-full flex items-center justify-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
                whileHover={{ y: -1 }}
              >
                <ArrowUp className="w-3 h-3" />
                Ask BILL
              </motion.button>
            </div>
            
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-slate-900/90 border-r border-b border-indigo-500/30 rotate-45 -z-10" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
