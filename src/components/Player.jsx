import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { readPose, readSession, saveSession } from '../lib/session.js';

const EYE_HEIGHT = 2.2;
const MAX_PITCH = Math.PI / 2 - .08;
const BIRD_MIN_HEIGHT = 13;
const BIRD_MAX_HEIGHT = 90;
const LIMIT = 34;
const vForward = new THREE.Vector3();
const vSide = new THREE.Vector3();
const vMove = new THREE.Vector3();

const normalizeAngle = angle => Math.atan2(Math.sin(angle), Math.cos(angle));
const clampWorld = value => THREE.MathUtils.clamp(value, -LIMIT, LIMIT);

function savedBirdView() {
  const data = readSession()?.birdView;
  if (!data || ![data.x, data.z, data.height, data.yaw].every(Number.isFinite) ||
    Math.abs(data.x) > LIMIT || Math.abs(data.z) > LIMIT ||
    data.height < BIRD_MIN_HEIGHT || data.height > BIRD_MAX_HEIGHT) {
    return { x: 0, z: 0, height: 45, yaw: 0, tilt: 0 };
  }
  return { x: data.x, z: data.z, height: data.height, yaw: normalizeAngle(data.yaw), tilt: Number.isFinite(data.tilt) ? THREE.MathUtils.clamp(data.tilt,0,.75) : 0 };
}

