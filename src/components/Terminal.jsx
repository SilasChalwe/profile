import React, { useRef, useState } from 'react';
import { Html, Text, Billboard } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function Terminal({ position, rotation = [0,0,0], project, color, onOpen, onPreview, onPreviewLeave }) {
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
  return <group ref={ref} position={position} rotation={rotation}><Billboard follow lockX lockZ>
    <mesh castShadow onPointerOver={event => {
      event.stopPropagation();
      setHovered(true);
      onPreview?.(project.id);
      document.body.classList.add('is-targeting');
    }}
    onPointerOut={event => {
      event.stopPropagation();
      setHovered(false);
      onPreviewLeave?.(project.id);
      document.body.classList.remove('is-targeting');
    }}
    onClick={event => {
      event.stopPropagation();
      // On touchscreen the first tap shows the preview; an explicit button
      // inside the gallery opens the case study. Mouse click retains its action.
      if (event.nativeEvent?.pointerType === 'touch') onPreview?.(project.id);
      else onOpen(project.id);
    }}>
      <boxGeometry args={[2.8, 2.1, .22]} />
      <meshStandardMaterial color={active ? '#fff1e6' : '#ffffff'} emissive={color} emissiveIntensity={active ? .045 : 0} metalness={.06} roughness={.52} />
    </mesh>
    <mesh position={[0,0, .13]}>
      <planeGeometry args={[2.45,1.68]} />
      <meshBasicMaterial color="#f3f7fd" />
    </mesh>
    <Text position={[0,.42,.15]} fontSize={.25} maxWidth={2.1} textAlign="center" color="#05245A" anchorX="center">{project.title.toUpperCase()}</Text>
    <Text position={[0,-.05,.15]} fontSize={.105} maxWidth={2} lineHeight={1.35} textAlign="center" color="#475569" anchorX="center">{project.discipline}</Text>
    <Text position={[0,-.58,.15]} fontSize={.085} color={active ? '#FE6202' : '#475569'} anchorX="center">{active ? 'CLICK TO INSPECT' : project.status.toUpperCase()}</Text>
    {active && <Html center position={[0,1.45,0]} distanceFactor={10}><div className="world-prompt">{near ? 'In range · click to inspect' : 'Project terminal'}</div></Html>}
  </Billboard></group>;
}
