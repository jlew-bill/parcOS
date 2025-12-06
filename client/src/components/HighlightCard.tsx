import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Highlight } from '@/state/types';

interface HighlightCardProps {
  highlight: Highlight;
  isNew?: boolean;
}

export const HighlightCard: React.FC<HighlightCardProps> = ({ highlight, isNew = false }) => {
  const [showPulse, setShowPulse] = useState(isNew);

  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => setShowPulse(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  const typeColors: Record<string, string> = {
    score_change: 'from-blue-500/30 to-blue-600/20',
    lead_change: 'from-purple-500/30 to-purple-600/20',
    run: 'from-orange-500/30 to-orange-600/20',
    momentum_reversal: 'from-pink-500/30 to-pink-600/20',
    injury: 'from-red-500/30 to-red-600/20',
    turnover: 'from-yellow-500/30 to-yellow-600/20',
    big_play: 'from-green-500/30 to-green-600/20'
  };

  const typeEmojis: Record<string, string> = {
    score_change: '📊',
    lead_change: '🔄',
    run: '🔥',
    momentum_reversal: '⚡',
    injury: '🏥',
    turnover: '🔃',
    big_play: '⭐'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`relative w-full h-24 px-3 py-2 rounded-lg backdrop-blur-md overflow-hidden border border-white/20 transition-all ${
        showPulse ? 'border-white/60 shadow-lg shadow-white/20' : 'shadow-sm'
      }`}
      style={{
        backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))`,
        backgroundColor: 'rgba(20, 20, 25, 0.7)'
      }}
      data-testid={`highlight-card-${highlight.id}`}
    >
      {/* Pulsing border for new highlights */}
      {showPulse && (
        <motion.div
          className="absolute inset-0 rounded-lg border border-white/60 pointer-events-none"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${typeColors[highlight.type]} rounded-lg -z-10`}
      />

      {/* Content */}
      <div className="relative flex h-full flex-col justify-between text-white">
        {/* Header with emoji and type */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{typeEmojis[highlight.type]}</span>
            <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">
              {highlight.type.replace(/_/g, ' ')}
            </span>
          </div>
          {highlight.value && (
            <span className="text-sm font-bold text-white/90 bg-white/10 px-2 py-1 rounded">
              {highlight.value}
            </span>
          )}
        </div>

        {/* Summary text */}
        <div className="flex flex-col">
          <p className="text-xs font-medium line-clamp-2 text-white/90">
            {highlight.summary}
          </p>
          <p className="text-[10px] text-white/50 mt-1">
            {new Date(highlight.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