// Movement and looking are separate modes. Laptop touchpad two-finger scroll
// sends wheel events; single-finger pointer/clicks never steer the camera.
export default function Player({ paused, viewMode = 'move' }) {
  const { camera, gl } = useThree();
  const keys = useRef({});
  const initialPose = useRef(readPose());
  const initialized = useRef(false);
  const groundPosition = useRef(new THREE.Vector3(...(initialPose.current?.position || [0, EYE_HEIGHT, 8])));
  const yaw = useRef(initialPose.current?.yaw ?? 0);
  const pitch = useRef(initialPose.current?.pitch ?? -.08);
  const aerial = useRef(savedBirdView());
  const currentMode = useRef(null);
  const travel = useRef(null);
  const scrollMovement = useRef(new THREE.Vector3());
  const touchMove = useRef({ x: 0, y: 0 });
  const touchLook = useRef(null);
  const mouseLook = useRef(null);
  const lastSaved = useRef(0);

  const persist = () => saveSession({
    pose: {
      position: [groundPosition.current.x, EYE_HEIGHT, groundPosition.current.z],
      yaw: normalizeAngle(yaw.current), pitch: pitch.current
    },
    birdView: { ...aerial.current }
  });

  useEffect(() => {
    camera.rotation.order = 'YXZ';
    if (!initialized.current) {
      camera.position.copy(groundPosition.current);
      camera.rotation.set(pitch.current, yaw.current, 0);
      initialized.current = true;
    }

    const onKeyDown = event => {
      if (event.target?.closest?.('input,select,textarea,button,[contenteditable="true"]')) return;
      keys.current[event.code] = true;
    };
    const onKeyUp = event => { keys.current[event.code] = false; };
    const onBlur = () => { keys.current = {}; mouseLook.current = null; touchLook.current = null; };

    const onWheel = event => {
      if (paused) return;
      // The gesture belongs only to the 3D canvas, not the project gallery.
      // Trackpad pinch-to-zoom is normally delivered with ctrlKey.
      if (event.ctrlKey && viewMode !== 'bird') return;
      event.preventDefault();
      const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      const dx = THREE.MathUtils.clamp(event.deltaX * scale, -160, 160);
      const dy = THREE.MathUtils.clamp(event.deltaY * scale, -160, 160);

      if (viewMode === 'look') {
        // Full 360-degree yaw; vertical pitch from near straight up to down.
        yaw.current = normalizeAngle(yaw.current - dx * .008);
        pitch.current = THREE.MathUtils.clamp(pitch.current - dy * .006, -MAX_PITCH, MAX_PITCH);
      } else if (viewMode === 'bird') {
        if (event.ctrlKey) {
          aerial.current.height = THREE.MathUtils.clamp(
            aerial.current.height + dy * .12, BIRD_MIN_HEIGHT, BIRD_MAX_HEIGHT
          );
        } else {
          const a = aerial.current.yaw;
          aerial.current.x = clampWorld(aerial.current.x + (Math.cos(a) * dx - Math.sin(a) * dy) * .045);
          aerial.current.z = clampWorld(aerial.current.z + (-Math.sin(a) * dx - Math.cos(a) * dy) * .045);
        }
      } else {
        const walk = -dy * .028, strafe = dx * .028, a = yaw.current;
        scrollMovement.current.x += -Math.sin(a) * walk + Math.cos(a) * strafe;
        scrollMovement.current.z += -Math.cos(a) * walk - Math.sin(a) * strafe;
      }
    };

    // Right mouse button + drag turns the camera in Look mode only. Normal
    // left clicks (and one-finger touchpad taps) still select project terminals.
    const onMouseDown = event => {
      if (!paused && viewMode === 'look' && event.pointerType === 'mouse' && event.button === 2) {
        event.preventDefault();
        mouseLook.current = { x: event.clientX, y: event.clientY };
      }
    };
    const onMouseMove = event => {
      if (!mouseLook.current || paused || viewMode !== 'look') return;
      yaw.current = normalizeAngle(yaw.current - (event.clientX - mouseLook.current.x) * .006);
      pitch.current = THREE.MathUtils.clamp(
        pitch.current - (event.clientY - mouseLook.current.y) * .005, -MAX_PITCH, MAX_PITCH
      );
      mouseLook.current = { x: event.clientX, y: event.clientY };
    };
    const stopMouse = () => { mouseLook.current = null; };
    const noContextMenu = event => { if (viewMode === 'look') event.preventDefault(); };

    // Touchscreen input stays independent of laptop touchpad gestures.
    const onTouchStart = event => {
      if (event.pointerType !== 'touch' || paused) return;
      if (viewMode === 'bird' || event.clientX > window.innerWidth * .42) {
        touchLook.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
      }
    };
    const onTouchPointerMove = event => {
      if (paused || !touchLook.current || event.pointerId !== touchLook.current.id) return;
      const dx = event.clientX - touchLook.current.x;
      const dy = event.clientY - touchLook.current.y;
      if (viewMode === 'bird') {
        const a = aerial.current.yaw;
        aerial.current.x = clampWorld(aerial.current.x + (-Math.cos(a) * dx + Math.sin(a) * dy) * .09);
        aerial.current.z = clampWorld(aerial.current.z + (Math.sin(a) * dx + Math.cos(a) * dy) * .09);
      } else {
        yaw.current = normalizeAngle(yaw.current - dx * .006);
        pitch.current = THREE.MathUtils.clamp(pitch.current - dy * .005, -MAX_PITCH, MAX_PITCH);
      }
      touchLook.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
    };
    const onTouchEnd = event => {
      if (touchLook.current?.id === event.pointerId) touchLook.current = null;
    };

    const onTravel = event => {
      const { position, home, yaw: nextYaw = 0 } = event.detail;
      const x = home ? 0 : position[0], z = home ? 0 : position[2];
      groundPosition.current.set(
        clampWorld(x + Math.sin(nextYaw) * (home ? 0 : 8)),
        EYE_HEIGHT,
        clampWorld(z + Math.cos(nextYaw) * (home ? 8 : 8))
      );
      yaw.current = normalizeAngle(nextYaw);
      pitch.current = -.08;
      aerial.current.x = clampWorld(x);
      aerial.current.z = clampWorld(z);
      if (viewMode !== 'bird') travel.current = groundPosition.current.clone();
      keys.current = {};
      scrollMovement.current.set(0, 0, 0);
      touchMove.current = { x: 0, y: 0 };
    };
    const onTouchMove = event => { touchMove.current = event.detail; };
    const onCameraTurn = event => {
      const { yawDelta = 0, pitchDelta = 0, zoomDelta = 0, tiltDelta = 0, level = false, topDown = false } = event.detail || {};
      if (viewMode === 'bird') {
        aerial.current.yaw = normalizeAngle(aerial.current.yaw + yawDelta);
        aerial.current.tilt = topDown ? 0 : THREE.MathUtils.clamp(aerial.current.tilt + tiltDelta, 0, .75);
        aerial.current.height = THREE.MathUtils.clamp(
          aerial.current.height + zoomDelta, BIRD_MIN_HEIGHT, BIRD_MAX_HEIGHT
        );
      } else {
        yaw.current = normalizeAngle(yaw.current + yawDelta);
        pitch.current = level ? 0 : THREE.MathUtils.clamp(pitch.current + pitchDelta, -MAX_PITCH, MAX_PITCH);
      }
    };

    gl.domElement.addEventListener('wheel', onWheel, { passive: false });
    gl.domElement.addEventListener('pointerdown', onMouseDown);
    gl.domElement.addEventListener('pointerdown', onTouchStart);
    window.addEventListener('pointermove', onMouseMove);
    gl.domElement.addEventListener('pointermove', onTouchPointerMove);
    window.addEventListener('pointerup', stopMouse);
    gl.domElement.addEventListener('pointerup', onTouchEnd);
    gl.domElement.addEventListener('pointercancel', onTouchEnd);
    gl.domElement.addEventListener('contextmenu', noContextMenu);
    window.addEventListener('portfolio:travel', onTravel);
    window.addEventListener('portfolio:camera-turn', onCameraTurn);
    window.addEventListener('portfolio:move', onTouchMove);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    window.addEventListener('pagehide', persist);
    return () => {
      gl.domElement.removeEventListener('wheel', onWheel);
      gl.domElement.removeEventListener('pointerdown', onMouseDown);
      gl.domElement.removeEventListener('pointerdown', onTouchStart);
      window.removeEventListener('pointermove', onMouseMove);
      gl.domElement.removeEventListener('pointermove', onTouchPointerMove);
      window.removeEventListener('pointerup', stopMouse);
      gl.domElement.removeEventListener('pointerup', onTouchEnd);
      gl.domElement.removeEventListener('pointercancel', onTouchEnd);
      gl.domElement.removeEventListener('contextmenu', noContextMenu);
      window.removeEventListener('portfolio:travel', onTravel);
      window.removeEventListener('portfolio:camera-turn', onCameraTurn);
      window.removeEventListener('portfolio:move', onTouchMove);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('pagehide', persist);
    };
  }, [camera, gl, paused, viewMode]);

  useFrame((state, delta) => {
    if (currentMode.current !== viewMode) {
      if (viewMode === 'bird') {
        if (currentMode.current !== null) {
          groundPosition.current.copy(camera.position);
          aerial.current.x = groundPosition.current.x;
          aerial.current.z = groundPosition.current.z;
        }
        scrollMovement.current.set(0,0,0);
        travel.current = null;
      } else if (currentMode.current === 'bird') {
        camera.position.copy(groundPosition.current);
      }
      currentMode.current = viewMode;
    }

    if (state.clock.elapsedTime - lastSaved.current > .7) {
      persist();
      lastSaved.current = state.clock.elapsedTime;
    }
    if (paused) {
      keys.current = {};
      scrollMovement.current.set(0,0,0);
    }

    if (viewMode === 'bird') {
      if (!paused) {
        const k = keys.current;
        const pan = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0);
        const strafe = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0);
        const a = aerial.current.yaw;
        aerial.current.x = clampWorld(aerial.current.x + (Math.cos(a) * strafe - Math.sin(a) * pan) * delta * 14);
        aerial.current.z = clampWorld(aerial.current.z + (-Math.sin(a) * strafe - Math.cos(a) * pan) * delta * 14);
        if (k.KeyQ) aerial.current.yaw = normalizeAngle(aerial.current.yaw + delta * 1.5);
        if (k.KeyE) aerial.current.yaw = normalizeAngle(aerial.current.yaw - delta * 1.5);
        if (k.Equal || k.NumpadAdd) aerial.current.height = Math.max(BIRD_MIN_HEIGHT, aerial.current.height - delta * 26);
        if (k.Minus || k.NumpadSubtract) aerial.current.height = Math.min(BIRD_MAX_HEIGHT, aerial.current.height + delta * 26);
      }
      // At tilt=0, look straight down. Increasing tilt reveals the sides of
      // buildings/terminals while keeping the area center in the crosshairs.
      const height = aerial.current.height, tilt = aerial.current.tilt;
      const outward = height * Math.tan(tilt);
      camera.position.set(
        aerial.current.x + Math.sin(aerial.current.yaw) * outward,
        height,
        aerial.current.z + Math.cos(aerial.current.yaw) * outward
      );
      camera.rotation.set(-Math.PI / 2 + tilt, aerial.current.yaw, 0);
      return;
    }

    if (!paused) {
      if (travel.current) {
        camera.position.lerp(travel.current, Math.min(1, delta * 4));
        if (camera.position.distanceTo(travel.current) < .12) travel.current = null;
      }
      const k = keys.current;
      const dx = Number(Boolean(k.KeyD || k.ArrowRight)) - Number(Boolean(k.KeyA || k.ArrowLeft)) + touchMove.current.x;
      const dz = Number(Boolean(k.KeyW || k.ArrowUp)) - Number(Boolean(k.KeyS || k.ArrowDown)) - touchMove.current.y;
      const length = Math.hypot(dx, dz);
      if (length > 0) {
        vForward.set(-Math.sin(yaw.current),0,-Math.cos(yaw.current));
        vSide.set(Math.cos(yaw.current),0,-Math.sin(yaw.current));
        vMove.set(0,0,0)
          .addScaledVector(vForward,dz / Math.max(1,length))
          .addScaledVector(vSide,dx / Math.max(1,length));
        camera.position.addScaledVector(vMove,delta * (k.ShiftLeft ? 9 : 5.2));
      }
      if (k.KeyQ) yaw.current = normalizeAngle(yaw.current + delta * 1.8);
      if (k.KeyE) yaw.current = normalizeAngle(yaw.current - delta * 1.8);
      if (k.KeyR) pitch.current = THREE.MathUtils.clamp(pitch.current + delta * 1.2,-MAX_PITCH,MAX_PITCH);
      if (k.KeyF) pitch.current = THREE.MathUtils.clamp(pitch.current - delta * 1.2,-MAX_PITCH,MAX_PITCH);
      const fraction = Math.min(1, delta * 16);
      camera.position.addScaledVector(scrollMovement.current,fraction);
      scrollMovement.current.multiplyScalar(1-fraction);
      camera.position.x = clampWorld(camera.position.x);
      camera.position.z = clampWorld(camera.position.z);
    }
    camera.position.y = EYE_HEIGHT;
    camera.rotation.set(pitch.current, yaw.current, 0);
    groundPosition.current.copy(camera.position);
  });
  return null;
}
