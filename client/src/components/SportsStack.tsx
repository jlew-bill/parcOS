import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Brain, TrendingUp, RefreshCw } from 'lucide-react';
import { fetchAllSports, GameCard, simulateLiveUpdate } from '@/services/sports-data';
import { billSportsCommands } from '@/state/bill-sports-commands';
import { useParcOSStore } from '@/state/store';

export const SportsStack: React.FC = () => {
  const [games, setGames] = useState<GameCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Initial fetch on mount
  useEffect(() => {
    const loadGames = async () => {
      setLoading(true);
      try {
        const data = await fetchAllSports();
        setGames(data);
        console.log('[SportsStack] Loaded', data.length, 'games');
      } catch (error) {
        console.error('[SportsStack] Load error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGames();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      setGames(prev => prev.map(game => {
        if (game.status === 'live') {
          return simulateLiveUpdate(game);
        }
        return game;
      }));
    }, 30000);

    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    const data = await fetchAllSports();
    setGames(data);
    setLoading(false);
  };

  const liveGames = games.filter(g => g.status === 'live');
  const scheduledGames = games.filter(g => g.status === 'scheduled');
  const finalGames = games.filter(g => g.status === 'final');

  return (
    <div className="h-full flex flex-col text-white bg-white/5 p-4 gap-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-2 pb-3 border-b border-white/10 sticky top-0 bg-white/5">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h2 className="text-sm font-semibold">Sports Bar</h2>
        </div>
        <motion.button
          whileHover={{ rotate: 180 }}
          onClick={handleRefresh}
          disabled={loading}
          className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Live Games */}
      {liveGames.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            LIVE NOW ({liveGames.length})
          </h3>
          <div className="space-y-2">
            {liveGames.map(game => (
              <GameCardRow key={game.id} game={game} />
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Games */}
      {scheduledGames.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
            UPCOMING ({scheduledGames.length})
          </h3>
          <div className="space-y-2">
            {scheduledGames.slice(0, 3).map(game => (
              <GameCardRow key={game.id} game={game} />
            ))}
          </div>
        </div>
      )}

      {/* Final Games */}
      {finalGames.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">
            FINAL ({finalGames.length})
          </h3>
          <div className="space-y-2">
            {finalGames.slice(0, 2).map(game => (
              <GameCardRow key={game.id} game={game} />
            ))}
          </div>
        </div>
      )}

      {loading && <div className="text-center text-white/40 text-xs py-2">Loading...</div>}
      {games.length === 0 && !loading && <div className="text-center text-white/40 text-xs py-4">No games found</div>}
    </div>
  );
};

const GameCardRow: React.FC<{ game: GameCard }> = ({ game }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-default"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      whileHover={{ scale: 1.02 }}
    >
      {/* Score Row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <div className="text-xs font-bold text-white/90">{game.homeTeam.team}</div>
          <div className="text-xs text-white/50">{game.awayTeam.team}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-white">{game.homeTeam.score}</div>
          <div className="text-sm font-bold text-white">{game.awayTeam.score}</div>
        </div>
        <div className="ml-3">
          <div className={`text-[10px] font-mono uppercase ${
            game.status === 'live' ? 'text-red-400 animate-pulse' :
            game.status === 'final' ? 'text-green-400' : 'text-blue-300'
          }`}>
            {game.status === 'live' ? `LIVE ${game.time}` : game.time}
          </div>
          {game.league && <div className="text-[9px] text-white/40">{game.league}</div>}
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && game.status === 'live' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex gap-1.5 mt-2 pt-2 border-t border-white/5"
        >
          <ActionButton
            icon={Brain}
            label="Analyze"
            onClick={() => billSportsCommands.analyzeGame(game)}
            data-testid={`analyze-${game.id}`}
          />
          <ActionButton
            icon={Zap}
            label="Momentum"
            onClick={() => billSportsCommands.createMomentumCard(game)}
            data-testid={`momentum-${game.id}`}
          />
          <ActionButton
            icon={TrendingUp}
            label="Predict"
            onClick={() => billSportsCommands.createPredictionCard(game)}
            data-testid={`predict-${game.id}`}
          />
          <ActionButton
            icon={Trophy}
            label="Narrative"
            onClick={() => billSportsCommands.generateNarrativeCard(game)}
            data-testid={`narrative-${game.id}`}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

const ActionButton: React.FC<{
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  'data-testid'?: string;
}> = ({ icon: Icon, label, onClick, 'data-testid': testId }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex-1 px-2 py-1 rounded-md bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/30 text-[10px] font-medium text-indigo-200 transition-all flex items-center gap-1 justify-center"
      data-testid={testId}
    >
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </motion.button>
  );
};
