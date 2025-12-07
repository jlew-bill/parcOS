import React from 'react';
import { useFrame } from '@react-three/fiber';
import { BillOrb } from './BillOrb';
import { CMFKAmbience } from './CMFKAmbience';
import { SpatialParticles } from './SpatialParticles';

export function SpatialScene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <CMFKAmbience />
      <BillOrb />
      <SpatialParticles />
    </>
  );
}
