import React, { useEffect, useRef, useState } from 'react';

// One carousel shared by hover previews and full case studies. It never opens
// the details page by itself; only the explicit "View project" action does.
export default function MediaGallery({
  project, compact = false, onOpen, onKeepOpen, onLeave
}) {
  const images = project?.previewImages || [];
  const [index,setIndex]=useState(0);
  const startX=useRef(null);
  const lastWheel=useRef(0);
  useEffect(()=>setIndex(0),[project?.id]);
  const count=images.length;
  const choose=i=>{if(count)setIndex(((i%count)+count)%count);};
  const step=amount=>choose(index+amount);
  const onWheel=event=>{
    if(count<2 || event.ctrlKey)return;
    const delta=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;
    if(Math.abs(delta)<7)return;
    event.preventDefault();event.stopPropagation();
    const now=Date.now();
    if(now-lastWheel.current>250){step(delta>0?1:-1);lastWheel.current=now;}
  };
  const onTouchStart=event=>{if(event.touches.length===1)startX.current=event.touches[0].clientX;};
  const onTouchEnd=event=>{
    if(startX.current===null)return;
    const distance=event.changedTouches[0].clientX-startX.current;
    startX.current=null;
    if(Math.abs(distance)>35)step(distance<0?1:-1);
  };

  return <section
    className={`project-gallery ${compact?'project-gallery--preview':'project-gallery--detail'}`}
    aria-label={`${project.title} project screenshots`}
    onMouseEnter={onKeepOpen}
    onMouseLeave={onLeave}
    onWheel={onWheel}
    onTouchStart={onTouchStart}
    onTouchEnd={onTouchEnd}
  >
    <div className="project-gallery__stage">
      {count ? <figure key={images[index].src}>
        <img src={images[index].src} alt={images[index].alt || `${project.title}, screen ${index+1}`}
          loading={compact?'eager':'lazy'}
          onError={e=>{e.currentTarget.style.visibility='hidden';}} />
        <figcaption>{images[index].caption || `Screen ${index+1}`}</figcaption>
      </figure> : <div className="project-gallery__pending" role="note">
        <strong>Original screenshots pending</strong>
        <p>{project.media?.label || 'Project images have not been supplied.'}</p>
      </div>}
    </div>
    {count>1 && <div className="project-gallery__controls">
      <button type="button" aria-label="Previous screenshot" onClick={()=>step(-1)}>←</button>
      <span aria-live="polite">{index+1} / {count}</span>
      <button type="button" aria-label="Next screenshot" onClick={()=>step(1)}>→</button>
    </div>}
    {count>1 && <div className="project-gallery__dots" aria-label="Choose screenshot">
      {images.map((image,i)=><button type="button" key={image.src} aria-label={`View screenshot ${i+1}`}
        aria-current={i===index?'true':undefined} onClick={()=>choose(i)} />)}
    </div>}
    {compact && <div className="project-gallery__footer">
      <div><strong>{project.title}</strong><small>{project.discipline}</small></div>
      <button type="button" onClick={()=>onOpen?.(project.id)}>View project →</button>
    </div>}
  </section>;
}
