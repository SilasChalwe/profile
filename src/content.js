import siteData from './data/site-data.json' with { type: 'json' };
import mediaManifest from './data/project-media.json' with { type: 'json' };

// Data is defined in the two JSON files above. Three.js geometry, routing,
// labels and galleries are generated from the data, not hand-coded by project.
export const portfolio = siteData.portfolio;

// Keep existing zone positions exactly as published. A newly added zone can
// omit 'position': it will be allocated a place on an outer circular ring.
function generatedPosition(index, count) {
  const angle = (index / Math.max(count,1)) * Math.PI * 2 - Math.PI / 2;
  return [Math.round(Math.cos(angle)*31), 0, Math.round(Math.sin(angle)*31)];
}

export const worldZones = siteData.zones.map((zone,index,array)=>({
  ...zone,
  position: Array.isArray(zone.position) && zone.position.length===3
    ? zone.position : generatedPosition(index,array.length),
  color: zone.color || '#FE6202'
}));

export const getProjectMedia = project => {
  const id = typeof project==='string' ? project : project?.id;
  return mediaManifest[id] || [];
};

// Normalize each editable JSON entry into a fully populated project.
for (const project of portfolio.projects) {
  project.zoneId = project.zoneId || 'software';
  project.previewImages = getProjectMedia(project);
  project.coverImage = project.previewImages[0]?.src || null;
  project.details = Array.isArray(project.details) ? project.details : [];
  project.tech = Array.isArray(project.tech) ? project.tech : [];
  project.status = project.status || 'Documentation pending';
  project.discipline = project.discipline || 'Project work';
  project.strapline = project.strapline || 'Public description pending';
  project.problem = project.problem || 'Problem statement awaiting verified details.';
  project.role = project.role || 'Contribution awaiting verification.';
  project.contribution = project.contribution || 'Technical work to be documented.';
  project.media = project.media || { placeholder: true, label: 'Original screenshots pending' };
}

for (const zone of worldZones) {
  zone.projectIds = portfolio.projects
    .filter(project => project.zoneId === zone.id && project.published !== false)
    .map(project => project.id);
}

export const projectsForZone = zoneId => portfolio.projects.filter(
  project => project.zoneId === zoneId && project.published !== false
);
