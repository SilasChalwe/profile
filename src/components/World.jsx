import React, { Suspense } from 'react';
import { Environment, Grid, Stars } from '@react-three/drei';
import { portfolio, worldZones } from '../content.js';
import Player from './Player.jsx';
import Zone from './Zone.jsx';

function Paths() {
  return <group>{worldZones.map(zone => {
    const [x,,z] = zone.position;
    const length = Math.hypot(x,z);
    const angle = Math.atan2(x,z);
    return <mesh key={zone.id} position={[x/2,.012,z/2]} rotation={[-Math.PI/2,0,-angle]}>
      <planeGeometry args={[2.2,length]} /><meshStandardMaterial color="#0d1d37" emissive={zone.color} emissiveIntensity={.045} roughness={.9} />
    </mesh>;
  })}</group>;
}

function CentralPlaza() {
  return <group>
    <mesh receiveShadow position={[0,-.15,0]}><cylinderGeometry args={[7,8,.3,12]} /><meshStandardMaterial color="#0b1931" metalness={.55} roughness={.58} /></mesh>
    <mesh position={[0,.01,0]} rotation-x={-Math.PI/2}><ringGeometry args={[5.2,5.27,72]} /><meshBasicMaterial color="#FE6202" transparent opacity={.55} /></mesh>
    <mesh position={[0,2,0]}><octahedronGeometry args={[1.1]} /><meshStandardMaterial color="#0b1931" emissive="#FE6202" emissiveIntensity={.35} wireframe /></mesh>
    {[0,1,2].map(i => <mesh key={i} position={[0,2,0]} rotation={[i*.7,i*.55,i]}><torusGeometry args={[1.8+i*.32,.025,8,80]} /><meshBasicMaterial color={i===1?'#FE6202':'#FE6202'} transparent opacity={.55} /></mesh>)}
  </group>;
}

export default function World({ paused, quality, reduceMotion, onProject, onZone }) {
  return <Suspense fallback={null}>
    <color attach="background" args={['#070a0c']} /><fog attach="fog" args={['#070a0c',24,78]} />
    <ambientLight intensity={.48} /><hemisphereLight args={['#c8d8ff','#0b1527',.75]} />
    <directionalLight position={[14,22,9]} intensity={1.5} color="#f0f5ff" castShadow={quality==='high'} shadow-mapSize={[1024,1024]} />
    <pointLight position={[0,6,0]} intensity={28} distance={24} color="#FE6202" />
    <Grid position={[0,-.34,0]} args={[82,82]} cellSize={1} cellThickness={.25} cellColor="#28364b" sectionSize={8} sectionThickness={.7} sectionColor="#43536d" fadeDistance={58} fadeStrength={1.4} infiniteGrid />
    <Paths /><CentralPlaza />
    {worldZones.map(zone => <Zone key={zone.id} zone={zone} projects={portfolio.projects.filter(project => zone.projectIds.includes(project.id))} onProject={onProject} onActive={onZone} />)}
    {quality === 'high' && !reduceMotion && <Stars radius={70} depth={30} count={700} factor={2} saturation={0} fade speed={.15} />}
    <Environment preset="night" environmentIntensity={.25} />
    <Player paused={paused} onZone={onZone} />
  </Suspense>;
}
