import React, { useEffect, useRef } from 'react';
import { portfolioAudio } from '../lib/audio.js';

export default function ProjectPanel({ project, onClose }) {
  const closeRef=useRef();
  useEffect(()=>{
    closeRef.current?.focus();
    const onKey=e=>{if(e.key==='Escape'){e.stopPropagation();onClose();}};
    window.addEventListener('keydown',onKey);
    return ()=>window.removeEventListener('keydown',onKey);
  },[onClose]);
  const close=()=>{portfolioAudio.play('close');onClose();};
  return <div className="project-overlay" role="dialog" aria-modal="true" aria-labelledby="projectTitle">
    <div className="project-panel">
      <button ref={closeRef} className="project-close" onClick={close}>Return to world <span>×</span></button>
      <header>
        <p>{project.discipline} · {project.status}</p>
        <h2 id="projectTitle">{project.title}</h2>
        <h3>{project.strapline}</h3>
      </header>
      <section className="project-media-stage" aria-label="Project media">
        {project.preview&&<figure>
          <img src={project.preview} alt={project.title+' — '+(project.previewType||'project visual')}/>
          <figcaption>{project.previewType||'Project information diagram'}. This is not represented as a genuine application screenshot.</figcaption>
        </figure>}
        <div className="project-media-notes">
          <span>PROJECT EXHIBIT</span>
          <strong>{project.media?.placeholder?'Source screenshots to be added':'Design and engineering work'}</strong>
          <p>{project.media?.label||'See the project source for verified details.'}</p>
          <p>Actual app screens, UI prototypes and approved client visuals can replace this illustrated overview when supplied.</p>
        </div>
      </section>
      <div className="project-story">
        <section><span>01 / THE PROBLEM</span><p>{project.problem}</p></section>
        <section><span>02 / MY CONTRIBUTION</span><p>{project.role}</p><p>{project.contribution}</p></section>
        <section><span>03 / WORK &amp; IMPLEMENTATION</span><ul>{project.details.map(item=><li key={item}>{item}</li>)}</ul></section>
        <section><span>04 / TOOLS &amp; TECHNOLOGY</span><div className="project-tags">{project.tech.map(item=><i key={item}>{item}</i>)}</div></section>
      </div>
      <footer><p>Current stage: {project.status}</p>{project.link&&<a href={project.link} target="_blank" rel="noopener noreferrer">{project.linkLabel||'Project link'} ↗</a>}</footer>
    </div>
  </div>;
}