import { portfolio, worldZones } from '../src/content.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');

const failures = [];
for (const project of portfolio.projects) {
  for (const field of ['id', 'title', 'status', 'role', 'problem', 'contribution', 'link']) {
    if (!project[field]) failures.push(`${project.id || 'unknown project'} is missing ${field}`);
  }
  if (!Array.isArray(project.tech) || !project.tech.length) failures.push(`${project.id} has no technology evidence`);
  if (!project.preview || !project.preview.startsWith('/assets/previews/')) failures.push(`${project.id} has no preview path`);
  else if (!fs.existsSync(path.join(root,'public',project.preview.slice(1)))) failures.push(`${project.id} preview not found: ${project.preview}`);
}
for(const zone of worldZones) {
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
