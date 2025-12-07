import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useParcOSStore } from '@/state/store';

export function SpatialParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const userCMFK = useParcOSStore((state) => state.userCMFK);

  const particleCount = 200;

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5;

      const hue = 0.6 + Math.random() * 0.15;
      const color = new THREE.Color();
      color.setHSL(hue, 0.8, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, colors };
  }, []);

  useEffect(() => {
    if (geometryRef.current) {
      geometryRef.current.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometryRef.current.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
  }, [positions, colors]);

  useFrame((state, delta) => {
    if (pointsRef.current && geometryRef.current) {
      pointsRef.current.rotation.y += delta * 0.02;
      
      const positionAttr = geometryRef.current.attributes.position;
      if (positionAttr) {
        const positionArray = positionAttr.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positionArray[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.001;
        }
        positionAttr.needsUpdate = true;
      }
    }
  });

  const size = 0.03 + userCMFK.knowingness * 0.02;

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geometryRef} />
      <pointsMaterial
        size={size}
        vertexColors
        transparent
        opacity={0.6 - userCMFK.fog * 0.3}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
