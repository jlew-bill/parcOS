import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, GraduationCap, LayoutGrid, Settings, DollarSign, FolderGit2, Globe, X } from 'lucide-react';
import { useParcOSStore } from '@/state/store';
import { nanoid } from 'nanoid';

export const Dock: React.FC = () => {
  const addCard = useParcOSStore(state => state.addCard);
  const setFocusedCard = useParcOSStore(state => state.setFocusedCard);
  const minimizedCards = useParcOSStore(state => state.minimizedCards);
  const restoreCard = useParcOSStore(state => state.restoreCard);
  const cards = useParcOSStore(state => state.cards);
  const setActiveWorkspace = useParcOSStore(state => state.setActiveWorkspace);
  const spawnSportsDefaultCards = useParcOSStore(state => state.spawnSportsDefaultCards);
  const cinemaCardId = useParcOSStore(state => state.cinemaCardId);
  const sportsMode = useParcOSStore(state => state.sportsMode);
  const activeWorkspace = useParcOSStore(state => state.activeWorkspace);
  
  const isInCinemaMode = cinemaCardId !== null || (activeWorkspace === 'SPORTS' && sportsMode === 'cinema');
  
  const [expandMinimized, setExpandMinimized] = useState(false);

  const dockItems = [
    { id: 'sports', icon: Trophy, label: 'Sports', app: 'sports-multiview', workspace: 'SPORTS', stack: 'sports' },
    { id: 'nil', icon: DollarSign, label: 'NIL', app: 'nil-dashboard', workspace: 'NIL', stack: 'nil' },
    { id: 'class', icon: GraduationCap, label: 'Classroom', app: 'classroom-board', workspace: 'CLASSROOM', stack: 'classroom' },
    { id: 'browser', icon: Globe, label: 'Browser', app: 'generic-browser', workspace: null, stack: null },
    { id: 'creator', icon: LayoutGrid, label: 'Creator', app: 'creator-studio', workspace: null, stack: null },
    { id: 'system', icon: Settings, label: 'System', app: 'system-tools', workspace: null, stack: null },
  ];

  const handleLaunch = (item: typeof dockItems[0]) => {
    const stacks = useParcOSStore.getState().stacks;
    const allStacks = Object.values(stacks);
    
    // Set active workspace
    if (item.workspace && item.stack) {
      setActiveWorkspace(item.workspace, item.stack);
      
      // Find or create stack
      const existingStack = allStacks.find(s => s.domain === item.stack);
      const stackId = existingStack?.id || nanoid();
      
      if (!existingStack) {
        const newStack: typeof stacks[keyof typeof stacks] = {
          id: stackId,
          type: 'stack',
          title: `${item.label} Stack`,
          domain: item.stack,
          cardIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          cmfk: { correctness: 0, misconception: 0, fog: 0.5, knowingness: 0.1 },
          metadata: {}
        };
        useParcOSStore.getState().createStack(newStack);
      }
      
      // Spawn default cards for sports workspace
      if (item.workspace === 'SPORTS') {
        spawnSportsDefaultCards(stackId);
      } else {
        // For other workspaces, spawn single card
        const maxZ = Math.max(...Object.values(cards).map(c => c.position.z), 0);
        const newCard = {
          id: nanoid(),
          type: 'card' as const,
          title: `${item.label} Stack`,
          appId: item.app,
          stackId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          cmfk: { correctness: 0, misconception: 0, fog: 0.5, knowingness: 0.1 },
          metadata: { workspace: item.workspace },
          position: { 
            x: 120 + Math.random() * 40,
            y: 120 + Math.random() * 40,
            z: maxZ + 1
          },
          size: { width: 450, height: 500 },
          layoutState: { minimized: false, pinned: false, focused: true },
          payload: item.app === 'nil-dashboard' ? { totalValue: 125000, deals: 4 } : {}
        };
        addCard(newCard);
        setFocusedCard(newCard.id);
      }
    } else {
      // Non-workspace apps
      const maxZ = Math.max(...Object.values(cards).map(c => c.position.z), 0);
      const newCard = {
        id: nanoid(),
        type: 'card' as const,
        title: `${item.label}`,
        appId: item.app,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        cmfk: { correctness: 0, misconception: 0, fog: 0.5, knowingness: 0.1 },
        metadata: {},
        position: { 
          x: 200 + Math.random() * 100, 
          y: 200 + Math.random() * 100, 
          z: maxZ + 1
        },
        size: { width: 450, height: 500 },
        layoutState: { minimized: false, pinned: false, focused: true },
        payload: {}
      };
      addCard(newCard);
      setFocusedCard(newCard.id);
    }
  };

  return (
    <motion.div 
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      animate={{ 
        opacity: isInCinemaMode ? 0.1 : 1,
        y: isInCinemaMode ? 20 : 0,
        scale: isInCinemaMode ? 0.95 : 1
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={isInCinemaMode ? { opacity: 0.6, scale: 1 } : undefined}
      data-testid="dock-container"
    >
      <motion.div 
        className="flex items-end gap-3 px-4 py-3 rounded-3xl glass-panel border-white/15 bg-black/30 backdrop-blur-2xl shadow-2xl"
        layout
      >
        {dockItems.map((item) => (
          <DockItem 
            key={item.id} 
            icon={item.icon} 
            label={item.label} 
            onClick={() => handleLaunch(item)}
            data-testid={`dock-button-${item.label}`}
          />
        ))}
        
        <div className="w-[1px] h-10 bg-white/10 mx-1"></div>
        
        {/* Minimized Cards Section */}
        {minimizedCards.length > 0 && (
          <>
            <motion.div 
              className="relative"
              onMouseEnter={() => setExpandMinimized(true)}
              onMouseLeave={() => setExpandMinimized(false)}
            >
              <DockItem 
                icon={FolderGit2} 
                label={`Minimized (${minimizedCards.length})`} 
                onClick={() => setExpandMinimized(!expandMinimized)}
                data-testid="dock-minimized-indicator"
              />
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={expandMinimized ? { opacity: 1, y: -10 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className={`absolute bottom-full right-0 mb-2 flex flex-col gap-2 ${expandMinimized ? 'pointer-events-auto' : 'pointer-events-none'}`}
              >
                {minimizedCards.map((cardId) => {
                  const card = cards[cardId];
                  return card ? (
                    <motion.button
                      key={cardId}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => restoreCard(cardId)}
                      className="px-3 py-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/30 text-xs font-medium text-white transition-all flex items-center gap-2"
                      data-testid={`restore-card-${cardId}`}
                    >
                      <span>{card.title}</span>
                      <X className="w-3 h-3" />
                    </motion.button>
                  ) : null;
                })}
              </motion.div>
            </motion.div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

const DockItem: React.FC<{ icon: React.ElementType, label: string, onClick: () => void, 'data-testid'?: string }> = ({ icon: Icon, label, onClick, 'data-testid': testId }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.2, y: -10 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/5 hover:border-white/30 transition-all duration-200"
      data-testid={testId}
    >
      <Icon className="w-6 h-6 text-white/80 group-hover:text-white drop-shadow-md" />
      <span className="absolute -bottom-8 px-2 py-1 rounded-md bg-black/80 text-[10px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">
        {label}
      </span>
      <div className="absolute -bottom-2 w-1 h-1 rounded-full bg-white/30 group-hover:bg-white/80 opacity-0 group-hover:opacity-100 transition-all" />
    </motion.button>
  );
};
