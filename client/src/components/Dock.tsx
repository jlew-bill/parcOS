import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, GraduationCap, LayoutGrid, Settings, DollarSign, FolderGit2, Globe } from 'lucide-react';
import { useParcOSStore } from '@/state/store';
import { nanoid } from 'nanoid';

export const Dock: React.FC = () => {
  const addCard = useParcOSStore(state => state.addCard);
  const setFocusedCard = useParcOSStore(state => state.setFocusedCard);

  const dockItems = [
    { id: 'sports', icon: Trophy, label: 'Sports', app: 'sports-multiview' },
    { id: 'nil', icon: DollarSign, label: 'NIL', app: 'nil-dashboard' },
    { id: 'class', icon: GraduationCap, label: 'Classroom', app: 'classroom-board' },
    { id: 'browser', icon: Globe, label: 'Browser', app: 'generic-browser' },
    { id: 'creator', icon: LayoutGrid, label: 'Creator', app: 'creator-studio' },
    { id: 'system', icon: Settings, label: 'System', app: 'system-tools' },
  ];

  const handleLaunch = (item: typeof dockItems[0]) => {
    const newCard = {
      id: nanoid(),
      type: 'card' as const,
      title: `${item.label} Stack`,
      appId: item.app,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cmfk: { correctness: 0, misconception: 0, fog: 0.5, knowingness: 0.1 },
      metadata: {},
      position: { 
        x: window.innerWidth / 2 - 225 + (Math.random() * 80 - 40), 
        y: window.innerHeight / 2 - 250 + (Math.random() * 80 - 40), 
        z: Math.max(...Array.from(document.querySelectorAll('[data-card-z]')).map(el => parseInt(el.getAttribute('data-card-z') || '0')), 0) + 1 
      },
      size: { width: 450, height: 500 },
      layoutState: { minimized: false, pinned: false, focused: true },
      payload: item.app === 'nil-dashboard' ? { totalValue: 125000, deals: 4 } : {}
    };
    addCard(newCard);
    setFocusedCard(newCard.id);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-end gap-3 px-4 py-3 rounded-3xl glass-panel border-white/15 bg-black/30 backdrop-blur-2xl shadow-2xl">
        {dockItems.map((item) => (
          <DockItem 
            key={item.id} 
            icon={item.icon} 
            label={item.label} 
            onClick={() => handleLaunch(item)} 
          />
        ))}
        
        <div className="w-[1px] h-10 bg-white/10 mx-1"></div>
        
        <DockItem icon={FolderGit2} label="Recent" onClick={() => {}} />
      </div>
    </div>
  );
};

const DockItem: React.FC<{ icon: React.ElementType, label: string, onClick: () => void }> = ({ icon: Icon, label, onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.2, y: -10 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/5 hover:border-white/30 transition-all duration-200"
      data-testid={`dock-button-${label}`}
    >
      <Icon className="w-6 h-6 text-white/80 group-hover:text-white drop-shadow-md" />
      <span className="absolute -bottom-8 px-2 py-1 rounded-md bg-black/80 text-[10px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">
        {label}
      </span>
      <div className="absolute -bottom-2 w-1 h-1 rounded-full bg-white/30 group-hover:bg-white/80 opacity-0 group-hover:opacity-100 transition-all" />
    </motion.button>
  );
};
