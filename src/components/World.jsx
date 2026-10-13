import React, { Suspense } from 'react';
import { Grid, Text } from '@react-three/drei';
import { portfolio, worldZones } from '../content.js';
import Player from './Player.jsx';
import Zone from './Zone.jsx';

const NAVY = '#05245A', ORANGE = '#FE6202';

function Paths() {
  return <group>{worldZones.map(zone => {
    const [x,,z] = zone.position;
    const length = Math.hypot(x,z);
    const angle = Math.atan2(x,z);
    return <group key={zone.id} position={[x / 2, .014, z / 2]} rotation={[-Math.PI/2,0,-angle]}>
      <mesh receiveShadow><planeGeometry args={[3,length]} /><meshStandardMaterial color="#d4dfed" roughness={.9} /></mesh>
      {[-1.42,1.42].map(offset => <mesh key={offset} position={[offset,0,.007]}>
        <planeGeometry args={[.045,length]} /><meshBasicMaterial color={offset<0?ORANGE:NAVY} transparent opacity={.65} />
      </mesh>)}
      {Array.from({length:Math.max(1,Math.floor(length/4))},(_,index)=><mesh key={index} position={[0,-length/2+index*4+2,.01]}>
        <planeGeometry args={[.12,.55]} /><meshBasicMaterial color="#ffffff" transparent opacity={.8} />
      </mesh>)}
    </group>;
  })}</group>;
}

function CentralPlaza() {
  return <group>
    <mesh position={[0,-.09,0]} receiveShadow><cylinderGeometry args={[7,7.4,.25,64]} /><meshStandardMaterial color="#fff" roughness={.75} metalness={.08} /></mesh>
    <mesh position={[0,.051,0]} rotation-x={-Math.PI/2}><ringGeometry args={[5.3,5.44,100]} /><meshBasicMaterial color={ORANGE} /></mesh>
    <mesh position={[0,.052,0]} rotation-x={-Math.PI/2}><ringGeometry args={[4.7,4.74,100]} /><meshBasicMaterial color={NAVY} transparent opacity={.35} /></mesh>
    <mesh position={[0,1.8,0]} castShadow><icosahedronGeometry args={[1.15,1]} /><meshStandardMaterial color={NAVY} metalness={.45} roughness={.22} /></mesh>
    {[0,1,2].map(i => <mesh key={i} position={[0,1.8,0]} rotation={[i*.75,i*.6,.32+i*.7]}>
      <torusGeometry args={[1.85+i*.15,.047,10,96]} /><meshStandardMaterial color={i===1?ORANGE:NAVY} emissive={i===1?ORANGE:NAVY} emissiveIntensity={.12} metalness={.35} />
    </mesh>)}
    <Text position={[0,.12,3.7]} rotation={[-Math.PI/2,0,0]} fontSize={.38} color={NAVY} anchorX="center">SILAS CHALWE · EXPLORE THE WORK</Text>
    {[0,Math.PI/2,Math.PI,Math.PI*1.5].map(angle => <group key={angle} rotation-y={angle}>
      <mesh position={[0,1.7,6.4]} castShadow><boxGeometry args={[.18,3.4,.18]} /><meshStandardMaterial color={NAVY} /></mesh>
      <mesh position={[0,3.5,6.4]}><sphereGeometry args={[.18,16,12]} /><meshStandardMaterial color={ORANGE} emissive={ORANGE} emissiveIntensity={.28}/></mesh>
    </group>)}
  </group>;
}

export default function World({ paused, quality, reduceMotion, onProject, onZone }) {
  return <Suspense fallback={null}>
    <color attach="background" args={['#edf4fc']} />
    <fog attach="fog" args={['#edf4fc',55,120]} />
    <ambientLight intensity={1.65} />
    <hemisphereLight args={['#ffffff','#c1cedb',1.45]} />
    <directionalLight position={[24,32,14]} intensity={2.3} color="#fffaf3" castShadow={quality==='high'} shadow-mapSize={[2048,2048]} />
    <directionalLight position={[-15,9,-15]} intensity={.8} color="#b8d1f1" />
    <mesh rotation-x={-Math.PI/2} position={[0,-.39,0]} receiveShadow>
      <planeGeometry args={[220,220]} /><meshStandardMaterial color="#e8f0f9" roughness={.98} />
    </mesh>
    <Grid position={[0,-.365,0]} args={[110,110]} cellSize={2} cellThickness={.35} cellColor="#d2dfef" sectionSize={10} sectionThickness={.7} sectionColor="#b5c9e0" fadeDistance={95} fadeStrength={1.2} infiniteGrid />
    <Paths /><CentralPlaza />
    {worldZones.map(zone => <Zone key={zone.id} zone={zone} projects={portfolio.projects.filter(project => zone.projectIds.includes(project.id))} onProject={onProject} onActive={onZone} />)}
    <Player paused={paused} onZone={onZone} />
  </Suspense>;
}