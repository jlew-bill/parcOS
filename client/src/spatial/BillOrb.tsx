import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useParcOSStore } from '@/state/store';

export function BillOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  const isBillOpen = useParcOSStore((state) => state.isBillOpen);
  const userCMFK = useParcOSStore((state) => state.userCMFK);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.rotation.x += delta * 0.1;
      
      const scale = isBillOpen ? 1.2 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(scale, scale, scale),
        0.1
      );
    }
  });

  const intensity = 0.5 + userCMFK.knowingness * 0.5;
  const distort = 0.2 + userCMFK.fog * 0.3;

  return (
    <Sphere ref={meshRef} args={[0.5, 64, 64]} position={[4, 3, -2]}>
      <MeshDistortMaterial
        color="#6366f1"
        attach="material"
        distort={distort}
        speed={2}
        roughness={0.1}
        metalness={0.8}
        emissive="#4f46e5"
        emissiveIntensity={intensity}
        transparent
        opacity={0.9}
      />
    </Sphere>
  );
}
