import React, { useRef, useState, useCallback, Suspense } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { ParcCard, SnapZoneType } from '@/state/types';
import { useParcOSStore } from '@/state/store';
import { Minimize2, GripHorizontal, Play, X, Link2 } from 'lucide-react';
import { cmfkEngine } from '@/services/cmfk-engine';
import { appRegistry } from '@/services/app-registry';

const MIN_WIDTH = 280;
const MIN_HEIGHT = 200;

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
  const isWideCard = width > screenWidth * 0.5;

  if (isNearTop && isNearCenterX && isWideCard) {
    return 'top';
  }

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
  
  if (isNearTop && !isNearLeftEdge && !isNearRightEdge) {
    return 'top';
  }
  
  if (isNearCenterX && isNearCenterY) {
    return 'center';
  }
  
  return null;
};

export const ParcCardView: React.FC<{ card: ParcCard }> = ({ card }) => {
  const updateCardPosition = useParcOSStore(s => s.updateCardPosition);
  const updateCardSize = useParcOSStore(s => s.updateCardSize);
  const setFocusedCard = useParcOSStore(s => s.setFocusedCard);
  const minimizeCard = useParcOSStore(s => s.minimizeCard);
  const closeCard = useParcOSStore(s => s.closeCard);
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
  const exitCinema = useParcOSStore(s => s.exitCinema);
  const cinemaCardId = useParcOSStore(s => s.cinemaCardId);
  const updateCardCMFK = useParcOSStore(s => s.updateCardCMFK);
  
  const isLinked = Boolean(highlightedTeam) && (card.appId === 'nil-dashboard' || card.appId === 'sports-multiview');
  
  const dragStartPos = useRef({ x: 0, y: 0 });
  const resizeStartState = useRef({ width: 0, height: 0, x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeEdge, setResizeEdge] = useState<string | null>(null);
  
  const isFocused = card.layoutState.focused;
  const isSportsCinemaMode = activeWorkspace === 'SPORTS' && sportsMode === 'cinema' && isFocused;
  const isGlobalCinemaMode = cinemaCardId === card.id;

  const maxZ = 10;
  const depthFactor = Math.min(Math.max(card.position.z / maxZ, 0.3), 1);
  
  const getBackdropBlur = () => {
    if (isGlobalCinemaMode) return 'blur(60px)';
    if (isFocused) return `blur(${32 + depthFactor * 16}px)`;
    return `blur(${16 + depthFactor * 8}px)`;
  };

  const getCardShadow = () => {
    if (isGlobalCinemaMode) {
      return [
        `0 8px 16px rgba(0, 0, 0, 0.35)`,
        `0 24px 48px rgba(0, 0, 0, 0.45)`,
        `0 48px 96px rgba(0, 0, 0, 0.55)`,
        `0 0 120px rgba(99, 102, 241, 0.7)`,
        `0 0 200px rgba(139, 92, 246, 0.5)`,
        `0 0 300px rgba(79, 70, 229, 0.3)`,
        `inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
        `inset 0 -2px 6px rgba(0, 0, 0, 0.3)`
      ].join(', ');
    }
    if (isFocused) {
      return [
        `0 4px 8px rgba(0, 0, 0, ${0.18 * depthFactor})`,
        `0 12px 24px rgba(0, 0, 0, ${0.25 * depthFactor})`,
        `0 24px 48px rgba(0, 0, 0, ${0.3 * depthFactor})`,
        `0 0 60px rgba(99, 102, 241, ${0.5 * depthFactor})`,
        `0 0 100px rgba(139, 92, 246, ${0.35 * depthFactor})`,
        `inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
        `inset 0 -1px 4px rgba(0, 0, 0, 0.2)`
      ].join(', ');
    }
    return [
      `0 2px 4px rgba(0, 0, 0, ${0.1 * depthFactor})`,
      `0 6px 12px rgba(0, 0, 0, ${0.12 * depthFactor})`,
      `0 12px 24px rgba(0, 0, 0, ${0.15 * depthFactor})`,
      `inset 0 1px 0 rgba(255, 255, 255, 0.05)`,
      `inset 0 -1px 2px rgba(0, 0, 0, 0.1)`
    ].join(', ');
  };

  const handleResizeStart = useCallback((edge: string) => (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeEdge(edge);
    const startCardX = card.position.x;
    resizeStartState.current = {
      width: card.size.width,
      height: card.size.height,
      x: e.clientX,
      y: e.clientY
    };
    setFocusedCard(card.id);
    
    const handleMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - resizeStartState.current.x;
      const deltaY = moveEvent.clientY - resizeStartState.current.y;
      
      let newWidth = resizeStartState.current.width;
      let newHeight = resizeStartState.current.height;
      let newX = startCardX;
      
      if (edge.includes('right') || edge === 'corner') {
        newWidth = Math.max(MIN_WIDTH, resizeStartState.current.width + deltaX);
      }
      if (edge.includes('bottom') || edge === 'corner') {
        newHeight = Math.max(MIN_HEIGHT, resizeStartState.current.height + deltaY);
      }
      if (edge === 'left') {
        const potentialWidth = resizeStartState.current.width - deltaX;
        if (potentialWidth >= MIN_WIDTH) {
          newWidth = potentialWidth;
          newX = startCardX + deltaX;
        } else {
          newWidth = MIN_WIDTH;
          newX = startCardX + (resizeStartState.current.width - MIN_WIDTH);
        }
        updateCardPosition(card.id, { x: newX, y: card.position.y });
      }
      
      updateCardSize(card.id, { width: newWidth, height: newHeight });
    };
    
    const handleUp = () => {
      setIsResizing(false);
      setResizeEdge(null);
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };
    
    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
  }, [card.id, card.size, card.position, updateCardSize, updateCardPosition, setFocusedCard]);

  const handleDoubleClick = useCallback(() => {
    if (isGlobalCinemaMode) {
      exitCinema();
    } else {
      enterCinema(card.id);
    }
  }, [isGlobalCinemaMode, exitCinema, enterCinema, card.id]);

  const handleCMFKUpdate = useCallback((eventType: 'hover' | 'click' | 'view') => {
    const currentCard = useParcOSStore.getState().cards[card.id];
    if (!currentCard) return;
    const shortCMFK = cmfkEngine.convertFromCMFKVector(currentCard.cmfk);
    const newShortCMFK = cmfkEngine.updateCMFK(shortCMFK, { type: eventType });
    const newCMFK = cmfkEngine.convertToCMFKVector(newShortCMFK);
    console.log(`[CMFK] ${eventType} on ${card.id.slice(0,6)}: k ${Math.round(currentCard.cmfk.knowingness * 100)}% -> ${Math.round(newCMFK.knowingness * 100)}%`);
    updateCardCMFK(card.id, newCMFK, true);
  }, [card.id, updateCardCMFK]);

  const laneOpacity = card.metadata?.laneOpacity ?? 1;

  return (
    <motion.div
      className={`absolute flex flex-col rounded-[32px] overflow-visible transition-shadow duration-300 ${
        isFocused 
          ? 'ring-1 ring-white/40' 
          : 'ring-1 ring-white/10'
      } ${isResizing ? 'ring-2 ring-indigo-400/60' : ''}`}
      style={{
        width: card.size.width,
        height: card.size.height,
        x: card.position.x,
        y: card.position.y,
        zIndex: isGlobalCinemaMode ? 1000 : card.position.z,
        backgroundColor: isFocused ? 'rgba(20, 20, 25, 0.75)' : 'rgba(20, 20, 25, 0.6)',
        boxShadow: getCardShadow(),
        backdropFilter: getBackdropBlur(),
        WebkitBackdropFilter: getBackdropBlur(),
        opacity: isGlobalCinemaMode ? 1 : (isFocused ? 1 : laneOpacity * 0.88),
      }}
      drag={!isResizing}
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
      onMouseEnter={() => handleCMFKUpdate('hover')}
      onMouseDown={() => { setFocusedCard(card.id); handleCMFKUpdate('view'); }}
      onClick={() => handleCMFKUpdate('click')}
      onDoubleClick={handleDoubleClick}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: isGlobalCinemaMode ? 1 : (isFocused ? 1.02 : 1), 
        y: 0 
      }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      data-testid={`card-${card.id}`}
      data-card-z={card.position.z}
    >
      {/* Header / Handle */}
      <div className="h-12 flex items-center justify-between px-4 shrink-0 border-b border-white/5 bg-white/5 cursor-grab active:cursor-grabbing group">
        <div className="flex items-center gap-3">
          <motion.div 
            className="flex gap-2"
            initial={{ opacity: 0.5 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
             <motion.button 
               className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 border border-white/10" 
               data-testid={`button-close-${card.id}`}
               onClick={(e) => { e.stopPropagation(); closeCard(card.id); }}
               whileHover={{ scale: 1.2, boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)' }}
               whileTap={{ scale: 0.9 }}
               transition={{ type: 'spring', stiffness: 400, damping: 17 }}
             />
             <motion.button 
               className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 border border-white/10" 
               data-testid={`button-minimize-${card.id}`}
               onClick={() => minimizeCard(card.id)}
               whileHover={{ scale: 1.2, boxShadow: '0 0 8px rgba(234, 179, 8, 0.6)' }}
               whileTap={{ scale: 0.9 }}
               transition={{ type: 'spring', stiffness: 400, damping: 17 }}
             />
             <motion.button 
               className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 border border-white/10" 
               data-testid={`button-maximize-${card.id}`}
               onClick={(e) => { e.stopPropagation(); handleDoubleClick(); }}
               whileHover={{ scale: 1.2, boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)' }}
               whileTap={{ scale: 0.9 }}
               transition={{ type: 'spring', stiffness: 400, damping: 17 }}
             />
          </motion.div>
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
        <Suspense fallback={<div className="p-4 text-white/50">Loading...</div>}>
          {appRegistry.render(card.appId || '', { payload: card.payload, cardId: card.id })}
        </Suspense>
      </div>

      {/* CMFK Indicator (Footer) */}
      <div className="h-8 shrink-0 border-t border-white/5 bg-black/20 flex items-center px-4 justify-between rounded-b-[32px]">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]"></div>
            <span className="text-[10px] font-mono text-blue-300/80 uppercase tracking-widest" data-testid={`text-cmfk-${card.id}`}>
              Knowingness: {Math.round((card.cmfk?.knowingness || 0) * 100)}%
            </span>
          </div>
          <span className="text-[10px] text-white/20 font-mono">{card.id.slice(0,4)}</span>
      </div>

      {/* Resize Handles */}
      {!isGlobalCinemaMode && (
        <>
          {/* Bottom-right corner handle (primary) */}
          <div
            className="absolute -bottom-1 -right-1 w-6 h-6 cursor-nwse-resize z-10 group"
            onPointerDown={handleResizeStart('corner')}
            data-testid={`resize-corner-${card.id}`}
          >
            <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-white/20 group-hover:border-indigo-400/60 rounded-br-sm transition-colors" />
          </div>
          
          {/* Right edge handle */}
          <div
            className="absolute top-12 -right-1 bottom-8 w-2 cursor-ew-resize opacity-0 hover:opacity-100 transition-opacity z-10"
            onPointerDown={handleResizeStart('right')}
            data-testid={`resize-right-${card.id}`}
          >
            <div className="absolute inset-y-0 right-0 w-1 bg-indigo-400/40 rounded-full" />
          </div>
          
          {/* Bottom edge handle */}
          <div
            className="absolute left-4 -bottom-1 right-4 h-2 cursor-ns-resize opacity-0 hover:opacity-100 transition-opacity z-10"
            onPointerDown={handleResizeStart('bottom')}
            data-testid={`resize-bottom-${card.id}`}
          >
            <div className="absolute inset-x-0 bottom-0 h-1 bg-indigo-400/40 rounded-full" />
          </div>
          
          {/* Left edge handle */}
          <div
            className="absolute top-12 -left-1 bottom-8 w-2 cursor-ew-resize opacity-0 hover:opacity-100 transition-opacity z-10"
            onPointerDown={handleResizeStart('left')}
            data-testid={`resize-left-${card.id}`}
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-indigo-400/40 rounded-full" />
          </div>
        </>
      )}
    </motion.div>
  );
};
