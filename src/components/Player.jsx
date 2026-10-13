import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { readPose, saveSession } from '../lib/session.js';

const movement = new THREE.Vector3();
const forward = new THREE.Vector3();
const sideways = new THREE.Vector3();

export default function Player({ paused }) {
  const { camera, gl } = useThree();
  const keys = useRef({});
  const savedPose = useRef(readPose());
  const initialized = useRef(false);
  const yaw = useRef(savedPose.current?.yaw ?? 0);
  const pitch = useRef(savedPose.current?.pitch ?? -.08);
  const travel = useRef(null);
  const wheelMotion = useRef(new THREE.Vector3());
  const touchMove = useRef({ x: 0, y: 0 });
  const touchLook = useRef(null);
  const lastSave = useRef(0);

  function savePose() {
    saveSession({
      pose: {
        position: [camera.position.x, 2.2, camera.position.z],
        yaw: yaw.current,
        pitch: pitch.current
      }
    });
  }

  useEffect(() => {
    camera.rotation.order = 'YXZ';
    if (!initialized.current) {
      if (savedPose.current) camera.position.set(...savedPose.current.position);
      camera.rotation.set(pitch.current, yaw.current, 0);
      initialized.current = true;
    }

    const down = event => {
      if (event.target?.closest?.('input,select,textarea,[contenteditable="true"]')) return;
      keys.current[event.code] = true;
    };
    const up = event => { keys.current[event.code] = false; };

    // Browsers expose two-finger touchpad scrolling through the wheel event.
    // One-finger pointer movement and ordinary single clicks are NEVER consumed.
    // Vertical swipe walks forward/back; horizontal swipe moves sideways.
    const wheel = event => {
      if (paused || event.ctrlKey) return; // ctrl+wheel may be the browser's pinch-to-zoom gesture
      event.preventDefault();
      const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      const vertical = THREE.MathUtils.clamp(event.deltaY * scale, -140, 140);
      const horizontal = THREE.MathUtils.clamp(event.deltaX * scale, -140, 140);
      const walk = -vertical * .028;
      const strafe = horizontal * .028;
      const a = yaw.current;
      wheelMotion.current.x += -Math.sin(a) * walk + Math.cos(a) * strafe;
      wheelMotion.current.z += -Math.cos(a) * walk - Math.sin(a) * strafe;
    };

    // Touchscreens are distinct from laptop touchpads; preserve their existing look gesture.
    const touchStart = event => {
      if (event.pointerType === 'touch' && event.clientX > window.innerWidth * .42)
        touchLook.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
    };
    const touchLookMove = event => {
      if (paused || !touchLook.current || touchLook.current.id !== event.pointerId) return;
      yaw.current -= (event.clientX - touchLook.current.x) * .006;
      pitch.current = THREE.MathUtils.clamp(
        pitch.current - (event.clientY - touchLook.current.y) * .005, -.72, .55
      );
      touchLook.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
    };
    const touchEnd = event => {
      if (touchLook.current?.id === event.pointerId) touchLook.current = null;
    };

    const onTravel = event => {
      const { position, home, yaw: nextYaw = 0 } = event.detail;
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
      wheelMotion.current.set(0, 0, 0);
      touchMove.current = { x: 0, y: 0 };
    };
    const onTouchMove = event => { touchMove.current = event.detail; };
    const onBlur = () => { keys.current = {}; };
    const onPageHide = () => savePose();

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', onBlur);
    gl.domElement.addEventListener('wheel', wheel, { passive: false });
    gl.domElement.addEventListener('pointerdown', touchStart);
    gl.domElement.addEventListener('pointermove', touchLookMove);
    gl.domElement.addEventListener('pointerup', touchEnd);
    gl.domElement.addEventListener('pointercancel', touchEnd);
    window.addEventListener('portfolio:travel', onTravel);
    window.addEventListener('portfolio:move', onTouchMove);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', onBlur);
      gl.domElement.removeEventListener('wheel', wheel);
      gl.domElement.removeEventListener('pointerdown', touchStart);
      gl.domElement.removeEventListener('pointermove', touchLookMove);
      gl.domElement.removeEventListener('pointerup', touchEnd);
      gl.domElement.removeEventListener('pointercancel', touchEnd);
      window.removeEventListener('portfolio:travel', onTravel);
      window.removeEventListener('portfolio:move', onTouchMove);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [camera, gl, paused]);

  useFrame((state, delta) => {
    if (state.clock.elapsedTime - lastSave.current > .7) {
      savePose();
      lastSave.current = state.clock.elapsedTime;
    }
    if (paused) {
      keys.current = {};
      wheelMotion.current.set(0,0,0);
      return;
    }
    if (travel.current) {
      camera.position.lerp(travel.current, Math.min(1, delta * 4));
      if (camera.position.distanceTo(travel.current) < .12) travel.current = null;
    }

    const k = keys.current;
    const dx = Number(Boolean(k.KeyD || k.ArrowRight)) - Number(Boolean(k.KeyA || k.ArrowLeft)) + touchMove.current.x;
    const dz = Number(Boolean(k.KeyW || k.ArrowUp)) - Number(Boolean(k.KeyS || k.ArrowDown)) - touchMove.current.y;
    const length = Math.hypot(dx, dz);
    if (length > 0) {
      forward.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
      sideways.set(Math.cos(yaw.current), 0, -Math.sin(yaw.current));
      movement.set(0,0,0)
        .addScaledVector(forward, dz / Math.max(1, length))
        .addScaledVector(sideways, dx / Math.max(1, length));
      camera.position.addScaledVector(movement, delta * (k.ShiftLeft ? 9 : 5.2));
    }

    // Apply accumulated trackpad motion smoothly, without pointer lock or double taps.
    const wheelFraction = Math.min(1, delta * 16);
    camera.position.addScaledVector(wheelMotion.current, wheelFraction);
    wheelMotion.current.multiplyScalar(1 - wheelFraction);
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -34, 34);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -34, 34);
    camera.position.y = 2.2;
    camera.rotation.set(pitch.current, yaw.current, 0);
  });
  return null;
}
