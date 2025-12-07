import React, { useEffect } from 'react';
import { Dock } from '@/components/Dock';
import { Canvas } from '@/components/Canvas';
import { BillOverlay } from '@/components/BillOverlay';
import { SpatialHUD } from '@/components/SpatialHUD';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { SpatialShell } from '@/spatial';
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
    <div className="w-full h-screen text-white overflow-visible font-sans selection:bg-indigo-500/30">
      <SpatialShell />
      <AnimatedBackground />
      <Canvas />
      <SpatialHUD />
      <Dock />
      <BillOverlay />
      <Toaster />
    </div>
  );
}

export default App;
