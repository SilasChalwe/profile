import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { worldZones } from '../src/content.js';
import {
  createTourStops, interpolateTourPose, shortestAngle,
  smoothStep, tourTravelDuration, TOUR_VISIT_SECONDS
} from '../src/lib/guided-tour.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const stops = createTourStops(worldZones);
assert.equal(stops.length, worldZones.length + 2, 'the tour must visit every configured zone and return home');
assert.equal(stops[0].id, 'plaza');
assert.equal(stops.at(-1).id, 'finish');
assert.deepEqual(stops[0].position, stops.at(-1).position);
assert.deepEqual(stops.slice(1,-1).map(stop=>stop.id),worldZones.map(zone=>zone.id),
  'the tour must always track edited zone data');

for(let i=1;i<stops.length;i++){
  const from=stops[i-1],to=stops[i];
  const seconds=tourTravelDuration(from,to);
  assert.ok(seconds>=4.5 && seconds<=11,'travel duration should remain comfortable');
  const start=interpolateTourPose(from,to,0);
  const middle=interpolateTourPose(from,to,.5);
  const end=interpolateTourPose(from,to,1);
  assert.deepEqual(start.position,from.position);
  assert.deepEqual(end.position,to.position);
  assert.ok(middle.position.every(Number.isFinite));
  assert.ok(to.position.every(Number.isFinite));
  assert.ok(Math.abs(to.position[0])<=34 && Math.abs(to.position[2])<=34,
    'guided tour camera must remain in the navigable map');
}
assert.equal(smoothStep(-1),0);
assert.equal(smoothStep(2),1);
assert.equal(smoothStep(.5),.5);
assert.ok(Math.abs(shortestAngle(Math.PI-.1,-Math.PI+.1)-.2)<1e-8,
  'camera must rotate across the shortest arc');
assert.ok(TOUR_VISIT_SECONDS>=3,'visitors should have time to inspect each stop');

const player=read('src/components/Player.jsx');
const app=read('src/App.jsx');
const hud=read('src/components/HUD.jsx');
const intro=read('src/components/IntroScreen.jsx');
const world=read('src/components/World.jsx');

assert.match(intro,/Start guided tour/i);
assert.match(hud,/Start tour/);
assert.match(hud,/Pause/);
assert.match(hud,/Resume/);
assert.match(hud,/Stop/);
assert.match(hud,/Replay/);
assert.match(app,/tourStatus=\{tour.status\}/);
assert.match(world,/tourRunId=\{tourRunId\}/);
assert.match(player,/interpolateTourPose\(previous, next, progress\)/);
assert.match(player,/if \(tourStatus === 'playing' && !paused\)/);
assert.match(player,/onTourFinish\?\.\(\)/);
assert.match(app,/stopTour\(\)/);
assert.match(app,/onStartTour=\{startTour\}/);
console.log(`Guided tour verified: ${worldZones.length} data-driven exhibitions, pause/resume/stop, return-to-plaza and player wiring.`);
