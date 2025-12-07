import React, { useState } from 'react';
import { useParcOSStore } from '@/state/store';
import { Bot, User, Bell, Search, Hexagon } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { parcGlass, glassStyles } from '@/design/parcGlass';

export const SystemBar: React.FC = () => {
  const workspaceName = useParcOSStore(state => state.workspaceName);
  const activeWorkspace = useParcOSStore(state => state.activeWorkspace);
  const toggleBill = useParcOSStore(state => state.toggleBill);
  const isBillOpen = useParcOSStore(state => state.isBillOpen);
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const displayName = activeWorkspace || workspaceName;

  return (
    <div 
      className="fixed top-0 left-0 right-0 flex items-center justify-between px-6"
      style={{
        height: parcGlass.spacing.systemBarHeight,
        zIndex: parcGlass.zIndex.systemBar,
        background: 'hsla(240, 15%, 8%, 0.85)',
        backdropFilter: parcGlass.blur.dock,
        WebkitBackdropFilter: parcGlass.blur.dock,
        borderBottom: parcGlass.borders.thin,
      }}
    >
      <div className="flex items-center gap-3">
        <Hexagon className="w-5 h-5 text-white fill-white/20" />
        <span className="font-semibold tracking-wide text-sm font-mono text-white/90">parcOS</span>
      </div>

      <div 
        className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1"
        style={{
          borderRadius: parcGlass.radius.pill,
          background: parcGlass.colors.mistGlass.light,
          border: parcGlass.borders.thin,
          backdropFilter: parcGlass.blur.md,
        }}
      >
        <span 
          className="font-medium uppercase"
          style={{
            fontSize: parcGlass.typography.fontSize.xs,
            color: 'hsla(0, 0%, 100%, 0.8)',
            letterSpacing: parcGlass.typography.letterSpacing.wider,
          }}
        >
          {displayName}
        </span>
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
          className="flex items-center gap-2 pl-1 pr-3 py-1 transition-all group"
          style={{
            borderRadius: parcGlass.radius.pill,
            background: isBillOpen ? parcGlass.colors.electricIndigo.glow : 'hsla(245, 90%, 65%, 0.2)',
            border: isBillOpen ? parcGlass.borders.accent : '1px solid hsla(245, 90%, 65%, 0.3)',
          }}
          data-testid="button-bill-toggle"
        >
          <div 
            className="p-1 text-white"
            style={{
              borderRadius: parcGlass.radius.full,
              background: parcGlass.colors.electricIndigo[500],
              boxShadow: parcGlass.shadows.bloom.indigo,
            }}
          >
            <Bot className="w-3 h-3" />
          </div>
          <span 
            className="font-semibold group-hover:text-white transition-colors"
            style={{
              fontSize: parcGlass.typography.fontSize.xs,
              color: parcGlass.colors.electricIndigo[100],
            }}
          >
            BILL
          </span>
        </button>

        <UserMenu isOpen={userMenuOpen} onToggle={() => setUserMenuOpen(!userMenuOpen)} />
      </div>
    </div>
  );
};
