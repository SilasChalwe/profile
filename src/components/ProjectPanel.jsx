import MediaGallery from './MediaGallery.jsx';
import React, { useEffect, useRef } from 'react';

export default function ProjectPanel({ project, onClose }) {
  const closeRef = useRef();
  useEffect(() => { closeRef.current?.focus(); }, []);
  return <div className="project-overlay" role="dialog" aria-modal="true" aria-labelledby="projectTitle">
    <div className="project-panel">
      <button ref={closeRef} className="project-close" onClick={onClose}>Return to world <span>×</span></button>
      <header><p>{project.discipline} · {project.status}</p><h2 id="projectTitle">{project.title}</h2><h3>{project.strapline}</h3></header>
      <MediaGallery key={project.id} project={project} />
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
