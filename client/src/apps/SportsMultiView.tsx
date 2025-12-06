import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SportsStack } from '@/components/SportsStack';
import { Activity, Users, TrendingUp } from 'lucide-react';

export const SportsMultiView: React.FC<{ payload: any }> = ({ payload }) => {
  return (
    <div className="h-full flex flex-col text-white">
      <Tabs defaultValue="scoreboard" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 bg-white/5 border-b border-white/10 rounded-none">
          <TabsTrigger value="scoreboard" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Scoreboard</span>
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Teams</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Stats</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scoreboard" className="flex-1 overflow-hidden">
          <SportsStack />
        </TabsContent>

        <TabsContent value="teams" className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h3 className="font-bold mb-2">Top Teams Today</h3>
              <div className="space-y-1 text-sm text-white/70">
                <div>🏈 Kansas City Chiefs - 3-0 record</div>
                <div>🏀 Los Angeles Lakers - 15-8 record</div>
                <div>🎓 Ohio State - #1 ranked</div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h3 className="font-bold mb-2">League Leaders</h3>
              <div className="space-y-1 text-sm text-white/70">
                <div>📊 Scoring: Luka Doncic (28.3 PPG)</div>
                <div>🎯 Passing: Patrick Mahomes (285 YDS)</div>
                <div>🏃 Rushing: Nick Chubb (156 YDS)</div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
