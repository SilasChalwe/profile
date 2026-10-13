import React, { useMemo, useRef, useState } from 'react';
import { Float, Text, Billboard, Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Terminal from './Terminal.jsx';

function ExhibitObject({ type, color }) {
  const group = useRef();
  useFrame((state, delta) => {
    if (group.current) group.current.rotation.y += delta * .15;
  });
  const material = <meshStandardMaterial color="#05245A" emissive={color} emissiveIntensity={.06} metalness={.3} roughness={.55} wireframe />;
  return <group ref={group} position={[0, 2.6, 0]}>
    {type === 'software' && <><mesh>{<icosahedronGeometry args={[1.45,1]} />}{material}</mesh><mesh rotation-x={Math.PI/2}>{<torusGeometry args={[2.2,.035,8,80]} />}{material}</mesh></>}
    {type === 'mobile' && <Float speed={1.4} floatIntensity={.25}><mesh rotation-z={-.13}>{<boxGeometry args={[1.7,3.2,.28]} />}{material}</mesh></Float>}
    {type === 'design' && <><mesh rotation-y={.5}>{<boxGeometry args={[2.8,1.75,.08]} />}{material}</mesh><mesh position={[-.5,.3,.3]}>{<boxGeometry args={[1.25,2.1,.08]} />}{material}</mesh></>}
    {type === 'ai' && <><mesh>{<sphereGeometry args={[1.35,16,12]} />}{material}</mesh>{[0,1,2].map(i=><mesh key={i} rotation={[i*.7,i*.9,i*.3]}>{<torusGeometry args={[2+i*.2,.02,6,70]} />}{material}</mesh>)}</>}
    {type === 'embedded' && <><mesh>{<boxGeometry args={[2.6,.15,1.7]} />}{material}</mesh>{[-.9,0,.9].map((x,i)=><mesh key={x} position={[x,.65,(i-1)*.28]}>{<cylinderGeometry args={[.23,.23,1.2,12]} />}{material}</mesh>)}</>}
    {!['software','mobile','design','ai','embedded','clients'].includes(type) &&
      <mesh><dodecahedronGeometry args={[1.35,0]}/>{material}</mesh>}
    {type === 'clients' && <><mesh rotation-z={Math.PI/4}>{<octahedronGeometry args={[1.5]} />}{material}</mesh><mesh rotation-x={Math.PI/2}>{<torusGeometry args={[2.2,.03,6,80]} />}{material}</mesh></>}
  </group>;
}

export default function Zone({ zone, projects, onProject, onActive, onPreview, onPreviewLeave }) {
  const { camera } = useThree();
  const [near, setNear] = useState(false);
  const [page, setPage] = useState(0);
  const maxPage = Math.max(0, Math.ceil(projects.length / 3) - 1);
  const visibleProjects = projects.slice(page * 3, page * 3 + 3);
  const position = useMemo(() => new THREE.Vector3(...zone.position), [zone.position]);
  useFrame(() => {
    const distance = camera.position.distanceTo(position);
    setNear(previous => distance < 10 ? true : distance > 11 ? false : previous);
    if (distance < 8) onActive(zone.id);
  });
  const inwardRotation = Math.atan2(-zone.position[0], -zone.position[2]);
  return <group position={zone.position} rotation={[0,inwardRotation,0]}>
    <mesh receiveShadow position={[0,-.18,0]}>
      <cylinderGeometry args={[7.3,8, .36, 8]} />
      <meshStandardMaterial color={near ? '#fff3e9' : '#ffffff'} roughness={.8} metalness={.07} />
    </mesh>
    <mesh position={[0,.02,0]} rotation-x={-Math.PI/2}>
      <ringGeometry args={[6.1,6.18,64]} />
      <meshBasicMaterial color={zone.color} transparent opacity={near ? .9 : .35} />
    </mesh>
    <ExhibitObject type={zone.id} color={zone.color} />
    <Billboard follow lockX lockZ position={[0,5.1,0]}><Text fontSize={.52} color="#05245A" anchorX="center" anchorY="middle">{zone.label.toUpperCase()}</Text></Billboard>
    <Billboard follow lockX lockZ position={[0,4.55,0]}><Text fontSize={.14} maxWidth={6.5} textAlign="center" color="#475569" anchorX="center">{zone.description}</Text></Billboard>
    {visibleProjects.map((project, index) => {
      const count = visibleProjects.length;
      const x = count === 1 ? 0 : (index - (count - 1) / 2) * 3.25;
      return <Terminal key={project.id} position={[x,1.35,5]} project={project} color={zone.color} onOpen={onProject} onPreview={onPreview} onPreviewLeave={onPreviewLeave} />;
    })}
    {maxPage > 0 && <Html center position={[0,.5,6]} distanceFactor={13}>
      <div className="zone-pagination" aria-label={`${zone.label} project pages`}>
        <button type="button" disabled={page===0} onClick={event=>{event.stopPropagation();setPage(p=>Math.max(0,p-1));}}>←</button>
        <span>{page+1} / {maxPage+1}</span>
        <button type="button" disabled={page===maxPage} onClick={event=>{event.stopPropagation();setPage(p=>Math.min(maxPage,p+1));}}>→</button>
      </div>
    </Html>}
    {!projects.length && <group position={[0,1.25,5]} rotation={[0,Math.PI,0]}>
      <mesh><boxGeometry args={[3.7,1.8,.2]} /><meshStandardMaterial color="#ffffff" roughness={.8} /></mesh>
      <Text position={[0,.25,.12]} fontSize={.2} color="#05245A">CURATED EXHIBIT</Text>
      <Text position={[0,-.2,.12]} fontSize={.11} color="#475569" maxWidth={3} textAlign="center">Approved project media and detailed evidence pending</Text>
    </group>}
  </group>;
}
