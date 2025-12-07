import React, { useEffect, useRef } from 'react';

export const AnimatedBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create floating orbs
    const createOrb = () => {
      const orb = document.createElement('div');
      const size = Math.random() * 100 + 50;
      const duration = Math.random() * 20 + 30;
      const delay = Math.random() * 5;
      const left = Math.random() * 100;
      const startTop = Math.random() * 20 - 20;

      const hues = [240, 260, 280, 200, 220]; // Blues, indigos, purples
      const hue = hues[Math.floor(Math.random() * hues.length)];
      const saturation = Math.random() * 30 + 40;
      const lightness = Math.random() * 30 + 20;

      orb.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        top: ${startTop}%;
        background: radial-gradient(circle, hsl(${hue}, ${saturation}%, ${lightness}%) 0%, transparent 70%);
        border-radius: 50%;
        filter: blur(${Math.random() * 40 + 30}px);
        opacity: ${Math.random() * 0.3 + 0.1};
        animation: float ${duration}s ease-in-out ${delay}s infinite;
        pointer-events: none;
        mix-blend-mode: screen;
      `;

      container.appendChild(orb);
    };

    // Create multiple orbs
    for (let i = 0; i < 6; i++) {
      createOrb();
    }

    return () => {
      container.innerHTML = '';
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      style={{
        background: `
          linear-gradient(135deg, 
            rgba(10, 10, 15, 1) 0%,
            rgba(15, 12, 35, 0.95) 25%,
            rgba(12, 10, 30, 0.95) 50%,
            rgba(10, 15, 25, 0.95) 75%,
            rgba(10, 10, 15, 1) 100%)
        `,
      }}
    >
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.1;
          }
          25% {
            opacity: 0.15;
          }
          50% {
            transform: translateY(-100vh) translateX(50px);
            opacity: 0.2;
          }
          75% {
            opacity: 0.15;
          }
        }

        @keyframes drift {
          0%, 100% {
            transform: translateX(0px);
          }
          50% {
            transform: translateX(20px);
          }
        }
      `}</style>

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(0deg, rgba(99, 102, 241, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Gradient overlay - top */}
      <div 
        className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, 
            rgba(79, 70, 229, 0.05) 0%, 
            rgba(79, 70, 229, 0.02) 50%,
            transparent 100%)`,
        }}
      />

      {/* Gradient overlay - bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
        style={{
          background: `linear-gradient(0deg, 
            rgba(139, 92, 246, 0.08) 0%, 
            rgba(139, 92, 246, 0.02) 50%,
            transparent 100%)`,
        }}
      />

      {/* Radial glow points */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
    </div>
  );
};
