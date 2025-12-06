import React from 'react';
import { ParcCardView } from '@/components/ParcCardView';
import { useParcOSStore } from '@/state/store';

export const Canvas: React.FC = () => {
  const getVisibleCards = useParcOSStore(state => state.getVisibleCards);
  
  const visibleCards = getVisibleCards();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-transparent" data-testid="canvas">
      {visibleCards.map((card) => (
        <ParcCardView key={card.id} card={card} />
      ))}
    </div>
  );
};
