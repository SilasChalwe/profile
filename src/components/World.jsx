import React, { Suspense } from 'react';
import { Grid } from '@react-three/drei';
import { portfolio, worldZones } from '../content.js';
import Player from './Player.jsx';
import Zone from './Zone.jsx';

function Paths() {
  return <group>{worldZones.map(zone => {
    const [x,,z] = zone.position;
    const length = Math.hypot(x,z);
    const angle = Math.atan2(x,z);
    return <mesh key={zone.id} position={[x/2,.012,z/2]} rotation={[-Math.PI/2,0,-angle]}>
      <planeGeometry args={[2.2,length]} /><meshStandardMaterial color="#e2ebf7" roughness={.83} metalness={.04} />
    </mesh>;
  })}</group>;
}

function CentralPlaza() {
  return <group>
    <mesh receiveShadow position={[0,-.15,0]}><cylinderGeometry args={[7,8,.3,12]} /><meshStandardMaterial color="#ffffff" metalness={.08} roughness={.73} /></mesh>
    <mesh position={[0,.01,0]} rotation-x={-Math.PI/2}><ringGeometry args={[5.2,5.27,72]} /><meshBasicMaterial color="#FE6202" transparent opacity={.55} /></mesh>
    <mesh position={[0,2,0]}><octahedronGeometry args={[1.1]} /><meshStandardMaterial color="#05245A" emissive="#FE6202" emissiveIntensity={.12} wireframe /></mesh>
    {[0,1,2].map(i => <mesh key={i} position={[0,2,0]} rotation={[i*.7,i*.55,i]}><torusGeometry args={[1.8+i*.32,.025,8,80]} /><meshBasicMaterial color={i===1?'#FE6202':'#FE6202'} transparent opacity={.55} /></mesh>)}
  </group>;
}

export default function World({ paused, quality, reduceMotion, onProject, onZone }) {
  return <Suspense fallback={null}>
    <color attach="background" args={['#f8fbff']} /><fog attach="fog" args={['#f8fbff',48,115]} />
    <ambientLight intensity={1.2} /><hemisphereLight args={['#ffffff','#d5e0ef',1.1]} />
    <directionalLight position={[14,22,9]} intensity={1.8} color="#ffffff" castShadow={quality==='high'} shadow-mapSize={[1024,1024]} />
    <pointLight position={[0,6,0]} intensity={3} distance={22} color="#ffe3d1" />
    <mesh rotation-x={-Math.PI/2} position={[0,-.345,0]} receiveShadow><planeGeometry args={[180,180]} /><meshStandardMaterial color="#ffffff" roughness={.95} /></mesh>
    <Grid position={[0,-.335,0]} args={[82,82]} cellSize={1} cellThickness={.23} cellColor="#dde6f1" sectionSize={8} sectionThickness={.58} sectionColor="#c0d0e2" fadeDistance={77} fadeStrength={1.3} infiniteGrid />
    <Paths /><CentralPlaza />
    {worldZones.map(zone => <Zone key={zone.id} zone={zone} projects={portfolio.projects.filter(project => zone.projectIds.includes(project.id))} onProject={onProject} onActive={onZone} />)}
    <Player paused={paused} onZone={onZone} />
  </Suspense>;
}
