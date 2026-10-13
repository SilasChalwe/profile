import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { worldZones } from '../src/content.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const world = read('src/components/World.jsx');
const zone = read('src/components/Zone.jsx');
const terminal = read('src/components/Terminal.jsx');
const player = read('src/components/Player.jsx');
const app = read('src/App.jsx');
const hud = read('src/components/HUD.jsx');
const css = read('src/styles.css');

assert.match(world, /args=\{\['#ffffff'\]\}/, '3D background must be white-first');
assert.match(world, /color="#ffffff"/, 'original world structures must use light materials');
assert.match(world, /function CentralPlaza/, 'original central plaza must remain');
assert.match(world, /function Paths/, 'original walking paths must remain');
assert.match(zone, /<Billboard follow lockX lockZ/, 'labels must face the player');
assert.match(terminal, /<Billboard follow lockX lockZ/, 'project exhibits must face the player');
assert.match(hud, /Explore areas/i, 'direct section navigation must be discoverable');
assert.match(hud, /⌂ Home/, 'visitors need a visible return-to-start action');
assert.match(hud, /2 FINGERS/, 'first-time visitors need instructions');
assert.match(hud, /Switch to standard portfolio view/, 'visitors need a non-game alternative');
assert.match(app, /onHome=\{\(\) => travel\('plaza'\)\}/, 'home navigation must be connected');
assert.match(player, /addEventListener\('wheel', onWheel, \{ passive: false \}\)/, 'two-finger scrolling must be handled on the 3D canvas');
assert.match(player, /event\.preventDefault\(\)/, 'browser scrolling must not steal 3D navigation');
assert.match(player, /event\.deltaX/, 'two-finger sideways swipe must work');
assert.match(player, /event\.deltaY/, 'two-finger vertical swipe must work');
assert.match(player, /event\.pointerType === 'mouse' && event\.button === 2/, 'only right mouse button may rotate view');
assert.doesNotMatch(player, /event\.button === 0/, 'single left clicks must never rotate the camera');
assert.doesNotMatch(player, /requestPointerLock/, 'the cursor must remain freely usable');
assert.match(css, /COLOR-ONLY REFINEMENT OF THE ORIGINAL LAYOUT/, 'white navigation theme is required');
assert.match(hud, /Look 360°/, '360-degree camera view should be selectable');
assert.match(hud, /Bird's-eye/, 'aerial view must be available');
assert.match(hud, /Behind/, 'a direct look-behind option must be visible');
assert.match(player, /viewMode === 'look'/, 'look mode should handle full camera rotation');
assert.match(player, /viewMode === 'bird'/, 'bird mode must be implemented');
assert.match(player, /camera\.rotation\.set\(-Math\.PI \/ 2 \+ tilt, aerial\.current\.yaw, 0\)/, 'bird camera must support top-down and tilted aerial perspectives');
assert.match(player, /height \* Math\.tan\(tilt\)/, 'aerial tilt must preserve the target area at the center');
assert.match(hud, /Top-down/, 'overhead controls must offer a straight-down reset');
assert.match(hud, /Tilt 3D/, 'overhead controls must offer an angled view');
assert.match(player, /pitch\.current - dy \* \.006, -MAX_PITCH, MAX_PITCH/, 'two-finger vertical look should work');
assert.match(player, /BIRD_MAX_HEIGHT/, 'bird camera zoom range should be controlled');

// When teleporting to a zone, spawn on its inward-facing side, looking at the exhibit.
// This prevents the backwards text / rear-of-pavilion view that was reported.
for (const exhibition of worldZones) {
  const [x,,z] = exhibition.position;
  const yaw = Math.atan2(-x,-z);
  const px = x + Math.sin(yaw) * 8;
  const pz = z + Math.cos(yaw) * 8;
  const towardExhibit = [(x - px)/8, (z - pz)/8];
  const cameraForward = [-Math.sin(yaw), -Math.cos(yaw)];
  assert.ok(Math.abs(towardExhibit[0] - cameraForward[0]) < 1e-10, exhibition.id + ' x facing');
  assert.ok(Math.abs(towardExhibit[1] - cameraForward[1]) < 1e-10, exhibition.id + ' z facing');
  assert.ok(Math.abs(px) <= 34 && Math.abs(pz) <= 34, exhibition.id + ' must be inside map bounds');
}
console.log('3D scene structure, white palette, navigation and camera approach checks passed.');
