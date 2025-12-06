import React from 'react';
import { motion } from 'framer-motion';
import { ParcCard } from '@/state/types';
import { useParcOSStore } from '@/state/store';
import { ParcCardView } from './ParcCardView';

export const CinemaLayout: React.FC<{ cards: ParcCard[] }> = ({ cards }) => {
  const focusedCardId = useParcOSStore(s => s.focusedCardId);
  
  const focusedCard = cards.find(c => c.id === focusedCardId);
  const otherCards = cards.filter(c => c.id !== focusedCardId);

  if (!focusedCard) return null;

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

      {/* Filmstrip at bottom */}
      {otherCards.length > 0 && (
        <motion.div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 flex gap-3 px-4 py-3 rounded-xl bg-black/50 backdrop-blur-md border border-white/10"
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
  
  const visibleCards = getVisibleCards();
  const isCinemaMode = activeWorkspace === 'SPORTS' && sportsMode === 'cinema';

  return (
    <div className="fixed top-12 left-0 right-0 bottom-0 w-full min-h-[calc(100vh-3rem)] overflow-visible bg-transparent z-10" data-testid="canvas">
      {isCinemaMode ? (
        <CinemaLayout cards={visibleCards} />
      ) : (
        <div className="relative w-full h-full overflow-visible">
          {visibleCards.map((card) => (
            <ParcCardView key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
};