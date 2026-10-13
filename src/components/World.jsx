import React, { Suspense } from 'react';
import { Environment, Grid, Stars, Sparkles } from '@react-three/drei';
import { portfolio, worldZones } from '../content.js';
import Player from './Player.jsx';
import Zone from './Zone.jsx';

function GroundFloor() {
  return (
    <mesh receiveShadow position={[0, -0.4, 0]} rotation-x={-Math.PI / 2}>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial color="#05070a" roughness={0.2} metalness={0.8} />
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
        <mesh position={[x/2, 0.012, z/2]} rotation={[-Math.PI/2, 0, -angle]}>
          <planeGeometry args={[3.5, length]} />
          <meshStandardMaterial color="#0b1012" roughness={0.8} metalness={0.3} />
        </mesh>
        <mesh position={[x/2, 0.02, z/2]} rotation={[-Math.PI/2, 0, -angle]}>
          <planeGeometry args={[0.2, length]} />
          <meshStandardMaterial color="#000" emissive={zone.color} emissiveIntensity={1.5} />
        </mesh>
      </group>
    );
  })}</group>;
}

function CentralPlaza() {
  return <group>
    {/* Base Platform */}
    <mesh receiveShadow position={[0, -0.15, 0]}>
      <cylinderGeometry args={[8, 9, 0.5, 32]} />
      <meshStandardMaterial color="#111820" metalness={0.7} roughness={0.4} />
    </mesh>
    <mesh receiveShadow position={[0, 0.12, 0]}>
      <cylinderGeometry args={[6, 7.5, 0.1, 32]} />
      <meshStandardMaterial color="#1a2530" metalness={0.8} roughness={0.3} />
    </mesh>
    {/* Glowing Rings */}
    <mesh position={[0, 0.18, 0]} rotation-x={-Math.PI/2}>
      <ringGeometry args={[5.2, 5.3, 64]} />
      <meshStandardMaterial color="#000" emissive="#66fcf1" emissiveIntensity={2} />
    </mesh>
    <mesh position={[0, 0.18, 0]} rotation-x={-Math.PI/2}>
      <ringGeometry args={[2.2, 2.3, 32]} />
      <meshStandardMaterial color="#000" emissive="#45a29e" emissiveIntensity={1} />
    </mesh>

    {/* Central Core Hologram */}
    <group position={[0, 2.5, 0]}>
      <mesh>
        <octahedronGeometry args={[1.2]} />
        <meshStandardMaterial color="#0b0c10" emissive="#66fcf1" emissiveIntensity={0.8} wireframe />
      </mesh>
      <mesh>
        <octahedronGeometry args={[0.5]} />
        <meshStandardMaterial color="#0b0c10" emissive="#fff" emissiveIntensity={2} />
      </mesh>
      {[0, 1, 2].map(i => (
        <mesh key={i} rotation={[i*1.2, i*0.8, i]}>
          <torusGeometry args={[2 + i*0.4, 0.02, 16, 100]} />
          <meshStandardMaterial color="#000" emissive={i === 1 ? '#45a29e' : '#66fcf1'} emissiveIntensity={1.5} />
        </mesh>
      ))}
      <Sparkles count={50} scale={4} size={2} speed={0.4} color="#66fcf1" />
    </group>
  </group>;
}

export default function World({ paused, quality, reduceMotion, onProject, onZone }) {
  return <Suspense fallback={null}>
    <color attach="background" args={['#05070a']} />
    <fog attach="fog" args={['#05070a', 15, 60]} />

    {/* Enhanced Lighting for Sci-Fi vibe */}
    <ambientLight intensity={0.2} />
    <hemisphereLight args={['#45a29e', '#0b0c10', 0.5]} />
    <directionalLight position={[20, 30, 15]} intensity={1.5} color="#c5c6c7" castShadow={quality==='high'} shadow-mapSize={[2048, 2048]} />
    <pointLight position={[0, 6, 0]} intensity={20} distance={30} color="#66fcf1" />

    <GroundFloor />
    <Grid position={[0, -0.39, 0]} args={[120, 120]} cellSize={1.5} cellThickness={0.5} cellColor="#111820" sectionSize={7.5} sectionThickness={1} sectionColor="#1a2530" fadeDistance={60} fadeStrength={1} infiniteGrid />

    <Paths />
    <CentralPlaza />

    {worldZones.map(zone => (
      <Zone key={zone.id} zone={zone} projects={portfolio.projects.filter(project => zone.projectIds.includes(project.id))} onProject={onProject} onActive={onZone} />
    ))}

    {quality === 'high' && !reduceMotion && (
      <>
        <Stars radius={80} depth={40} count={1500} factor={3} saturation={1} fade speed={0.5} />
        <Sparkles count={200} scale={80} size={1.5} speed={0.1} color="#45a29e" position={[0, 5, 0]} />
      </>
    )}

    <Environment preset="city" environmentIntensity={0.15} />
    <Player paused={paused} onZone={onZone} />
  </Suspense>;
}
