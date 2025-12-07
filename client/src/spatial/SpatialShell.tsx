import React, { Suspense, Component, ReactNode, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { SpatialScene } from './SpatialScene';
import { useParcOSStore } from '@/state/store';

interface ErrorBoundaryState {
  hasError: boolean;
}

class SpatialErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('[SpatialShell] WebGL error caught:', error.message);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
}

export function SpatialShell() {
  const spatialEnabled = useParcOSStore((state) => state.spatialEnabled);
  const [webGLSupported, setWebGLSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setWebGLSupported(isWebGLAvailable());
  }, []);

  if (!spatialEnabled || webGLSupported === false) {
    return null;
  }

  if (webGLSupported === null) {
    return null;
  }

  return (
    <SpatialErrorBoundary>
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
            powerPreference: 'high-performance',
            failIfMajorPerformanceCaveat: false
          }}
          style={{ background: 'transparent' }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          <Suspense fallback={null}>
            <SpatialScene />
          </Suspense>
        </Canvas>
      </div>
    </SpatialErrorBoundary>
  );
}
