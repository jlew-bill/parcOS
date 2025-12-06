import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Highlight } from '@/state/types';
import { useParcOSStore } from '@/state/store';

interface HighlightTimelineProps {
  highlights: Highlight[];
  gameId?: string;
}

export const HighlightTimeline: React.FC<HighlightTimelineProps> = ({ highlights, gameId }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const highlightTimelineScroll = useParcOSStore(s => s.highlightTimelineScroll);
  const setHighlightTimelineScroll = useParcOSStore(s => s.setHighlightTimelineScroll);

  // Filter highlights for this game
  const gameHighlights = gameId ? highlights.filter(h => h.gameId === gameId) : highlights;

  // Auto-scroll to latest highlight
  useEffect(() => {
    if (scrollContainerRef.current && gameHighlights.length > 0) {
      const container = scrollContainerRef.current;
      // Scroll to the right on new highlights
      setTimeout(() => {
        container.scrollLeft = container.scrollWidth;
      }, 100);
    }
  }, [gameHighlights.length]);

  if (gameHighlights.length === 0) {
    return (
      <div className="w-full h-20 flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
        <span className="text-xs text-white/50">Waiting for highlights...</span>
      </div>
    );
  }

  const typeEmojis: Record<string, string> = {
    score_change: '📊',
    lead_change: '🔄',
    run: '🔥',
    momentum_reversal: '⚡',
    injury: '🏥',
    turnover: '🔃',
    big_play: '⭐'
  };

  return (
    <div className="w-full">
      <div className="text-xs font-semibold text-white/60 mb-2 px-2">
        Live Highlights ({gameHighlights.length})
      </div>
      <motion.div
        ref={scrollContainerRef}
        className="w-full h-20 overflow-x-auto flex gap-2 pb-2 px-2 rounded-lg bg-black/30 backdrop-blur-sm border border-white/10"
        onScroll={(e) => {
          const target = e.currentTarget;
          setHighlightTimelineScroll(target.scrollLeft);
        }}
        data-testid="highlight-timeline"
      >
        <AnimatePresence mode="popLayout">
          {gameHighlights.map((highlight, index) => {
            const isNew = index === gameHighlights.length - 1;
            return (
              <motion.div
                key={highlight.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex-shrink-0 w-32 h-16 px-2 py-1 rounded bg-white/5 border border-white/20 flex flex-col justify-between hover:bg-white/10 cursor-pointer transition-all ${
                  isNew ? 'ring-1 ring-white/40' : ''
                }`}
                data-testid={`timeline-item-${highlight.id}`}
              >
                {/* Pulsing indicator for new */}
                {isNew && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}

                <div className="flex items-center gap-1">
                  <span className="text-sm">{typeEmojis[highlight.type]}</span>
                  <span className="text-[10px] font-bold text-white/80 uppercase truncate">
                    {highlight.type.split('_')[0]}
                  </span>
                </div>

                {highlight.value && (
                  <span className="text-xs font-bold text-white/70">{highlight.value}</span>
                )}

                <span className="text-[9px] text-white/50">
                  {new Date(highlight.createdAt).toLocaleTimeString([], {
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
