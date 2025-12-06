import React, { useEffect } from 'react';
import { SystemBar } from '@/components/SystemBar';
import { Dock } from '@/components/Dock';
import { Canvas } from '@/components/Canvas';
import { BillOverlay } from '@/components/BillOverlay';
import { initializeState, useParcOSStore } from '@/state/store';
import { Toaster } from "@/components/ui/toaster";
import { highlightEngine } from '@/services/highlight-engine';

function App() {
  useEffect(() => {
    initializeState();

    const store = useParcOSStore.getState();
    store.loadHighlightsFromApi();

    const handleHighlight = (highlight: any) => {
      store.addHighlight(highlight);
    };
    
    highlightEngine.onHighlight(handleHighlight);

    setTimeout(() => {
      highlightEngine.updateGameState('game-nfl-001', {
        gameId: 'game-nfl-001',
        homeTeam: 'Kansas City Chiefs',
        awayTeam: 'Buffalo Bills',
        homeScore: 24,
        awayScore: 21,
        momentum: { team: 'Kansas City Chiefs', direction: 'stable' }
      });
      
      highlightEngine.updateGameState('game-nba-001', {
        gameId: 'game-nba-001',
        homeTeam: 'Los Angeles Lakers',
        awayTeam: 'Golden State Warriors',
        homeScore: 102,
        awayScore: 99,
        momentum: { team: 'Los Angeles Lakers', direction: 'stable' }
      });
    }, 1000);

    setTimeout(() => {
      highlightEngine.updateGameState('game-nfl-001', {
        gameId: 'game-nfl-001',
        homeTeam: 'Kansas City Chiefs',
        awayTeam: 'Buffalo Bills',
        homeScore: 31,
        awayScore: 21,
        momentum: { team: 'Kansas City Chiefs', direction: 'up' }
      });
      
      highlightEngine.updateGameState('game-nba-001', {
        gameId: 'game-nba-001',
        homeTeam: 'Los Angeles Lakers',
        awayTeam: 'Golden State Warriors',
        homeScore: 115,
        awayScore: 99,
        momentum: { team: 'Los Angeles Lakers', direction: 'up' }
      });
    }, 3000);

    return () => {
      highlightEngine.removeHighlight(handleHighlight);
    };
  }, []);

  return (
    <div className="w-full h-screen bg-[#0a0a0c] text-white overflow-visible font-sans selection:bg-indigo-500/30">
      <SystemBar />
      <Canvas />
      <Dock />
      <BillOverlay />
      <Toaster />
      
      {/* Background ambient light */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
          <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px] opacity-40 mix-blend-screen animate-pulse duration-10000" />
          <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px] opacity-30 mix-blend-screen" />
      </div>
    </div>
  );
}

export default App;
