import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParcOSStore } from '@/state/store';

type BackgroundTheme = 'nebula' | 'matrix' | 'aurora' | 'cosmic' | 'minimal';

interface ShapeVector {
  id: number;
  x: number;
  y: number;
  z: number;
  w: number; // 4th dimension - time/phase
  scale: number;
  rotation: number;
  hue: number;
  vertices: number;
  opacity: number;
  speed: number;
}

const generateShapeVectors = (count: number, theme: BackgroundTheme): ShapeVector[] => {
  const vectors: ShapeVector[] = [];
  const themeHues: Record<BackgroundTheme, number[]> = {
    nebula: [260, 280, 300, 320],
    matrix: [120, 140, 160, 100],
    aurora: [160, 180, 200, 280],
    cosmic: [240, 260, 280, 340],
    minimal: [220, 240, 260, 200],
  };

  for (let i = 0; i < count; i++) {
    const hues = themeHues[theme];
    vectors.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 100, // Depth layer (0-100)
      w: Math.random() * Math.PI * 2, // Phase offset for 4D time cycling
      scale: Math.random() * 0.8 + 0.2,
      rotation: Math.random() * 360,
      hue: hues[Math.floor(Math.random() * hues.length)],
      vertices: Math.floor(Math.random() * 4) + 3, // 3-6 sided shapes
      opacity: Math.random() * 0.15 + 0.05,
      speed: Math.random() * 0.5 + 0.3,
    });
  }
  return vectors;
};

const Shape3D: React.FC<{ vector: ShapeVector; time: number }> = ({ vector, time }) => {
  const phase = (time * vector.speed + vector.w) % (Math.PI * 2);
  const zScale = 0.3 + (vector.z / 100) * 0.7;
  const parallaxX = Math.sin(phase) * (10 - vector.z / 10);
  const parallaxY = Math.cos(phase * 0.7) * (8 - vector.z / 12);
  
  const size = 40 + vector.scale * 80;
  const blur = 20 + (100 - vector.z) * 0.5;
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${vector.x + parallaxX}%`,
        top: `${vector.y + parallaxY}%`,
        width: size * zScale,
        height: size * zScale,
        background: `radial-gradient(ellipse at center, 
          hsla(${vector.hue}, 60%, 50%, ${vector.opacity * zScale}) 0%,
          hsla(${vector.hue + 20}, 50%, 40%, ${vector.opacity * 0.5 * zScale}) 40%,
          transparent 70%)`,
        borderRadius: vector.vertices === 3 ? '0%' : vector.vertices === 4 ? '10%' : '50%',
        filter: `blur(${blur}px)`,
        transform: `
          rotate(${vector.rotation + time * 10 * vector.speed}deg)
          scale3d(${1 + Math.sin(phase) * 0.1}, ${1 + Math.cos(phase) * 0.1}, 1)
        `,
        transformStyle: 'preserve-3d',
        zIndex: Math.floor(vector.z / 10),
        mixBlendMode: 'screen',
      }}
      animate={{
        opacity: [vector.opacity * 0.7, vector.opacity, vector.opacity * 0.7],
      }}
      transition={{
        duration: 4 + vector.speed * 6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};

const FlowLine: React.FC<{ index: number; theme: BackgroundTheme; time: number }> = ({ index, theme, time }) => {
  const themeColors: Record<BackgroundTheme, string> = {
    nebula: 'rgba(139, 92, 246, 0.15)',
    matrix: 'rgba(34, 197, 94, 0.12)',
    aurora: 'rgba(56, 189, 248, 0.12)',
    cosmic: 'rgba(99, 102, 241, 0.15)',
    minimal: 'rgba(148, 163, 184, 0.08)',
  };

  const yOffset = 15 + index * 20;
  const phase = time * 0.3 + index * 0.5;
  
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.6, mixBlendMode: 'screen' }}
    >
      <defs>
        <linearGradient id={`flowGrad-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="30%" stopColor={themeColors[theme]} />
          <stop offset="70%" stopColor={themeColors[theme]} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d={`M 0 ${yOffset}% 
            Q ${25 + Math.sin(phase) * 10}% ${yOffset + Math.sin(phase * 2) * 8}%, 
              50% ${yOffset + Math.cos(phase) * 5}% 
            T 100% ${yOffset + Math.sin(phase * 1.5) * 6}%`}
        fill="none"
        stroke={`url(#flowGrad-${index})`}
        strokeWidth="2"
        style={{
          filter: 'blur(4px)',
        }}
      />
    </svg>
  );
};

