import React, { useEffect } from 'react';
import { Router, Route, Switch, Redirect } from 'wouter';
import { Landing } from '@/pages/Landing';
import { Pricing } from '@/pages/Pricing';
import { Dock } from '@/components/Dock';
import { Canvas } from '@/components/Canvas';
import { SystemBar } from '@/components/SystemBar';
import { BillOverlay } from '@/components/BillOverlay';
import { BillPresence } from '@/components/BillPresence';
import { SpatialHUD } from '@/components/SpatialHUD';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { SpatialShell } from '@/spatial';
import { initializeState, useParcOSStore } from '@/state/store';
import { Toaster } from "@/components/ui/toaster";
import { highlightEngine } from '@/services/highlight-engine';
import NotFound from '@/pages/not-found';

function ParcOSApp() {
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
      <SystemBar />
      <Canvas />
      <SpatialHUD />
      <Dock />
      <BillOverlay />
      <BillPresence />
      <Toaster />
    </div>
  );
}

function ParcBarRedirect() {
  useEffect(() => {
    const store = useParcOSStore.getState();
    initializeState();
    
    setTimeout(() => {
      const dockItems = [
        { id: 'parcbar', app: 'parcbar-sports', workspace: 'PARCBAR', stack: 'parcbar', label: 'parcBar' }
      ];
      const item = dockItems[0];
      store.setActiveWorkspace(item.workspace, item.stack);
    }, 100);
  }, []);
  
  return <ParcOSApp />;
}

function NILRedirect() {
  useEffect(() => {
    const store = useParcOSStore.getState();
    initializeState();
    
    setTimeout(() => {
      store.setActiveWorkspace('NIL', 'nil');
    }, 100);
  }, []);
  
  return <ParcOSApp />;
}

function CreatorRedirect() {
  useEffect(() => {
    const store = useParcOSStore.getState();
    initializeState();
    
    setTimeout(() => {
      store.setActiveWorkspace('CREATOR', 'creator');
    }, 100);
  }, []);
  
  return <ParcOSApp />;
}

function BoardRedirect() {
  useEffect(() => {
    const store = useParcOSStore.getState();
    initializeState();
    
    setTimeout(() => {
      store.setActiveWorkspace('BOARD', 'board');
    }, 100);
  }, []);
  
  return <ParcOSApp />;
}

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/app" component={ParcOSApp} />
        <Route path="/station" component={ParcOSApp} />
        <Route path="/parcbar" component={ParcBarRedirect} />
        <Route path="/nil" component={NILRedirect} />
        <Route path="/creator" component={CreatorRedirect} />
        <Route path="/board" component={BoardRedirect} />
        <Route path="/id">
          {() => <Redirect to="/app" />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

export default App;
