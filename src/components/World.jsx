import React, { Suspense } from 'react';
import { Environment, Grid, Sparkles } from '@react-three/drei';
import { portfolio, worldZones } from '../content.js';
import Player from './Player.jsx';
import Zone from './Zone.jsx';

function GroundFloor() {
  return (
    <mesh receiveShadow position={[0, -0.4, 0]} rotation-x={-Math.PI / 2}>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.1} metalness={0.1} />
    </mesh>
  );
}

function Paths() {
  return <group>{worldZones.map(zone => {
    const [x,,z] = zone.position;
    const length = Math.hypot(x,z);
    const angle = Math.atan2(x,z);
    return (
      <group key={zone.id}>
        <mesh position={[x/2, 0.012, z/2]} rotation={[-Math.PI/2, 0, -angle]} receiveShadow>
          <planeGeometry args={[4, length]} />
          <meshStandardMaterial color="#F1F5F9" roughness={0.9} metalness={0.1} />
        </mesh>
        <mesh position={[x/2, 0.02, z/2]} rotation={[-Math.PI/2, 0, -angle]}>
          <planeGeometry args={[0.15, length]} />
          <meshStandardMaterial color="#05245A" emissive={zone.color} emissiveIntensity={0.8} />
        </mesh>
      </group>
    );
  })}</group>;
}

function CentralPlaza() {
  return <group>
    {/* Base Platform */}
    <mesh receiveShadow position={[0, -0.15, 0]}>
      <cylinderGeometry args={[8.5, 9.5, 0.5, 64]} />
      <meshStandardMaterial color="#F8FAFC" metalness={0.2} roughness={0.8} />
    </mesh>
    <mesh receiveShadow position={[0, 0.12, 0]}>
      <cylinderGeometry args={[6.5, 7.5, 0.1, 64]} />
      <meshStandardMaterial color="#FFFFFF" metalness={0.1} roughness={0.2} />
    </mesh>
    {/* Glowing Rings */}
    <mesh position={[0, 0.18, 0]} rotation-x={-Math.PI/2}>
      <ringGeometry args={[5.8, 5.9, 64]} />
      <meshStandardMaterial color="#05245A" emissive="#05245A" emissiveIntensity={0.5} />
    </mesh>
    <mesh position={[0, 0.18, 0]} rotation-x={-Math.PI/2}>
      <ringGeometry args={[2.5, 2.6, 64]} />
      <meshStandardMaterial color="#FE6202" emissive="#FE6202" emissiveIntensity={0.8} />
    </mesh>

    {/* Central Core Hologram (CovianHive Brand Style) */}
    <group position={[0, 2.5, 0]}>
      <mesh castShadow>
        <octahedronGeometry args={[1.2]} />
        <meshStandardMaterial color="#05245A" metalness={0.5} roughness={0.2} wireframe />
      </mesh>
      <mesh>
        <octahedronGeometry args={[0.6]} />
        <meshStandardMaterial color="#FE6202" emissive="#FE6202" emissiveIntensity={1.2} />
      </mesh>
      {[0, 1, 2].map(i => (
        <mesh key={i} rotation={[i*1.2, i*0.8, i]}>
          <torusGeometry args={[2 + i*0.4, 0.015, 32, 100]} />
          <meshStandardMaterial color={i === 1 ? '#FE6202' : '#05245A'} emissive={i === 1 ? '#FE6202' : '#05245A'} emissiveIntensity={0.5} />
        </mesh>
      ))}
      <Sparkles count={40} scale={5} size={3} speed={0.2} color="#05245A" />
      <Sparkles count={20} scale={3} size={2} speed={0.4} color="#FE6202" />
    </group>
  </group>;
}

export default function World({ paused, quality, reduceMotion, onProject, onZone }) {
  return <Suspense fallback={null}>
    <color attach="background" args={['#F8FAFC']} />
    <fog attach="fog" args={['#F8FAFC', 15, 60]} />

    {/* Premium Daylight Lighting */}
    <ambientLight intensity={0.6} color="#ffffff" />
    <hemisphereLight args={['#ffffff', '#E2E8F0', 0.8]} />
    <directionalLight position={[20, 40, 20]} intensity={1.2} color="#ffffff" castShadow={quality==='high'} shadow-mapSize={[2048, 2048]} shadow-camera-far={100} shadow-camera-left={-40} shadow-camera-right={40} shadow-camera-top={40} shadow-camera-bottom={-40} />
    <pointLight position={[0, 5, 0]} intensity={10} distance={25} color="#FE6202" />

    <GroundFloor />
    <Grid position={[0, -0.39, 0]} args={[120, 120]} cellSize={2} cellThickness={0.5} cellColor="#E2E8F0" sectionSize={10} sectionThickness={1} sectionColor="#CBD5E1" fadeDistance={60} fadeStrength={1.5} infiniteGrid />

    <Paths />
    <CentralPlaza />

    {worldZones.map(zone => (
      <Zone key={zone.id} zone={zone} projects={portfolio.projects.filter(project => zone.projectIds.includes(project.id))} onProject={onProject} onActive={onZone} />
    ))}

    {quality === 'high' && !reduceMotion && (
      <Sparkles count={150} scale={80} size={1.5} speed={0.1} color="#05245A" position={[0, 5, 0]} opacity={0.2} />
    )}

    <Environment preset="studio" environmentIntensity={0.4} />
    <Player paused={paused} onZone={onZone} />
  </Suspense>;
}
