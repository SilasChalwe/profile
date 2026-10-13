import React, { useRef, useState } from 'react';
import { Html, Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function Terminal({ position, rotation = [0,0,0], project, color, onOpen }) {
  const ref = useRef();
  const screenRef = useRef();
  const { camera } = useThree();
  const [hovered, setHovered] = useState(false);
  const [near, setNear] = useState(false);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const distance = camera.position.distanceTo(ref.current.getWorldPosition(new THREE.Vector3()));
    setNear(previous => distance < 6.5 ? true : distance > 7.5 ? false : previous);

    // Gentle floating effect
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.2 + position[0]) * 0.05;

    // Rotate to face player slightly if hovered/near
    const targetRotY = rotation[1] + (hovered || near ? 0.1 : 0);
    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, targetRotY, 4, delta);

    if (screenRef.current) {
       screenRef.current.material.emissiveIntensity = THREE.MathUtils.damp(
         screenRef.current.material.emissiveIntensity,
         hovered || near ? 0.6 : 0.1,
         5,
         delta
       );
    }
  });

  const active = hovered || near;

  return <group ref={ref} position={position} rotation={rotation}>
    {/* Stand */}
    <mesh position={[0, -1, -0.2]}>
      <cylinderGeometry args={[0.1, 0.4, 2, 8]} />
      <meshStandardMaterial color="#0f141e" metalness={0.8} roughness={0.3} />
    </mesh>

    {/* Base plate */}
    <mesh position={[0, -2, -0.2]}>
      <cylinderGeometry args={[1, 1.2, 0.1, 16]} />
      <meshStandardMaterial color="#0b1012" metalness={0.9} roughness={0.5} />
    </mesh>
    <mesh position={[0, -1.95, -0.2]}>
      <ringGeometry args={[0.8, 1, 16]} />
      <meshStandardMaterial color="#000" emissive={color} emissiveIntensity={active ? 1 : 0.2} rotation-x={-Math.PI/2} />
    </mesh>

    {/* Main Screen Body */}
    <mesh
      castShadow
      onPointerOver={event => { event.stopPropagation(); setHovered(true); document.body.classList.add('is-targeting'); }}
      onPointerOut={() => { setHovered(false); document.body.classList.remove('is-targeting'); }}
      onClick={event => { event.stopPropagation(); onOpen(project.id); }}
    >
      <boxGeometry args={[3, 2.2, 0.15]} />
      <meshStandardMaterial color="#05070a" metalness={0.9} roughness={0.1} />
    </mesh>

    {/* Screen Display */}
    <mesh ref={screenRef} position={[0, 0, 0.08]}>
      <planeGeometry args={[2.8, 2]} />
      <meshStandardMaterial color="#000" emissive={color} />
    </mesh>

    {/* Content */}
    <Text position={[0, 0.5, 0.1]} fontSize={0.3} maxWidth={2.6} textAlign="center" color={active ? '#fff' : color} anchorX="center" font="https://fonts.gstatic.com/s/chakrapetch/v11/cIflMapbsEk7TDLdtEz1Bwkc7_Qw0g.woff">
      {project.title.toUpperCase()}
    </Text>
    <Text position={[0, -0.1, 0.1]} fontSize={0.12} maxWidth={2.4} lineHeight={1.4} textAlign="center" color="#c5c6c7" anchorX="center" font="https://fonts.gstatic.com/s/spacemono/v13/i7dPIFZifjKcF5UAWdDRYEF8RQ.woff">
      {project.discipline}
    </Text>

    {/* Status / Action Button */}
    <mesh position={[0, -0.65, 0.1]}>
      <planeGeometry args={[2, 0.3]} />
      <meshBasicMaterial color={active ? color : '#1a2530'} />
    </mesh>
    <Text position={[0, -0.65, 0.11]} fontSize={0.1} color={active ? '#000' : '#8a9ba8'} anchorX="center" anchorY="middle" font="https://fonts.gstatic.com/s/spacemono/v13/i7dPIFZifjKcF5UAWdDRYEF8RQ.woff">
      {active ? 'INITIALIZE INSPECTION' : project.status.toUpperCase()}
    </Text>

    {/* Floating Holographic Prompt */}
    {active && (
      <Html center position={[0, 1.8, 0]} distanceFactor={12}>
        <div className="world-prompt">
          {near ? 'READY FOR INSPECTION' : 'SYSTEM OFFLINE'}
        </div>
      </Html>
    )}
  </group>;
}
