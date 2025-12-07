import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useParcOSStore } from '@/state/store';

export function CMFKAmbience() {
  const lightRef = useRef<THREE.PointLight>(null);
  const userCMFK = useParcOSStore((state) => state.userCMFK);

  useFrame((state) => {
    if (lightRef.current) {
      const hue = 0.65 - userCMFK.fog * 0.15;
      const saturation = 0.6 + userCMFK.knowingness * 0.4;
      const lightness = 0.5 + userCMFK.correctness * 0.2;
      
      const color = new THREE.Color();
      color.setHSL(hue, saturation, lightness);
      lightRef.current.color = color;
      
      lightRef.current.intensity = 0.3 + userCMFK.knowingness * 0.4;
      
      const time = state.clock.getElapsedTime();
      lightRef.current.position.x = Math.sin(time * 0.2) * 5;
      lightRef.current.position.y = Math.cos(time * 0.15) * 3 + 2;
    }
  });

  const fogDensity = 0.02 + userCMFK.fog * 0.03;

  return (
    <>
      <fog attach="fog" args={['#0a0a1a', 5, 30]} />
      <pointLight
        ref={lightRef}
        position={[0, 5, 5]}
        intensity={0.5}
        distance={20}
        decay={2}
      />
      <hemisphereLight
        color="#6366f1"
        groundColor="#1e1b4b"
        intensity={0.2 + userCMFK.knowingness * 0.2}
      />
    </>
  );
}
