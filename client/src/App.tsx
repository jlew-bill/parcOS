import React, { useEffect } from 'react';
import { SystemBar } from '@/components/SystemBar';
import { Dock } from '@/components/Dock';
import { Canvas } from '@/components/Canvas';
import { BillOverlay } from '@/components/BillOverlay';
import { initializeState } from '@/state/store';
import { Toaster } from "@/components/ui/toaster";
import { highlightEngine } from '@/services/highlight-engine';

function App() {
  useEffect(() => {
    // Initialize mock data on load
    initializeState();

    // Start demo highlights for showcase
    setTimeout(() => {
      highlightEngine.updateGameState('game-nfl-001', {
        gameId: 'game-nfl-001',
        homeTeam: 'Kansas City Chiefs',
        awayTeam: 'Buffalo Bills',
        homeScore: 31,
        awayScore: 21,
        previousHomeScore: 24,
        previousAwayScore: 21,
        momentum: { team: 'Kansas City Chiefs', direction: 'up' }
      });
      
      highlightEngine.updateGameState('game-nba-001', {
        gameId: 'game-nba-001',
        homeTeam: 'Los Angeles Lakers',
        awayTeam: 'Golden State Warriors',
        homeScore: 115,
        awayScore: 99,
        previousHomeScore: 102,
        previousAwayScore: 99,
        momentum: { team: 'Los Angeles Lakers', direction: 'up' }
      });
    }, 2000);
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
