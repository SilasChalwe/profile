import { portfolio } from '../src/content.js';

const failures = [];
for (const project of portfolio.projects) {
  for (const field of ['id', 'title', 'status', 'role', 'problem', 'contribution', 'link']) {
    if (!project[field]) failures.push(`${project.id || 'unknown project'} is missing ${field}`);
  }
  if (!Array.isArray(project.tech) || !project.tech.length) failures.push(`${project.id} has no technology evidence`);
}
for (const item of portfolio.placeholders) {
  if (item.status !== 'needs-information' || item.placeholder !== true || !item.requiredInformation) failures.push(`Invalid placeholder: ${item.id}`);
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Validated ${portfolio.projects.length} projects and ${portfolio.placeholders.length} explicit placeholders.`);
