import React from 'react';
import { motion } from 'framer-motion';
import { useParcOSStore } from '@/state/store';
import { Bot } from 'lucide-react';

export const SpatialHUD: React.FC = () => {
  const activeWorkspace = useParcOSStore(s => s.activeWorkspace);
  const toggleBill = useParcOSStore(s => s.toggleBill);
  const isBillOpen = useParcOSStore(s => s.isBillOpen);

  return (
    <>
      {/* Floating BILL button - top right */}
      <motion.button
        data-testid="button-bill-toggle"
        onClick={toggleBill}
        className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-xl border transition-all ${
          isBillOpen 
            ? 'bg-indigo-500/40 border-indigo-400/60 shadow-lg shadow-indigo-500/30' 
            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="p-1 rounded-full bg-indigo-500/80">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-xs font-medium text-white/90">BILL</span>
      </motion.button>

      {/* Floating workspace indicator - top center */}
      {activeWorkspace && (
        <motion.div
          data-testid="indicator-workspace"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10"
        >
          <span className="text-xs font-medium text-white/70 uppercase tracking-widest">{activeWorkspace}</span>
        </motion.div>
      )}
    </>
  );
};
