import React, { useRef } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { ParcCard } from '../state/types';
import { useParcOSStore } from '../state/store';
import { X, Minimize2, Maximize2, MoreHorizontal, GripHorizontal } from 'lucide-react';
import { SportsMultiView } from '../apps/SportsMultiView';
import { NILDashboard } from '../apps/NILDashboard';
import { ClassroomBoard } from '../apps/ClassroomBoard';
import { GenericBrowserCard } from '../apps/GenericBrowserCard';

const AppRegistry: Record<string, React.FC<{ payload: any }>> = {
  'sports-multiview': SportsMultiView,
  'nil-dashboard': NILDashboard,
  'classroom-board': ClassroomBoard,
  'generic-browser': GenericBrowserCard,
  'creator-studio': () => <div className="p-8 text-white/50 text-center">Creator Studio Placeholder</div>,
  'system-tools': () => <div className="p-8 text-white/50 text-center">System Tools Placeholder</div>,
};

export const ParcCardView: React.FC<{ card: ParcCard }> = ({ card }) => {
  const updateCardPosition = useParcOSStore(s => s.updateCardPosition);
  const setFocusedCard = useParcOSStore(s => s.setFocusedCard);
  const isFocused = card.layoutState.focused;

  const App = card.appId ? AppRegistry[card.appId] : null;

  return (
    <motion.div
      className={`absolute flex flex-col rounded-[32px] overflow-hidden backdrop-blur-3xl shadow-2xl transition-shadow duration-300 ${isFocused ? 'ring-1 ring-white/30 shadow-indigo-500/20' : 'ring-1 ring-white/10 shadow-black/50'}`}
      style={{
        width: card.size.width,
        height: card.size.height,
        x: card.position.x,
        y: card.position.y,
        zIndex: card.position.z,
        backgroundColor: 'rgba(20, 20, 25, 0.65)', 
      }}
      drag
      dragMomentum={false}
      onDragEnd={(_, info) => {
        const currentX = card.position.x + info.offset.x;
        const currentY = card.position.y + info.offset.y;
        updateCardPosition(card.id, { x: currentX, y: currentY });
      }}
      onMouseDown={() => setFocusedCard(card.id)}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: isFocused ? 1.01 : 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
    >
      {/* Header / Handle */}
      <div className="h-12 flex items-center justify-between px-4 shrink-0 border-b border-white/5 bg-white/5 cursor-grab active:cursor-grabbing group">
        <div className="flex items-center gap-3">
          <div className="flex gap-2 group-hover:opacity-100 opacity-50 transition-opacity">
             <button className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 border border-white/10" />
             <button className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 border border-white/10" />
             <button className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 border border-white/10" />
          </div>
        </div>
        
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-70">
           <span className="text-xs font-medium text-white/90 tracking-wide">{card.title}</span>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1.5 hover:bg-white/10 rounded-full text-white/60 hover:text-white">
                <GripHorizontal className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto relative custom-scrollbar">
        {App ? <App payload={card.payload} /> : <div className="p-4 text-white/50">Unknown App</div>}
      </div>

      {/* CMFK Indicator (Footer) */}
      <div className="h-8 shrink-0 border-t border-white/5 bg-black/20 flex items-center px-4 justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]"></div>
            <span className="text-[10px] font-mono text-blue-300/80 uppercase tracking-widest">Knowingness: {Math.round((card.cmfk?.knowingness || 0) * 100)}%</span>
          </div>
          <span className="text-[10px] text-white/20 font-mono">{card.id.slice(0,4)}</span>
      </div>
    </motion.div>
  );
};
