import React, { useRef, useState } from 'react';
import { Html, Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function Terminal({ position, rotation = [0,0,0], project, color, onOpen }) {
  const ref = useRef();
  const { camera } = useThree();
  const [hovered, setHovered] = useState(false);
  const [near, setNear] = useState(false);
  useFrame((state, delta) => {
    if (!ref.current) return;
    const distance = camera.position.distanceTo(ref.current.getWorldPosition(new THREE.Vector3()));
    setNear(previous => distance < 5.2 ? true : distance > 5.8 ? false : previous);
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * .9 + position[0]) * .08;
    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, rotation[1] + (hovered || near ? .08 : 0), 4, delta);
  });
  const active = hovered || near;
  return <group ref={ref} position={position} rotation={rotation}>
    <mesh castShadow onPointerOver={event => { event.stopPropagation(); setHovered(true); document.body.classList.add('is-targeting'); }} onPointerOut={() => { setHovered(false); document.body.classList.remove('is-targeting'); }} onClick={event => { event.stopPropagation(); onOpen(project.id); }}>
      <boxGeometry args={[2.8, 2.1, .22]} />
      <meshStandardMaterial color={active ? color : '#0b1f3c'} emissive={color} emissiveIntensity={active ? .5 : .08} metalness={.7} roughness={.28} />
    </mesh>
    <mesh position={[0,0, .13]}>
      <planeGeometry args={[2.45,1.68]} />
      <meshBasicMaterial color={active ? '#0b1424' : '#0b1424'} />
    </mesh>
    <Text position={[0,.42,.15]} fontSize={.25} maxWidth={2.1} textAlign="center" color={color} anchorX="center">{project.title.toUpperCase()}</Text>
    <Text position={[0,-.05,.15]} fontSize={.105} maxWidth={2} lineHeight={1.35} textAlign="center" color="#e8eef6" anchorX="center">{project.discipline}</Text>
    <Text position={[0,-.58,.15]} fontSize={.085} color={active ? '#ffffff' : '#c4cbd6'} anchorX="center">{active ? 'CLICK TO INSPECT' : project.status.toUpperCase()}</Text>
    {active && <Html center position={[0,1.45,0]} distanceFactor={10}><div className="world-prompt">{near ? 'In range · click to inspect' : 'Project terminal'}</div></Html>}
  </group>;
}
