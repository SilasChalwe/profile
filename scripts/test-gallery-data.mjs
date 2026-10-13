import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { portfolio, worldZones, projectsForZone, getProjectMedia } from '../src/content.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const ids=new Set();
for(const project of portfolio.projects){
  assert.ok(project.id && project.title && project.zoneId, 'project must have identity, title and zoneId');
  assert.ok(!ids.has(project.id), 'duplicate project '+project.id);
  ids.add(project.id);
  assert.ok(worldZones.some(zone=>zone.id===project.zoneId), project.id+' has unknown zone '+project.zoneId);
  assert.deepEqual(project.previewImages,getProjectMedia(project),project.id+' media is not dynamic');
  assert.equal(project.coverImage,project.previewImages[0]?.src||null);
}
for(const zone of worldZones){
  assert.deepEqual(
    zone.projectIds,
    projectsForZone(zone.id).map(project=>project.id),
    zone.id+' must populate automatically, with no hand-coded project list'
  );
  assert.equal(zone.position.length,3,zone.id+' needs a valid world position');
}
const preview=read('src/components/MediaGallery.jsx');
const terminal=read('src/components/Terminal.jsx');
const scene=read('src/components/World.jsx');
const panel=read('src/components/ProjectPanel.jsx');
const app=read('src/App.jsx');
assert.match(preview,/onTouchEnd/, 'swipe navigation must work');
assert.match(preview,/addEventListener\('wheel',onWheel,\{passive:false\}\)/,'two-finger gallery swipe must work');
assert.match(preview,/aria-label="Next screenshot"/,'next control required');
assert.match(preview,/aria-label="Previous screenshot"/,'previous control required');
assert.match(terminal,/onPreview\?\.\(project\.id\)/,'project hover should display gallery');
assert.match(app,/className="world-project-preview"/,'hover gallery must stay inside 3D world');
assert.match(scene,/onPreview=\{onPreview\}/,'gallery events should traverse zone scene');
assert.match(panel,/<MediaGallery/, 'detail screen must reuse media gallery');
console.log('Data-driven zones, projects, gallery and swipe interactions validated.');
