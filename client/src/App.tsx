import React, { useEffect } from 'react';
import { SystemBar } from '@/components/SystemBar';
import { Dock } from '@/components/Dock';
import { Canvas } from '@/components/Canvas';
import { BillOverlay } from '@/components/BillOverlay';
import { initializeState } from '@/state/store';
import { Toaster } from "@/components/ui/toaster";

function App() {
  useEffect(() => {
    // Initialize mock data on load
    initializeState();
  }, []);

  return (
    <div className="w-full h-screen bg-[#0a0a0c] text-white overflow-hidden font-sans selection:bg-indigo-500/30">
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
