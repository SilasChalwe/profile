import React, { useRef, useState, useEffect } from 'react';
import { Html, Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { portfolioAudio } from '../lib/audio.js';

export default function Terminal({ position, rotation = [0,0,0], project, color, onOpen }) {
  const ref = useRef();
  const screenRef = useRef();
  const { camera } = useThree();
  const [hovered, setHovered] = useState(false);
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (hovered) {
      portfolioAudio.tick();
    }
  }, [hovered]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const distance = camera.position.distanceTo(ref.current.getWorldPosition(new THREE.Vector3()));
    setNear(previous => distance < 7 ? true : distance > 8 ? false : previous);

    // Gentle floating effect
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + position[0]) * 0.05;

    // Rotate to face player slightly if hovered/near
    const targetRotY = rotation[1] + (hovered || near ? 0.1 : 0);
    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, targetRotY, 4, delta);

    if (screenRef.current) {
       screenRef.current.material.emissiveIntensity = THREE.MathUtils.damp(
         screenRef.current.material.emissiveIntensity,
         hovered || near ? 0.6 : 0,
         5,
         delta
       );
    }
  });

  const active = hovered || near;

  return <group ref={ref} position={position} rotation={rotation}>
    {/* Stand */}
    <mesh position={[0, -1, -0.1]} castShadow>
      <cylinderGeometry args={[0.08, 0.2, 2, 16]} />
      <meshStandardMaterial color="#FFFFFF" metalness={0.1} roughness={0.2} />
    </mesh>

    {/* Base plate */}
    <mesh position={[0, -1.95, -0.1]} receiveShadow>
      <cylinderGeometry args={[0.8, 1, 0.1, 32]} />
      <meshStandardMaterial color="#F8FAFC" metalness={0.1} roughness={0.8} />
    </mesh>
    <mesh position={[0, -1.90, -0.1]}>
      <ringGeometry args={[0.6, 0.8, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 0.8 : 0.2} rotation-x={-Math.PI/2} />
    </mesh>

    {/* Main Screen Body */}
    <mesh
      castShadow
      onPointerOver={event => { event.stopPropagation(); setHovered(true); document.body.classList.add('is-targeting'); }}
      onPointerOut={() => { setHovered(false); document.body.classList.remove('is-targeting'); }}
      onClick={event => {
        event.stopPropagation();
        onOpen(project.id);
      }}
    >
      <boxGeometry args={[3.2, 2.4, 0.1]} />
      <meshStandardMaterial color="#FFFFFF" metalness={0.1} roughness={0.2} />
    </mesh>

    {/* Screen Display - Deep Blue Covian Style */}
    <mesh ref={screenRef} position={[0, 0, 0.06]}>
      <planeGeometry args={[3, 2.2]} />
      <meshStandardMaterial color="#05245A" emissive="#05245A" />
    </mesh>

    {/* Content */}
    <Text position={[0, 0.6, 0.08]} fontSize={0.35} maxWidth={2.8} textAlign="center" color="#FFFFFF" anchorX="center" font="https://fonts.gstatic.com/s/manrope/v15/xn7gYHE41ni1AdIRqAuZuw1Bx9mbZk79FN_B_tc.woff" fontWeight="bold">
      {project.title.toUpperCase()}
    </Text>
    <Text position={[0, 0, 0.08]} fontSize={0.14} maxWidth={2.6} lineHeight={1.4} textAlign="center" color="#E2E8F0" anchorX="center" font="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf">
      {project.discipline}
    </Text>

    {/* Status / Action Button */}
    <mesh position={[0, -0.7, 0.07]}>
      <planeGeometry args={[2.2, 0.35]} />
      <meshBasicMaterial color={active ? color : '#1E293B'} />
    </mesh>
    <Text position={[0, -0.7, 0.08]} fontSize={0.12} color={active ? '#FFFFFF' : '#94A3B8'} anchorX="center" anchorY="middle" font="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf" fontWeight="bold">
      {active ? 'CLICK TO INSPECT PROJECT' : project.status.toUpperCase()}
    </Text>

    {/* Floating Holographic Prompt */}
    {active && (
      <Html center position={[0, 1.8, 0]} distanceFactor={12}>
        <div className="world-prompt">
          {near ? 'READY FOR INSPECTION' : 'SYSTEM STANDBY'}
        </div>
      </Html>
    )}
  </group>;
}
