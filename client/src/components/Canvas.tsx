import React from 'react';
import { ParcCardView } from '@/components/ParcCardView';
import { useParcOSStore } from '@/state/store';

export const Canvas: React.FC = () => {
  const cards = useParcOSStore(state => state.cards);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-transparent">
      {Object.values(cards).map((card) => (
        <ParcCardView key={card.id} card={card} />
      ))}
    </div>
  );
};
