import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, TrendingUp, Sparkles, Activity, Users } from 'lucide-react';
import { billSportsCommands } from '@/state/bill-sports-commands';
import { useParcOSStore } from '@/state/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SportsStack } from '@/components/SportsStack';

export const BillActionsRow: React.FC<{ cardId: string; gameData?: any }> = ({ cardId, gameData }) => {
  const setSideCardId = useParcOSStore(s => s.setSideCardId);

  const actions = [
    {
      id: 'analyze',
      icon: Brain,
      label: 'Analyze',
      onClick: () => {
        if (gameData) {
          billSportsCommands.analyzeGame(gameData);
          setSideCardId('sidecard-analyze');
        }
      }
    },
    {
      id: 'momentum',
      icon: Zap,
      label: 'Momentum',
      onClick: () => {
        if (gameData) {
          billSportsCommands.createMomentumCard(gameData);
        }
      }
    },
    {
      id: 'predict',
      icon: TrendingUp,
      label: 'Predict',
      onClick: () => {
        if (gameData) {
          billSportsCommands.createPredictionCard(gameData);
        }
      }
    },
    {
      id: 'narrative',
      icon: Sparkles,
      label: 'Narrative',
      onClick: () => {
        if (gameData) {
          billSportsCommands.generateNarrativeCard(gameData);
        }
      }
    }
  ];

  return (
    <motion.div
      className="flex gap-2 p-4 bg-white/5 border-t border-white/10 justify-center flex-wrap"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      data-testid={`bill-actions-${cardId}`}
    >
      {actions.map((action) => (
        <motion.button
          key={action.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/30 text-sm font-medium text-indigo-200 transition-all"
          data-testid={`bill-action-${action.id}-${cardId}`}
        >
          <action.icon className="w-4 h-4" />
          <span>{action.label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
};

export const SportsMultiView: React.FC<{ payload: any }> = ({ payload }) => {
  const activeWorkspace = useParcOSStore(s => s.activeWorkspace);
  const sportsMode = useParcOSStore(s => s.sportsMode);
  const focusedCardId = useParcOSStore(s => s.focusedCardId);
  const cards = useParcOSStore(s => s.cards);
  
  const currentCard = focusedCardId ? cards[focusedCardId] : null;
  const isCinemaMode = activeWorkspace === 'SPORTS' && sportsMode === 'cinema';

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

        <TabsContent value="scoreboard" className={`${isCinemaMode ? 'flex-1 flex flex-col' : 'flex-1'} overflow-hidden`}>
          <SportsStack />
          {isCinemaMode && (
            <BillActionsRow cardId={currentCard?.id || ''} gameData={currentCard?.payload} />
          )}
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
