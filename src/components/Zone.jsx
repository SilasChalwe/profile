import React, { useMemo, useRef, useState } from 'react';
import { Float, Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Terminal from './Terminal.jsx';

const NAVY = '#05245A', ORANGE = '#FE6202';

function ExhibitObject({ type }) {
  const rotor = useRef();
  useFrame((_, delta) => { if (rotor.current) rotor.current.rotation.y += delta * .08; });
  return <group ref={rotor} position={[0,2.65,-1.75]}>
    {type === 'software' && <mesh castShadow><icosahedronGeometry args={[.95,1]} /><meshStandardMaterial color={NAVY} metalness={.52} roughness={.28} /></mesh>}
    {type === 'mobile' && <mesh castShadow rotation-z={-.1}><boxGeometry args={[1.12,1.95,.21]} /><meshStandardMaterial color={NAVY} metalness={.3} roughness={.25} /></mesh>}
    {type === 'design' && <group><mesh><boxGeometry args={[2.1,1.28,.1]} /><meshStandardMaterial color={NAVY} /></mesh><mesh position={[.2,.1,.09]}><planeGeometry args={[1.65,.9]} /><meshBasicMaterial color="#fff"/></mesh></group>}
    {type === 'ai' && <mesh><icosahedronGeometry args={[1.05,2]} /><meshStandardMaterial color={NAVY} wireframe /></mesh>}
    {type === 'embedded' && <mesh castShadow><boxGeometry args={[1.55,.25,1.2]} /><meshStandardMaterial color={NAVY} metalness={.4} /></mesh>}
    {type === 'clients' && <mesh castShadow rotation={[.25,0,.35]}><octahedronGeometry args={[1.05]} /><meshStandardMaterial color={NAVY} roughness={.3} /></mesh>}
    <mesh rotation-x={Math.PI/2}><torusGeometry args={[1.48,.038,9,85]} /><meshStandardMaterial color={ORANGE} emissive={ORANGE} emissiveIntensity={.28}/></mesh>
  </group>;
}

function Pavilion() {
  return <group>
    {[-5.7,5.7].map(x=>[-5.2,5.2].map(z=><group key={x+':'+z}>
      <mesh position={[x,2.2,z]} castShadow><boxGeometry args={[.18,4.4,.18]} /><meshStandardMaterial color={NAVY} metalness={.32}/></mesh>
      <mesh position={[x,4.4,z]}><sphereGeometry args={[.15,14,10]}/><meshStandardMaterial color={ORANGE} emissive={ORANGE} emissiveIntensity={.18}/></mesh>
    </group>))}
    <mesh position={[0,4.43,0]}><boxGeometry args={[11.7,.18,10.6]}/><meshStandardMaterial color="#ffffff" transparent opacity={.82} roughness={.3} metalness={.1}/></mesh>
    <mesh position={[0,4.55,0]}><boxGeometry args={[11.5,.035,10.3]}/><meshStandardMaterial color={ORANGE}/></mesh>
  </group>;
}

export default function Zone({ zone, projects, onProject, onActive }) {
  const {camera} = useThree();
  const [near,setNear]=useState(false);
  const position=useMemo(()=>new THREE.Vector3(...zone.position),[zone.position]);
  useFrame(()=>{
    const distance=camera.position.distanceTo(position);
    setNear(previous => distance<11 ? true : distance>12 ? false : previous);
    if(distance<8)onActive(zone.id);
  });
  const inwardRotation=Math.atan2(-zone.position[0],-zone.position[2]);
  const count=projects.length;
  return <group position={zone.position} rotation={[0,inwardRotation,0]}>
    <mesh position={[0,-.19,0]} receiveShadow castShadow>
      <cylinderGeometry args={[7.2,7.6,.35,48]}/>
      <meshStandardMaterial color={near?'#ffffff':'#f6f9fd'} roughness={.7} metalness={.05}/>
    </mesh>
    <mesh position={[0,.008,0]} rotation-x={-Math.PI/2}>
      <ringGeometry args={[6.56,6.62,96]}/><meshBasicMaterial color={ORANGE} transparent opacity={near?1:.75}/>
    </mesh>
    <mesh position={[0,.005,0]} rotation-x={-Math.PI/2}>
      <ringGeometry args={[5.9,5.96,96]}/><meshBasicMaterial color={NAVY} transparent opacity={.18}/>
    </mesh>
    <Pavilion/>
    <ExhibitObject type={zone.id}/>
    <group position={[0,4.72,0]}>
      <mesh><boxGeometry args={[7.7,.79,.24]}/><meshStandardMaterial color={NAVY} metalness={.2} roughness={.5}/></mesh>
      <Text position={[0,.05,.134]} fontSize={.4} maxWidth={7.35} color="#ffffff" anchorX="center" anchorY="middle">{zone.label.toUpperCase()}</Text>
    </group>
    <Text position={[0,3.83,.08]} fontSize={.145} maxWidth={6.4} textAlign="center" color={NAVY} anchorX="center">{zone.description}</Text>
    {projects.map((project,index)=>{
      const gap=count>2?3.4:4;
      const x=(index-(count-1)/2)*gap;
      return <Terminal key={project.id} position={[x,1.72,4.38]} project={project} color={ORANGE} onOpen={onProject}/>;
    })}
    {!count&&<group position={[0,1.75,4.6]}>
      <mesh><boxGeometry args={[4,2.45,.18]}/><meshStandardMaterial color="#ffffff" roughness={.46}/></mesh>
      <Text position={[0,.3,.11]} fontSize={.29} color={NAVY}>SELECTED WORK</Text>
      <Text position={[0,-.27,.11]} fontSize={.15} maxWidth={3.3} textAlign="center" color="#475569">Project gallery awaiting publication-approved material</Text>
    </group>}
    <pointLight position={[0,3.8,2.3]} intensity={3} distance={15} color="#ffffff"/>
  </group>;
}