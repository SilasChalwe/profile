import { portfolio, worldZones } from '../src/content.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');

const failures = [];
for (const project of portfolio.projects) {
  for (const field of ['id', 'title', 'zoneId']) {
    if (!project[field]) failures.push(`${project.id || 'unknown project'} is missing ${field}`);
  }
  if (!Array.isArray(project.tech)) failures.push(`${project.id} technologies must be an array`);
  if (!Array.isArray(project.previewImages)) failures.push(`${project.id} media must be an array`);
  if (project.link && !/^https?:\/\//.test(project.link)) failures.push(`${project.id} has invalid public link`);
  if (project.preview && !fs.existsSync(path.join(root,'public',project.preview.replace(/^\//, '')))) failures.push(`${project.id} preview not found: ${project.preview}`);
}
for(const zone of worldZones) {
  if (!Array.isArray(zone.position) || zone.position.length!==3 || !zone.position.every(Number.isFinite)) failures.push(`Invalid position for ${zone.id}`);
  for(const id of zone.projectIds) if(!portfolio.projects.some(p=>p.id===id)) failures.push(`${zone.id} references unknown project: ${id}`);
}
for (const item of portfolio.placeholders) {
  if (item.status !== 'needs-information' || item.placeholder !== true || !item.requiredInformation) failures.push(`Invalid placeholder: ${item.id}`);
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Validated ${portfolio.projects.length} projects across ${worldZones.length} explorable zones, their preview files and ${portfolio.placeholders.length} explicit placeholders.`);
