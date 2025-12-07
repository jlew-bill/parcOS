import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParcOSStore } from '@/state/store';
import { SNAP_ZONE_DEFINITIONS, SnapZoneType } from '@/state/types';

const ZONE_LABELS: Record<SnapZoneType, string> = {
  'left': 'Left Half',
  'right': 'Right Half',
  'center': 'Center Stage',
  'top-left': 'Top Left',
  'top-right': 'Top Right',
  'bottom-left': 'Bottom Left',
  'bottom-right': 'Bottom Right',
  'left-third': 'Left Third',
  'center-third': 'Center Third',
  'right-third': 'Right Third'
};

interface SnapZoneProps {
  zone: SnapZoneType;
  isActive: boolean;
}

const SnapZone: React.FC<SnapZoneProps> = ({ zone, isActive }) => {
  const definition = SNAP_ZONE_DEFINITIONS[zone];
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: definition.x,
        top: definition.y,
        width: definition.width,
        height: definition.height,
      }}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: isActive ? 1 : 0.15,
        scale: isActive ? 1 : 0.98
      }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      data-testid={`snap-zone-${zone}`}
    >
      <motion.div
        className={`w-full h-full rounded-2xl border-2 transition-all duration-200 ${
          isActive 
            ? 'border-indigo-400/80 bg-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.4),inset_0_0_60px_rgba(99,102,241,0.1)]' 
            : 'border-white/10 bg-white/5'
        }`}
        animate={isActive ? {
          boxShadow: [
            '0 0 30px rgba(99,102,241,0.4), inset 0 0 60px rgba(99,102,241,0.1)',
            '0 0 50px rgba(99,102,241,0.6), inset 0 0 80px rgba(99,102,241,0.15)',
            '0 0 30px rgba(99,102,241,0.4), inset 0 0 60px rgba(99,102,241,0.1)'
          ]
        } : {}}
        transition={isActive ? {
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        } : {}}
      >
        {isActive && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="px-4 py-2 rounded-xl bg-indigo-500/30 backdrop-blur-md border border-indigo-400/40">
              <span className="text-sm font-medium text-indigo-100 tracking-wide">
                {ZONE_LABELS[zone]}
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export const SnapZoneOverlay: React.FC = () => {
  const isDragging = useParcOSStore(s => s.isDragging);
  const activeSnapZone = useParcOSStore(s => s.activeSnapZone);

  const allZones: SnapZoneType[] = ['left', 'right', 'center', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];

  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: 5 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          data-testid="snap-zone-overlay"
        >
          {allZones.map((zone) => (
            <SnapZone 
              key={zone} 
              zone={zone} 
              isActive={activeSnapZone === zone}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
