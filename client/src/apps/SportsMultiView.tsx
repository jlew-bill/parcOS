import React from 'react';
import { PlayCircle, SkipBack, SkipForward, Volume2, List, BarChart3 } from 'lucide-react';

export const SportsMultiView: React.FC<{ payload: any }> = ({ payload }) => {
  return (
    <div className="h-full flex flex-col text-white">
      {/* Main Video Area Placeholder */}
      <div className="h-48 bg-black/40 relative group overflow-hidden shrink-0">
         <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/80 to-transparent">
            <div className="text-center">
                <div className="text-sm font-medium text-white/80 mb-2">{payload.game || 'Game Feed'}</div>
                <div className="text-3xl font-bold font-mono tracking-tighter">{payload.score || '00 - 00'}</div>
                <div className="text-xs text-red-500 font-bold mt-1 animate-pulse">LIVE • Q4 2:34</div>
            </div>
         </div>
         <div className="absolute bottom-3 left-3 flex gap-2">
            <button className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md"><SkipBack className="w-4 h-4" /></button>
            <button className="p-1.5 rounded-full bg-white/90 hover:bg-white text-black"><PlayCircle className="w-4 h-4 fill-black" /></button>
            <button className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md"><SkipForward className="w-4 h-4" /></button>
         </div>
         <div className="absolute bottom-3 right-3">
             <button className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md"><Volume2 className="w-4 h-4" /></button>
         </div>
      </div>

      {/* Stats & Plays */}
      <div className="flex-1 flex flex-col bg-white/[0.02]">
        <div className="flex border-b border-white/10">
            <button className="flex-1 py-3 text-xs font-medium border-b-2 border-indigo-500 text-white">Play-by-Play</button>
            <button className="flex-1 py-3 text-xs font-medium text-white/40 hover:text-white hover:bg-white/5">Box Score</button>
            <button className="flex-1 py-3 text-xs font-medium text-white/40 hover:text-white hover:bg-white/5">Heatmap</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-0 text-sm">
            {[
                { time: '2:31', text: 'LeBron James 3pt Jump Shot made (27 PTS)', team: 'LAL' },
                { time: '2:45', text: 'Stephen Curry Driving Layup made (31 PTS)', team: 'GSW' },
                { time: '3:01', text: 'Anthony Davis Rebound (Off: 2 Def: 9)', team: 'LAL' },
                { time: '3:12', text: 'Klay Thompson 3pt Jump Shot missed', team: 'GSW' },
                { time: '3:30', text: 'Timeout: Golden State', team: 'GSW', type: 'system' },
            ].map((play, i) => (
                <div key={i} className={`px-4 py-3 border-b border-white/5 flex gap-3 ${play.type === 'system' ? 'bg-white/5' : ''}`}>
                    <span className="font-mono text-xs text-white/40 pt-0.5">{play.time}</span>
                    <div className="flex-1">
                        <span className={`text-xs font-bold mr-2 ${play.team === 'LAL' ? 'text-yellow-400' : 'text-blue-400'}`}>{play.team}</span>
                        <span className="text-white/80">{play.text}</span>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
