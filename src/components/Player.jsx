import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { readPose, saveSession } from '../lib/session.js';

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const forward = new THREE.Vector3();
const right = new THREE.Vector3();

export default function Player({ paused, onZone }) {
  const { camera, gl } = useThree();
  const keys = useRef({});
  const startingPose = useRef(readPose());
  const initialized = useRef(false);
  const lastSavedAt = useRef(0);
  const yaw = useRef(startingPose.current?.yaw ?? 0);
  const pitch = useRef(startingPose.current?.pitch ?? -.08);
  const travel = useRef(null);
  const touch = useRef({ x: 0, y: 0 });
  const touchLook = useRef(null);
  const dragging = useRef(false);

  const persistPose = () => {
    saveSession({
      pose: {
        position: [camera.position.x, 2.2, camera.position.z],
        yaw: yaw.current,
        pitch: pitch.current
      }
    });
  };

  useEffect(() => {
    camera.rotation.order = 'YXZ';
    if (!initialized.current) {
      if (startingPose.current) {
        camera.position.set(...startingPose.current.position);
        camera.rotation.set(pitch.current, yaw.current, 0);
      }
      initialized.current = true;
    }
    const down = event => { keys.current[event.code] = true; };
    const up = event => { keys.current[event.code] = false; };
    const look = event => {
      if (paused || (document.pointerLockElement !== gl.domElement && !dragging.current)) return;
      yaw.current -= event.movementX * .0024;
      pitch.current = THREE.MathUtils.clamp(pitch.current - event.movementY * .002, -.72, .55);
    };
    const startDrag = event => {
      if (!paused && event.pointerType === 'mouse' && event.button === 0) dragging.current = true;
    };
    const endDrag = () => { dragging.current = false; };
    const touchStart = event => {
      if (event.pointerType === 'touch' && event.clientX > window.innerWidth * .42) touchLook.current = { x:event.clientX, y:event.clientY, id:event.pointerId };
    };
    const touchMove = event => {
      if (!touchLook.current || touchLook.current.id !== event.pointerId || paused) return;
      yaw.current -= (event.clientX - touchLook.current.x) * .006;
      pitch.current = THREE.MathUtils.clamp(pitch.current - (event.clientY - touchLook.current.y) * .005, -.72, .55);
      touchLook.current = { x:event.clientX, y:event.clientY, id:event.pointerId };
    };
    const touchEnd = event => { if (touchLook.current?.id === event.pointerId) touchLook.current = null; };
    const travelHandler = event => {
      const { position, home, yaw: nextYaw = 0 } = event.detail;
      // Every zone is seen from its front; visitors do not spawn behind exhibits.
      travel.current = home
        ? new THREE.Vector3(0, 2.2, 8)
        : new THREE.Vector3(
            position[0] + Math.sin(nextYaw) * 8,
            2.2,
            position[2] + Math.cos(nextYaw) * 8
          );
      yaw.current = nextYaw;
      pitch.current = -.08;
      keys.current = {};
      touch.current = { x: 0, y: 0 };
      dragging.current = false;
    };
    const touchHandler = event => { touch.current = event.detail; };
    const persistOnExit = () => {
      saveSession({ pose: {
        position: [camera.position.x, 2.2, camera.position.z],
        yaw: yaw.current, pitch: pitch.current
      } });
    };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    document.addEventListener('mousemove', look);
    gl.domElement.addEventListener('pointerdown', startDrag);
    document.addEventListener('pointerup', endDrag);
    window.addEventListener('blur', endDrag);
    gl.domElement.addEventListener('pointerdown', touchStart); gl.domElement.addEventListener('pointermove', touchMove); gl.domElement.addEventListener('pointerup', touchEnd);
    window.addEventListener('portfolio:travel', travelHandler);
    window.addEventListener('portfolio:move', touchHandler);
    window.addEventListener('pagehide', persistOnExit);
    return () => {
      window.removeEventListener('keydown', down); window.removeEventListener('keyup', up);
      document.removeEventListener('mousemove', look);
      gl.domElement.removeEventListener('pointerdown', startDrag);
      document.removeEventListener('pointerup', endDrag);
      window.removeEventListener('blur', endDrag);
      gl.domElement.removeEventListener('pointerdown', touchStart); gl.domElement.removeEventListener('pointermove', touchMove); gl.domElement.removeEventListener('pointerup', touchEnd);
      window.removeEventListener('portfolio:travel', travelHandler);
      window.removeEventListener('portfolio:move', touchHandler);
      window.removeEventListener('pagehide', persistOnExit);
    };
  }, [camera, gl, paused]);

  useFrame((state, delta) => {
    if (state.clock.elapsedTime - lastSavedAt.current > .5) {
      persistPose();
      lastSavedAt.current = state.clock.elapsedTime;
    }
    if (paused) {
      keys.current = {};
      return;
    }
    if (travel.current) {
      camera.position.lerp(travel.current, Math.min(1, delta * 3.2));
      if (camera.position.distanceTo(travel.current) < .15) travel.current = null;
    }
    const k = keys.current;
    const x = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0) + touch.current.x;
    const z = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0) - touch.current.y;
    direction.set(x, 0, z).normalize();
    camera.getWorldDirection(forward); forward.y = 0; forward.normalize();
    right.crossVectors(forward, camera.up).normalize();
    velocity.set(0, 0, 0).addScaledVector(forward, direction.z).addScaledVector(right, direction.x);
    camera.position.addScaledVector(velocity, delta * (k.ShiftLeft ? 9 : 5.2));
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -34, 34);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -34, 34);
    camera.position.y = 2.2;
    camera.rotation.set(pitch.current, yaw.current, 0);
  });
  return null;
}
