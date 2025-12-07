import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParcOSStore } from '@/state/store';

export const SpatialHUD: React.FC = () => {
  const activeWorkspace = useParcOSStore(s => s.activeWorkspace);

  return (
    <AnimatePresence>
      {activeWorkspace && (
        <motion.div
          data-testid="indicator-workspace"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-40 px-5 py-2 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/5"
        >
          <span className="text-xs font-medium text-white/50 uppercase tracking-[0.2em]">{activeWorkspace}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
