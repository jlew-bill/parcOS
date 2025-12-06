import React from 'react';
import { useParcOSStore } from '@/state/store';
import { Bot, User, Bell, Search, Hexagon } from 'lucide-react';

export const SystemBar: React.FC = () => {
  const workspaceName = useParcOSStore(state => state.workspaceName);
  const activeWorkspace = useParcOSStore(state => state.activeWorkspace);
  const toggleBill = useParcOSStore(state => state.toggleBill);
  const isBillOpen = useParcOSStore(state => state.isBillOpen);
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const displayName = activeWorkspace || workspaceName;

  return (
    <div className="fixed top-0 left-0 right-0 h-12 z-50 flex items-center justify-between px-6 glass-panel border-b border-white/10 rounded-none">
      <div className="flex items-center gap-3">
        <Hexagon className="w-5 h-5 text-white fill-white/20" />
        <span className="font-semibold tracking-wide text-sm font-mono text-white/90">parcOS</span>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
        <span className="text-xs font-medium text-white/80 uppercase tracking-wider">{displayName}</span>
      </div>

      <div className="flex items-center gap-6">
        <span className="text-sm font-mono text-white/60">{currentTime}</span>
        
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <Search className="w-4 h-4 text-white/70" />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <Bell className="w-4 h-4 text-white/70" />
          </button>
        </div>

        <div className="h-6 w-[1px] bg-white/10"></div>

        <button 
          onClick={toggleBill}
          className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-all group ${isBillOpen ? 'bg-indigo-500/30 border-indigo-400/50' : 'bg-indigo-500/20 hover:bg-indigo-500/30 border-indigo-400/30'}`}
        >
          <div className="p-1 rounded-full bg-indigo-500/80 text-white shadow-lg shadow-indigo-500/40">
            <Bot className="w-3 h-3" />
          </div>
          <span className="text-xs font-semibold text-indigo-100 group-hover:text-white transition-colors">BILL</span>
        </button>

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 border border-white/20 shadow-inner flex items-center justify-center overflow-hidden">
          <User className="w-5 h-5 text-gray-700" />
        </div>
      </div>
    </div>
  );
};
