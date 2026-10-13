import React, { useMemo, useRef, useState } from 'react';
import { Float, Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Terminal from './Terminal.jsx';

function ExhibitObject({ type, color }) {
  const group = useRef();
  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.15;
      group.current.position.y = 2.6 + Math.sin(state.clock.elapsedTime * 0.8) * 0.15;
    }
  });

  const solidMaterial = <meshStandardMaterial color="#FFFFFF" metalness={0.1} roughness={0.2} />;
  const glowMaterial = <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />;
  const wireMaterial = <meshStandardMaterial color="#05245A" wireframe opacity={0.3} transparent />;

  return <group ref={group} position={[0, 2.6, 0]}>
    {type === 'software' && <>
      <mesh castShadow>{<icosahedronGeometry args={[1.2, 0]} />}{solidMaterial}</mesh>
      <mesh>{<icosahedronGeometry args={[1.3, 0]} />}{wireMaterial}</mesh>
      <mesh rotation-x={Math.PI/2}>{<torusGeometry args={[1.8, 0.03, 32, 64]} />}{glowMaterial}</mesh>
    </>}
    {type === 'mobile' && <Float speed={1.5} floatIntensity={0.3}>
      <mesh castShadow rotation-z={-0.1}>{<boxGeometry args={[1.5, 3, 0.2]} />}{solidMaterial}</mesh>
      <mesh position={[0.8, 0, 0.3]} rotation-z={0.1}>{<boxGeometry args={[1, 2, 0.15]} />}{glowMaterial}</mesh>
    </Float>}
    {type === 'design' && <>
      <mesh castShadow rotation-y={0.5}>{<boxGeometry args={[2.5, 1.5, 0.1]} />}{solidMaterial}</mesh>
      <mesh position={[-0.3, 0.2, 0.2]}>{<boxGeometry args={[1.5, 2, 0.1]} />}{glowMaterial}</mesh>
      <mesh position={[0.4, -0.2, 0.3]} rotation-y={0.2}>{<cylinderGeometry args={[0.3, 0.3, 2, 32]} />}{solidMaterial}</mesh>
    </>}
    {type === 'ai' && <>
      <mesh castShadow>{<sphereGeometry args={[1.2, 32, 32]} />}{solidMaterial}</mesh>
      {[0, 1, 2].map(i => (
        <mesh key={i} rotation={[i*1.5, i*0.5, i]}>
          <torusGeometry args={[1.8 + i*0.3, 0.02, 32, 100]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5 + i*0.2} />
        </mesh>
      ))}
    </>}
    {type === 'embedded' && <>
      <mesh castShadow>{<boxGeometry args={[2.2, 0.3, 1.5]} />}{solidMaterial}</mesh>
      <mesh position={[0, 0.3, 0]}>{<boxGeometry args={[1.5, 0.2, 1]} />}{glowMaterial}</mesh>
      {[-0.8, 0, 0.8].map((x, i) => (
        <mesh castShadow key={x} position={[x, 0.8, (i-1)*0.3]}>{<cylinderGeometry args={[0.2, 0.2, 0.8, 32]} />}{solidMaterial}</mesh>
      ))}
    </>}
    {type === 'clients' && <>
      <mesh castShadow rotation-z={Math.PI/4}>{<octahedronGeometry args={[1.2, 1]} />}{solidMaterial}</mesh>
      <mesh rotation-z={Math.PI/4}>{<octahedronGeometry args={[1.3, 1]} />}{wireMaterial}</mesh>
      <mesh rotation-x={Math.PI/2}>{<torusGeometry args={[2, 0.03, 32, 64]} />}{glowMaterial}</mesh>
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
      <cylinderGeometry args={[9, 10, 0.4, 64]} />
      <meshStandardMaterial color={near ? '#FFFFFF' : '#F1F5F9'} metalness={0.1} roughness={0.8} />
    </mesh>

    {/* Inner illuminated ring */}
    <mesh position={[0, 0.06, 0]} rotation-x={-Math.PI/2}>
      <ringGeometry args={[7, 7.2, 64]} />
      <meshStandardMaterial color={zone.color} emissive={zone.color} emissiveIntensity={near ? 1 : 0.3} transparent opacity={near ? 0.9 : 0.4} />
    </mesh>

    <ExhibitObject type={zone.id} color={zone.color} />

    <Text position={[0, 6.5, 0]} fontSize={0.6} font="https://fonts.gstatic.com/s/manrope/v15/xn7gYHE41ni1AdIRqAuZuw1Bx9mbZk79FN_B_tc.woff" color="#05245A" anchorX="center" anchorY="middle" fontWeight="bold">
      {zone.label.toUpperCase()}
    </Text>
    <Text position={[0, 5.8, 0]} fontSize={0.22} maxWidth={8} textAlign="center" color="#334155" anchorX="center" font="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf">
      {zone.description}
    </Text>

    {/* Terminals */}
    {projects.map((project, index) => {
      const count = projects.length;
      const radius = 6.5;
      const angle = (count === 1) ? 0 : (index - (count - 1) / 2) * 0.45;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      const rotY = angle;
      return <Terminal key={project.id} position={[x, 1.5, z]} rotation={[0, rotY, 0]} project={project} color={zone.color} onOpen={onProject} />;
    })}

    {!projects.length && <group position={[0, 1.5, 6]} rotation={[0, Math.PI, 0]}>
      <mesh castShadow>
        <boxGeometry args={[4.5, 2.5, 0.2]} />
        <meshStandardMaterial color="#FFFFFF" metalness={0.1} roughness={0.2} />
      </mesh>
      <mesh position={[0,0,0.11]}>
        <boxGeometry args={[4.2, 2.2, 0.05]} />
        <meshStandardMaterial color="#F8FAFC" />
      </mesh>
      <Text position={[0, 0.4, 0.15]} fontSize={0.3} color="#05245A" font="https://fonts.gstatic.com/s/manrope/v15/xn7gYHE41ni1AdIRqAuZuw1Bx9mbZk79FN_B_tc.woff" fontWeight="bold">
        CURATED EXHIBIT
      </Text>
      <Text position={[0, -0.2, 0.15]} fontSize={0.15} color="#475569" maxWidth={3.5} textAlign="center" font="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf">
        Approved project media and detailed evidence pending
      </Text>
    </group>}
  </group>;
}
