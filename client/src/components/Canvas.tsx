import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParcCard } from '@/state/types';
import { useParcOSStore } from '@/state/store';
import { ParcCardView } from './ParcCardView';
import { HighlightCard } from './HighlightCard';
import { HighlightTimeline } from './HighlightTimeline';
import { highlightEngine } from '@/services/highlight-engine';

export const CinemaLayout: React.FC<{ cards: ParcCard[] }> = ({ cards }) => {
  const focusedCardId = useParcOSStore(s => s.focusedCardId);
  const highlights = useParcOSStore(s => s.highlights);
  const addHighlight = useParcOSStore(s => s.addHighlight);
  
  const focusedCard = cards.find(c => c.id === focusedCardId);
  const otherCards = cards.filter(c => c.id !== focusedCardId);

  useEffect(() => {
    const callback = (highlight: any) => addHighlight(highlight);
    highlightEngine.onHighlight(callback);
  }, [addHighlight]);

  if (!focusedCard) return null;

  const gameHighlights = focusedCard.appId === 'sports-multiview' 
    ? highlights.slice(-6) 
    : [];

  return (
    <>
      {/* Dark overlay */}
      <motion.div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        data-testid="cinema-overlay"
      />

      {/* Main centered card */}
      <motion.div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-[80vw] md:w-[80vw] lg:w-[70vw] max-w-5xl"
        style={{
          height: '70vh',
          maxHeight: '70vh'
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        data-testid="cinema-main-card"
      >
        <div 
          className="w-full h-full flex flex-col rounded-[32px] overflow-hidden backdrop-blur-3xl ring-1 ring-white/40 shadow-[0_0_60px_rgba(79,70,229,0.5)] relative"
          style={{
            backgroundColor: 'rgba(20, 20, 25, 0.85)'
          }}
        >
          <ParcCardView card={focusedCard} />
        </div>
      </motion.div>

      {/* Highlight timeline below main card */}
      {gameHighlights.length > 0 && (
        <motion.div
          className="fixed bottom-40 left-1/2 -translate-x-1/2 z-30 w-[75vw] max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          data-testid="cinema-highlights-timeline"
        >
          <HighlightTimeline highlights={gameHighlights} gameId={focusedCard.appId === 'sports-multiview' ? 'live-game' : undefined} />
        </motion.div>
      )}

      {/* Filmstrip at bottom */}
      {otherCards.length > 0 && (
        <motion.div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3 px-4 py-3 rounded-xl bg-black/50 backdrop-blur-md border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          data-testid="cinema-filmstrip"
        >
          {otherCards.map((card) => (
            <motion.div
              key={card.id}
              className="w-32 h-24 rounded-lg overflow-hidden border border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer transition-all"
              whileHover={{ scale: 1.05 }}
              onClick={() => useParcOSStore.getState().setFocusedCard(card.id)}
              data-testid={`filmstrip-thumb-${card.id}`}
            >
              <div className="w-full h-full text-center flex flex-col items-center justify-center text-xs text-white/60 p-2">
                <div className="font-semibold text-white/80">{card.title}</div>
                <div className="text-[9px] opacity-50 truncate w-full">{card.appId}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </>
  );
};

export const Canvas: React.FC = () => {
  const getVisibleCards = useParcOSStore(state => state.getVisibleCards);
  const activeWorkspace = useParcOSStore(state => state.activeWorkspace);
  const sportsMode = useParcOSStore(state => state.sportsMode);
  const highlights = useParcOSStore(state => state.highlights);
  const addHighlight = useParcOSStore(state => state.addHighlight);
  
  const visibleCards = getVisibleCards();
  const isCinemaMode = activeWorkspace === 'SPORTS' && sportsMode === 'cinema';

  useEffect(() => {
    const callback = (highlight: any) => addHighlight(highlight);
    highlightEngine.onHighlight(callback);
  }, [addHighlight]);

  // Get recent highlights for right sidebar in normal mode
  const recentHighlights = highlights.slice(-3);

  return (
    <div className="fixed top-12 left-0 right-0 bottom-0 w-full min-h-[calc(100vh-3rem)] overflow-visible bg-transparent z-10" data-testid="canvas">
      {isCinemaMode ? (
        <CinemaLayout cards={visibleCards} />
      ) : (
        <div className="relative w-full h-full overflow-visible flex">
          {/* Main canvas area */}
          <div className="flex-1 overflow-visible">
            {visibleCards.map((card) => (
              <ParcCardView key={card.id} card={card} />
            ))}
          </div>

          {/* Right sidebar highlights in normal mode */}
          {activeWorkspace === 'SPORTS' && recentHighlights.length > 0 && (
            <motion.div
              className="fixed right-4 top-20 w-96 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-8rem)] pr-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              data-testid="highlights-sidebar"
            >
              {recentHighlights.map((highlight, index) => (
                <HighlightCard
                  key={highlight.id}
                  highlight={highlight}
                  isNew={index === recentHighlights.length - 1}
                />
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};