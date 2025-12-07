import React, { useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { ParcCard, SnapZoneType } from '@/state/types';
import { useParcOSStore } from '@/state/store';
import { Minimize2, GripHorizontal, Play, X, Link2 } from 'lucide-react';
import { NILDashboard } from '@/apps/NILDashboard';
import { ClassroomBoard } from '@/apps/ClassroomBoard';
import { GenericBrowserCard } from '@/apps/GenericBrowserCard';

// Lazy import SportsMultiView to avoid circular dependencies
const SportsMultiView = React.lazy(() => import('@/apps/SportsMultiView').then(m => ({ default: m.SportsMultiView })));

const AppRegistry: Record<string, React.FC<{ payload: any }>> = {
  'sports-multiview': SportsMultiView,
  'nil-dashboard': NILDashboard,
  'classroom-board': ClassroomBoard,
  'generic-browser': GenericBrowserCard,
  'creator-studio': () => <div className="p-8 text-white/50 text-center">Creator Studio Placeholder</div>,
  'system-tools': () => <div className="p-8 text-white/50 text-center">System Tools Placeholder</div>,
};

const SNAP_THRESHOLD = 50;

const detectSnapZone = (
  x: number, 
  y: number, 
  width: number, 
  height: number
): SnapZoneType | null => {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const cardCenterX = x + width / 2;
  const cardCenterY = y + height / 2;
  const cardRight = x + width;
  const cardBottom = y + height;
  
  const isNearLeftEdge = x < SNAP_THRESHOLD;
  const isNearRightEdge = cardRight > screenWidth - SNAP_THRESHOLD;
  const isNearTop = y < 48 + SNAP_THRESHOLD;
  const isNearBottom = cardBottom > screenHeight - SNAP_THRESHOLD;
  const isNearCenterX = Math.abs(cardCenterX - screenWidth / 2) < 100;
  const isNearCenterY = Math.abs(cardCenterY - screenHeight / 2) < 100;

  if (isNearLeftEdge) {
    if (isNearTop) return 'top-left';
    if (isNearBottom) return 'bottom-left';
    return 'left';
  }
  
  if (isNearRightEdge) {
    if (isNearTop) return 'top-right';
    if (isNearBottom) return 'bottom-right';
    return 'right';
  }
  
  if (isNearCenterX && isNearCenterY) {
    return 'center';
  }
  
  return null;
};

export const ParcCardView: React.FC<{ card: ParcCard }> = ({ card }) => {
  const updateCardPosition = useParcOSStore(s => s.updateCardPosition);
  const setFocusedCard = useParcOSStore(s => s.setFocusedCard);
  const minimizeCard = useParcOSStore(s => s.minimizeCard);
  const enterSportsCinema = useParcOSStore(s => s.enterSportsCinema);
  const exitSportsCinema = useParcOSStore(s => s.exitSportsCinema);
  const activeWorkspace = useParcOSStore(s => s.activeWorkspace);
  const sportsMode = useParcOSStore(s => s.sportsMode);
  const setActiveSnapZone = useParcOSStore(s => s.setActiveSnapZone);
  const setDragging = useParcOSStore(s => s.setDragging);
  const snapCardToZone = useParcOSStore(s => s.snapCardToZone);
  const activeSnapZone = useParcOSStore(s => s.activeSnapZone);
  const highlightedTeam = useParcOSStore(s => s.highlightedTeam);
  const enterCinema = useParcOSStore(s => s.enterCinema);
  const cinemaCardId = useParcOSStore(s => s.cinemaCardId);
  
  const isLinked = Boolean(highlightedTeam) && (card.appId === 'nil-dashboard' || card.appId === 'sports-multiview');
  
  const dragStartPos = useRef({ x: 0, y: 0 });
  const isFocused = card.layoutState.focused;
  const isSportsCinemaMode = activeWorkspace === 'SPORTS' && sportsMode === 'cinema' && isFocused;
  const isGlobalCinemaMode = cinemaCardId === card.id;

  const App = card.appId ? AppRegistry[card.appId] : null;

  const maxZ = 10;
  const depthFactor = Math.min(Math.max(card.position.z / maxZ, 0.3), 1);

  const getCardShadow = () => {
    if (isGlobalCinemaMode) {
      return [
        `0 8px 16px rgba(0, 0, 0, 0.3)`,
        `0 24px 48px rgba(0, 0, 0, 0.4)`,
        `0 48px 96px rgba(0, 0, 0, 0.5)`,
        `0 0 120px rgba(99, 102, 241, 0.6)`,
        `0 0 200px rgba(139, 92, 246, 0.4)`,
        `0 0 300px rgba(79, 70, 229, 0.25)`,
        `inset 0 1px 0 rgba(255, 255, 255, 0.15)`
      ].join(', ');
    }
    if (isFocused) {
      return [
        `0 4px 8px rgba(0, 0, 0, ${0.15 * depthFactor})`,
        `0 12px 24px rgba(0, 0, 0, ${0.2 * depthFactor})`,
        `0 24px 48px rgba(0, 0, 0, ${0.25 * depthFactor})`,
        `0 0 80px rgba(99, 102, 241, ${0.4 * depthFactor})`,
        `0 0 120px rgba(139, 92, 246, ${0.25 * depthFactor})`,
        `inset 0 1px 0 rgba(255, 255, 255, 0.1)`
      ].join(', ');
    }
    return [
      `0 2px 4px rgba(0, 0, 0, ${0.08 * depthFactor})`,
      `0 6px 12px rgba(0, 0, 0, ${0.1 * depthFactor})`,
      `0 12px 24px rgba(0, 0, 0, ${0.12 * depthFactor})`
    ].join(', ');
  };

  return (
    <motion.div
      className={`absolute flex flex-col rounded-[32px] overflow-hidden transition-all duration-300 ${
        isFocused 
          ? 'ring-1 ring-white/40 backdrop-blur-[40px]' 
          : 'ring-1 ring-white/10 backdrop-blur-xl'
      }`}
      style={{
        width: card.size.width,
        height: card.size.height,
        x: card.position.x,
        y: card.position.y,
        zIndex: card.position.z,
        backgroundColor: isFocused ? 'rgba(20, 20, 25, 0.7)' : 'rgba(20, 20, 25, 0.6)',
        boxShadow: getCardShadow(),
        opacity: isFocused ? 1 : 0.88,
      }}
      drag
      dragMomentum={false}
      onDragStart={() => {
        dragStartPos.current = { x: card.position.x, y: card.position.y };
        setDragging(true, card.id);
      }}
      onDrag={(_, info: PanInfo) => {
        const currentX = dragStartPos.current.x + info.offset.x;
        const currentY = dragStartPos.current.y + info.offset.y;
        const zone = detectSnapZone(currentX, currentY, card.size.width, card.size.height);
        setActiveSnapZone(zone);
      }}
      onDragEnd={(_, info: PanInfo) => {
        const currentX = dragStartPos.current.x + info.offset.x;
        const currentY = dragStartPos.current.y + info.offset.y;
        
        if (activeSnapZone) {
          snapCardToZone(card.id, activeSnapZone);
        } else {
          updateCardPosition(card.id, { x: currentX, y: currentY });
          setDragging(false, null);
          setActiveSnapZone(null);
        }
      }}
      onMouseDown={() => setFocusedCard(card.id)}
      onDoubleClick={() => {
        if (!isGlobalCinemaMode) {
          enterCinema(card.id);
        }
      }}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: isFocused ? 1.04 : 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      data-testid={`card-${card.id}`}
      data-card-z={card.position.z}
    >
      {/* Header / Handle */}
      <div className="h-12 flex items-center justify-between px-4 shrink-0 border-b border-white/5 bg-white/5 cursor-grab active:cursor-grabbing group">
        <div className="flex items-center gap-3">
          <div className="flex gap-2 group-hover:opacity-100 opacity-50 transition-opacity">
             <button 
               className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 border border-white/10 transition-colors" 
               data-testid={`button-close-${card.id}`}
               onClick={() => {}} 
             />
             <button 
               className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 border border-white/10 transition-colors" 
               data-testid={`button-minimize-${card.id}`}
               onClick={() => minimizeCard(card.id)}
             />
             <button 
               className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 border border-white/10 transition-colors" 
               data-testid={`button-maximize-${card.id}`}
               onClick={() => {}} 
             />
          </div>
        </div>
        
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-70">
           {isLinked && (
             <div 
               className="flex items-center gap-1 px-1.5 py-0.5 bg-indigo-500/30 rounded-full border border-indigo-400/40 animate-pulse"
               title={`Linked to: ${highlightedTeam}`}
               data-testid={`link-indicator-${card.id}`}
             >
               <Link2 className="w-3 h-3 text-indigo-400" />
             </div>
           )}
           <span className="text-xs font-medium text-white/90 tracking-wide" data-testid={`text-title-${card.id}`}>{card.title}</span>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {activeWorkspace === 'SPORTS' && !isSportsCinemaMode && (
              <button 
                className="p-1.5 hover:bg-indigo-500/20 rounded-full text-indigo-300 hover:text-indigo-100 transition-colors" 
                data-testid={`button-watch-${card.id}`}
                onClick={() => enterSportsCinema(card.id)}
                title="Watch Mode"
              >
                  <Play className="w-4 h-4 fill-current" />
              </button>
            )}
            {isSportsCinemaMode && (
              <button 
                className="p-1.5 hover:bg-red-500/20 rounded-full text-red-300 hover:text-red-100 transition-colors" 
                data-testid={`button-exit-cinema-${card.id}`}
                onClick={() => exitSportsCinema()}
                title="Exit Watch Mode"
              >
                  <X className="w-4 h-4" />
              </button>
            )}
            {!isSportsCinemaMode && (
              <button 
                className="p-1.5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors" 
                data-testid={`button-grip-${card.id}`}
              >
                  <GripHorizontal className="w-4 h-4" />
              </button>
            )}
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
            <span className="text-[10px] font-mono text-blue-300/80 uppercase tracking-widest" data-testid={`text-cmfk-${card.id}`}>
              Knowingness: {Math.round((card.cmfk?.knowingness || 0) * 100)}%
            </span>
          </div>
          <span className="text-[10px] text-white/20 font-mono">{card.id.slice(0,4)}</span>
      </div>
    </motion.div>
  );
};
