import React from 'react';
import { ParcCardView } from '@/components/ParcCardView';
import { useParcOSStore } from '@/state/store';

export const Canvas: React.FC = () => {
  const getVisibleCards = useParcOSStore(state => state.getVisibleCards);
  
  const visibleCards = getVisibleCards();

  return (
    <div className="fixed top-12 left-0 right-0 bottom-0 w-full min-h-[calc(100vh-3rem)] overflow-visible bg-transparent z-10" data-testid="canvas">
      <div className="relative w-full h-full overflow-visible">
        {visibleCards.map((card) => (
          <ParcCardView key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
};