const DepthGrid: React.FC<{ theme: BackgroundTheme }> = ({ theme }) => {
  const gridColors: Record<BackgroundTheme, string> = {
    nebula: 'rgba(139, 92, 246, 0.06)',
    matrix: 'rgba(34, 197, 94, 0.05)',
    aurora: 'rgba(56, 189, 248, 0.05)',
    cosmic: 'rgba(99, 102, 241, 0.06)',
    minimal: 'rgba(148, 163, 184, 0.03)',
  };

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        perspective: '1000px',
        perspectiveOrigin: '50% 50%',
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          transform: 'rotateX(60deg) translateZ(-200px)',
          transformOrigin: '50% 100%',
          backgroundImage: `
            linear-gradient(${gridColors[theme]} 1px, transparent 1px),
            linear-gradient(90deg, ${gridColors[theme]} 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          opacity: 0.5,
        }}
      />
    </div>
  );
};

export const AnimatedBackground: React.FC = () => {
  const [time, setTime] = useState(0);
  const [theme, setTheme] = useState<BackgroundTheme>('cosmic');
  const rafRef = useRef<number>();
  
  const shapes = useMemo(() => generateShapeVectors(12, theme), [theme]);
  
  useEffect(() => {
    let lastTime = performance.now();
    
    const animate = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      setTime(t => t + delta);
      rafRef.current = requestAnimationFrame(animate);
    };
    
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const themeGradients: Record<BackgroundTheme, string> = {
    nebula: `
      radial-gradient(ellipse 80% 60% at 20% 30%, rgba(139, 92, 246, 0.12) 0%, transparent 50%),
      radial-gradient(ellipse 60% 80% at 80% 70%, rgba(219, 39, 119, 0.08) 0%, transparent 50%),
      linear-gradient(135deg, rgba(15, 10, 25, 1) 0%, rgba(10, 10, 20, 1) 100%)
    `,
    matrix: `
      radial-gradient(ellipse 70% 50% at 30% 20%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
      radial-gradient(ellipse 50% 70% at 70% 80%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
      linear-gradient(180deg, rgba(5, 15, 10, 1) 0%, rgba(10, 10, 15, 1) 100%)
    `,
    aurora: `
      radial-gradient(ellipse 90% 40% at 50% 10%, rgba(56, 189, 248, 0.12) 0%, transparent 50%),
      radial-gradient(ellipse 60% 60% at 20% 80%, rgba(34, 211, 238, 0.08) 0%, transparent 50%),
      radial-gradient(ellipse 50% 50% at 80% 60%, rgba(168, 85, 247, 0.06) 0%, transparent 50%),
      linear-gradient(180deg, rgba(10, 15, 25, 1) 0%, rgba(10, 10, 18, 1) 100%)
    `,
    cosmic: `
      radial-gradient(ellipse 80% 50% at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
      radial-gradient(ellipse 60% 70% at 75% 75%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
      radial-gradient(ellipse 40% 40% at 50% 50%, rgba(79, 70, 229, 0.05) 0%, transparent 50%),
      linear-gradient(135deg, rgba(12, 10, 22, 1) 0%, rgba(8, 8, 16, 1) 100%)
    `,
    minimal: `
      radial-gradient(ellipse 100% 100% at 50% 50%, rgba(100, 116, 139, 0.05) 0%, transparent 70%),
      linear-gradient(180deg, rgba(15, 15, 20, 1) 0%, rgba(10, 10, 15, 1) 100%)
    `,
  };

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden"
      style={{ background: themeGradients[theme] }}
      data-testid="animated-background"
    >
      {/* 3D Perspective Grid */}
      {theme !== 'minimal' && <DepthGrid theme={theme} />}
      
      {/* 4D Shape Vectors */}
      {shapes.map(shape => (
        <Shape3D key={shape.id} vector={shape} time={time} />
      ))}
      
      {/* Flowing energy lines */}
      {theme !== 'minimal' && [0, 1, 2].map(i => (
        <FlowLine key={i} index={i} theme={theme} time={time} />
      ))}

      {/* Subtle vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 70% at 50% 50%, transparent 0%, rgba(0,0,0,0.4) 100%)`,
        }}
      />

      {/* Theme selector - subtle floating control */}
      <motion.div
        className="fixed bottom-4 left-4 z-50 flex gap-1 p-1 rounded-full bg-black/20 backdrop-blur-md border border-white/5"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        data-testid="theme-selector"
      >
        {(['cosmic', 'nebula', 'aurora', 'matrix', 'minimal'] as BackgroundTheme[]).map(t => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={`w-5 h-5 rounded-full transition-all ${
              theme === t 
                ? 'ring-2 ring-white/40 scale-110' 
                : 'opacity-50 hover:opacity-80'
            }`}
            style={{
              background: t === 'cosmic' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' :
                         t === 'nebula' ? 'linear-gradient(135deg, #8b5cf6, #db2777)' :
                         t === 'aurora' ? 'linear-gradient(135deg, #38bdf8, #22d3ee)' :
                         t === 'matrix' ? 'linear-gradient(135deg, #22c55e, #10b981)' :
                         'linear-gradient(135deg, #64748b, #475569)',
            }}
            title={t.charAt(0).toUpperCase() + t.slice(1)}
            data-testid={`theme-button-${t}`}
          />
        ))}
      </motion.div>
    </div>
  );
};
