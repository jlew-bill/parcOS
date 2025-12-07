import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, GradientTexture } from '@react-three/drei';
import * as THREE from 'three';
import { BillOrb } from './BillOrb';
import { CMFKAmbience } from './CMFKAmbience';
import { SpatialParticles } from './SpatialParticles';
import { useParcOSStore } from '@/state/store';

function useSpatialCamera() {
  const activeWorkspace = useParcOSStore((state) => state.activeWorkspace);
  
  const cameraTarget = useMemo(() => {
    switch (activeWorkspace) {
      case 'SPORTS':
        return { position: new THREE.Vector3(0, 0, 12), rotation: new THREE.Euler(0, 0, 0) };
      case 'NIL':
        return { position: new THREE.Vector3(2, 1, 10), rotation: new THREE.Euler(0.05, 0.1, 0) };
      case 'CLASSROOM':
        return { position: new THREE.Vector3(-1, 0.5, 11), rotation: new THREE.Euler(0.02, -0.05, 0) };
      default:
        return { position: new THREE.Vector3(0, 0, 10), rotation: new THREE.Euler(0, 0, 0) };
    }
  }, [activeWorkspace]);

  return cameraTarget;
}

function AmbientGradientSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} scale={[50, 50, 50]} position={[0, 0, -20]}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshBasicMaterial side={THREE.BackSide} transparent opacity={0.6}>
        <GradientTexture
          stops={[0, 0.3, 0.6, 1]}
          colors={['#0a0a1a', '#1a1a2e', '#16213e', '#0f3460']}
        />
      </meshBasicMaterial>
    </mesh>
  );
}

function AmbientLighting() {
  return (
    <>
      <ambientLight intensity={0.15} color="#6366f1" />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.1} 
        color="#a5b4fc"
      />
      <pointLight 
        position={[-5, 5, 5]} 
        intensity={0.1} 
        color="#818cf8" 
        distance={30}
      />
    </>
  );
}

function FloatingOrbs() {
  return (
    <>
      <Float speed={0.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh position={[-8, 4, -5]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial 
            color="#6366f1" 
            emissive="#4f46e5" 
            emissiveIntensity={0.5}
            transparent
            opacity={0.4}
          />
        </mesh>
      </Float>
      <Float speed={0.7} rotationIntensity={0.1} floatIntensity={0.4}>
        <mesh position={[10, -3, -8]}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial 
            color="#8b5cf6" 
            emissive="#7c3aed" 
            emissiveIntensity={0.4}
            transparent
            opacity={0.3}
          />
        </mesh>
      </Float>
    </>
  );
}

export function SpatialScene() {
  const cameraTarget = useSpatialCamera();
  const isBillOpen = useParcOSStore((state) => state.isBillOpen);
  
  useFrame((state) => {
    state.camera.position.lerp(cameraTarget.position, 0.02);
  });

  return (
    <>
      <AmbientLighting />
      <AmbientGradientSphere />
      <CMFKAmbience />
      <SpatialParticles />
      <FloatingOrbs />
      <BillOrb />
    </>
  );
}
