import React, { useRef, useState } from 'react';
import { Html, Text, useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { portfolioAudio } from '../lib/audio.js';

const NAVY = '#05245A', ORANGE = '#FE6202';
const temp = new THREE.Vector3();

export default function Terminal({ position, rotation = [0,0,0], project, color = ORANGE, onOpen }) {
  const ref=useRef();
  const {camera}=useThree();
  const texture=useTexture(project.preview || '/assets/previews/fix.svg');
  const [hovered,setHovered]=useState(false);
  const [near,setNear]=useState(false);
  useFrame((state,delta)=>{
    if(!ref.current)return;
    const distance=camera.position.distanceTo(ref.current.getWorldPosition(temp));
    setNear(previous=> distance<6.2?true:distance>6.9?false:previous);
    ref.current.position.y=position[1]+Math.sin(state.clock.elapsedTime*.65+position[0])*.055;
    ref.current.rotation.y=THREE.MathUtils.damp(ref.current.rotation.y,rotation[1]+(hovered?.045:0),3,delta);
  });
  const active=hovered||near;
  return <group ref={ref} position={position} rotation={rotation}>
    <mesh castShadow onPointerOver={event=>{
      event.stopPropagation();setHovered(true);
      document.body.classList.add('is-targeting');portfolioAudio.play('hover');
    }} onPointerOut={()=>{setHovered(false);document.body.classList.remove('is-targeting')}} onClick={event=>{
      event.stopPropagation();portfolioAudio.play('open');onOpen(project.id);
    }}>
      <boxGeometry args={[3.25,2.6,.2]}/>
      <meshStandardMaterial color={active?ORANGE:NAVY} metalness={.16} roughness={.42} emissive={active?ORANGE:NAVY} emissiveIntensity={active?.12:0}/>
    </mesh>
    <mesh position={[0,.27,.108]}>
      <planeGeometry args={[3.0,1.83]}/>
      <meshBasicMaterial map={texture} toneMapped={false}/>
    </mesh>
    <mesh position={[0,-.98,.11]}>
      <planeGeometry args={[3.02,.38]}/><meshBasicMaterial color="#ffffff"/>
    </mesh>
    <Text position={[0,-.96,.125]} fontSize={.18} maxWidth={2.8} color={NAVY} anchorX="center" textAlign="center">{project.title.toUpperCase()}</Text>
    <Text position={[0,-1.43,0]} fontSize={.13} color={NAVY} anchorX="center">{active?'CLICK TO EXPLORE':project.status.toUpperCase().slice(0,34)}</Text>
    {active&&<Html center position={[0,1.75,0]} distanceFactor={11}>
      <div className="world-prompt">{near?'Explore project · click image':'View project story'}</div>
    </Html>}
  </group>;
}