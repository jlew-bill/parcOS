import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { SpatialScene } from './SpatialScene';
import { useParcOSStore } from '@/state/store';

export function SpatialShell() {
  const spatialEnabled = useParcOSStore((state) => state.spatialEnabled);

  if (!spatialEnabled) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 w-full h-full"
      style={{ 
        zIndex: 0,
        pointerEvents: 'none'
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <SpatialScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
