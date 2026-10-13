import React, { useEffect, useRef } from 'react';

const genuineMedia = {
  gate: { src: '/assets/previews/gate.svg', caption: 'Gate original brand artwork. UI screenshots not yet published.' },
  mfocus: { src: '/assets/previews/mfocus.svg', caption: 'MFocus original application screenshot. Product screens pending further curation.' }
};

export default function ProjectPanel({ project, onClose }) {
  const closeRef = useRef();
  useEffect(() => { closeRef.current?.focus(); }, []);
  const image = genuineMedia[project.id];
  return <div className="project-overlay" role="dialog" aria-modal="true" aria-labelledby="projectTitle">
    <div className="project-panel">
      <button ref={closeRef} className="project-close" onClick={onClose}>Return to world <span>×</span></button>
      <header><p>{project.discipline} · {project.status}</p><h2 id="projectTitle">{project.title}</h2><h3>{project.strapline}</h3></header>
      {image ? <figure className="project-media-actual"><img src={image.src} alt={image.caption}/><figcaption>{image.caption}</figcaption></figure> :
      <div className="project-media-placeholder"><div><span>PROJECT IMAGES</span><strong>{project.media?.label || 'Images pending'}</strong><p>Original approved screenshots are still required. No fabricated diagrams are displayed.</p></div></div>}
      <div className="project-story">
        <section><span>01 / PROBLEM</span><p>{project.problem}</p></section>
        <section><span>02 / MY ROLE</span><p>{project.role}</p><p>{project.contribution}</p></section>
        <section><span>03 / ENGINEERING</span><ul>{project.details.map(item=><li key={item}>{item}</li>)}</ul></section>
        <section><span>04 / TECHNOLOGY</span><div className="project-tags">{project.tech.map(item=><i key={item}>{item}</i>)}</div></section>
      </div>
      <footer><p>Stage: {project.status}</p><a href={project.link} target="_blank" rel="noreferrer">{project.linkLabel} ↗</a></footer>
    </div>
  </div>;
}
