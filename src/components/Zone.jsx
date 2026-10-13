import React, { useMemo, useRef, useState } from 'react';
import { Float, Text, Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Terminal from './Terminal.jsx';

function ExhibitObject({ type, color }) {
  const group = useRef();
  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.2;
      group.current.position.y = 2.6 + Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  const solidMaterial = <meshStandardMaterial color="#0f141e" metalness={0.9} roughness={0.1} />;
  const glowMaterial = <meshStandardMaterial color="#000" emissive={color} emissiveIntensity={2} />;

  return <group ref={group} position={[0, 2.6, 0]}>
    {type === 'software' && <>
      <mesh>{<icosahedronGeometry args={[1.2, 0]} />}{solidMaterial}</mesh>
      <mesh>{<icosahedronGeometry args={[1.25, 0]} />}{<meshStandardMaterial color={color} wireframe />}</mesh>
      <mesh rotation-x={Math.PI/2}>{<torusGeometry args={[1.8, 0.05, 16, 64]} />}{glowMaterial}</mesh>
    </>}
    {type === 'mobile' && <Float speed={2} floatIntensity={0.5}>
      <mesh rotation-z={-0.1}>{<boxGeometry args={[1.5, 3, 0.2]} />}{solidMaterial}</mesh>
      <mesh position={[0.8, 0, 0.3]} rotation-z={0.1}>{<boxGeometry args={[1, 2, 0.15]} />}{glowMaterial}</mesh>
    </Float>}
    {type === 'design' && <>
      <mesh rotation-y={0.5}>{<boxGeometry args={[2.5, 1.5, 0.1]} />}{solidMaterial}</mesh>
      <mesh position={[-0.3, 0.2, 0.2]}>{<boxGeometry args={[1.5, 2, 0.1]} />}{glowMaterial}</mesh>
      <mesh position={[0.4, -0.2, 0.3]} rotation-y={0.2}>{<cylinderGeometry args={[0.3, 0.3, 2, 32]} />}{solidMaterial}</mesh>
    </>}
    {type === 'ai' && <>
      <mesh>{<sphereGeometry args={[1.2, 32, 32]} />}{solidMaterial}</mesh>
      {[0, 1, 2].map(i => (
        <mesh key={i} rotation={[i*1.5, i*0.5, i]}>
          <torusGeometry args={[1.8 + i*0.3, 0.03, 16, 100]} />
          <meshStandardMaterial color="#000" emissive={color} emissiveIntensity={1 + i*0.5} />
        </mesh>
      ))}
    </>}
    {type === 'embedded' && <>
      <mesh>{<boxGeometry args={[2.2, 0.3, 1.5]} />}{solidMaterial}</mesh>
      <mesh position={[0, 0.3, 0]}>{<boxGeometry args={[1.5, 0.2, 1]} />}{glowMaterial}</mesh>
      {[-0.8, 0, 0.8].map((x, i) => (
        <mesh key={x} position={[x, 0.8, (i-1)*0.3]}>{<cylinderGeometry args={[0.2, 0.2, 0.8, 16]} />}{solidMaterial}</mesh>
      ))}
    </>}
    {type === 'clients' && <>
      <mesh rotation-z={Math.PI/4}>{<octahedronGeometry args={[1.2, 1]} />}{solidMaterial}</mesh>
      <mesh rotation-z={Math.PI/4}>{<octahedronGeometry args={[1.25, 1]} />}{<meshStandardMaterial color={color} wireframe />}</mesh>
      <mesh rotation-x={Math.PI/2}>{<torusGeometry args={[2, 0.05, 16, 64]} />}{glowMaterial}</mesh>
    </>}
  </group>;
}

export default function Zone({ zone, projects, onProject, onActive }) {
  const { camera } = useThree();
  const [near, setNear] = useState(false);
  const position = useMemo(() => new THREE.Vector3(...zone.position), [zone.position]);

  useFrame(() => {
    const distance = camera.position.distanceTo(position);
    setNear(previous => distance < 12 ? true : distance > 13 ? false : previous);
    if (distance < 9) onActive(zone.id);
  });

  const inwardRotation = Math.atan2(-zone.position[0], -zone.position[2]);

  return <group position={zone.position} rotation={[0, inwardRotation, 0]}>
    {/* Zone Base Platform */}
    <mesh receiveShadow position={[0, -0.15, 0]}>
      <cylinderGeometry args={[8.5, 9.5, 0.4, 32]} />
      <meshStandardMaterial color={near ? '#15202b' : '#0a0f14'} metalness={0.6} roughness={0.5} />
    </mesh>

    {/* Inner illuminated ring */}
    <mesh position={[0, 0.06, 0]} rotation-x={-Math.PI/2}>
      <ringGeometry args={[6.5, 7.5, 64]} />
      <meshStandardMaterial color="#000" emissive={zone.color} emissiveIntensity={near ? 1.5 : 0.3} transparent opacity={near ? 0.9 : 0.4} />
    </mesh>

    <ExhibitObject type={zone.id} color={zone.color} />

    <Text position={[0, 6.5, 0]} fontSize={0.6} font="https://fonts.gstatic.com/s/chakrapetch/v11/cIflMapbsEk7TDLdtEz1Bwkc7_Qw0g.woff" color={zone.color} anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000">
      {zone.label.toUpperCase()}
    </Text>
    <Text position={[0, 5.8, 0]} fontSize={0.2} maxWidth={8} textAlign="center" color="#c5c6c7" anchorX="center" font="https://fonts.gstatic.com/s/spacemono/v13/i7dPIFZifjKcF5UAWdDRYEF8RQ.woff">
      {zone.description}
    </Text>

    {/* Terminals */}
    {projects.map((project, index) => {
      const count = projects.length;
      const radius = 6;
      // Arrange terminals in an arc facing the center
      const angle = (count === 1) ? 0 : (index - (count - 1) / 2) * 0.4;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      const rotY = angle;
      return <Terminal key={project.id} position={[x, 1.5, z]} rotation={[0, rotY, 0]} project={project} color={zone.color} onOpen={onProject} />;
    })}

    {!projects.length && <group position={[0, 1.5, 5]} rotation={[0, Math.PI, 0]}>
      <mesh castShadow>
        <boxGeometry args={[4.5, 2.5, 0.3]} />
        <meshStandardMaterial color="#0b1012" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0,0,0.16]}>
        <boxGeometry args={[4.2, 2.2, 0.05]} />
        <meshStandardMaterial color="#05070a" emissive={zone.color} emissiveIntensity={near ? 0.15 : 0.02} />
      </mesh>
      <Text position={[0, 0.4, 0.2]} fontSize={0.25} color={zone.color} font="https://fonts.gstatic.com/s/chakrapetch/v11/cIflMapbsEk7TDLdtEz1Bwkc7_Qw0g.woff">
        CURATED EXHIBIT
      </Text>
      <Text position={[0, -0.2, 0.2]} fontSize={0.12} color="#8a9ba8" maxWidth={3.5} textAlign="center" font="https://fonts.gstatic.com/s/spacemono/v13/i7dPIFZifjKcF5UAWdDRYEF8RQ.woff">
        Approved project media and detailed evidence pending
      </Text>
    </group>}
  </group>;
}
