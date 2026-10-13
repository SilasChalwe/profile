import React, { useRef, useState } from 'react';
import { worldZones, projectsForZone } from '../content.js';
import { portfolioAudio } from '../lib/audio.js';

function TouchControls() {
  const origin = useRef(null);
  const [stick, setStick] = useState({ x: 0, y: 0 });
  const update = event => {
    if (!origin.current) {
      const rect = event.currentTarget.getBoundingClientRect();
      origin.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    const x = Math.max(-1, Math.min(1, (event.clientX - origin.current.x) / 42));
    const y = Math.max(-1, Math.min(1, (event.clientY - origin.current.y) / 42));
    setStick({ x, y });
    window.dispatchEvent(new CustomEvent('portfolio:move', { detail: { x, y } }));
  };
  const end = () => { origin.current = null; setStick({ x:0,y:0 }); window.dispatchEvent(new CustomEvent('portfolio:move', { detail: { x:0,y:0 } })); };
  return <div className="touch-stick" onPointerDown={update} onPointerMove={event => { if (origin.current) update(event); }} onPointerUp={end} onPointerCancel={end} aria-label="Touch movement control"><i style={{ transform:`translate(${stick.x*28}px,${stick.y*28}px)` }}></i></div>;
}

export default function HUD({ paused, setPaused, activeZone, onTravel, onHome, onBack, canGoBack, viewMode, setViewMode, tour, onStartTour, onPauseTour, onResumeTour, onStopTour, ambient, setAmbient, effects, setEffects, quality, setQuality, onAccessible }) {
  const [mapOpen, setMapOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const closeMaps = () => { setMapOpen(false); setHelpOpen(false); };
  const changeMode = mode => {
    portfolioAudio.play('select');
    setViewMode(mode);
    setMapOpen(false);
  };
  const adjustView = detail => window.dispatchEvent(
    new CustomEvent('portfolio:camera-turn', { detail })
  );
  const home = () => { closeMaps(); onHome(); };
  const back = () => { closeMaps(); onBack(); };
  return <div className="hud">
    <header className="hud-top"><div className="hud-brand"><b>SC</b><span>INTERACTIVE PORTFOLIO</span></div><div className="hud-location"><i></i>{worldZones.find(zone=>zone.id===activeZone)?.label || 'Central plaza'}</div><nav className="hud-actions" aria-label="Portfolio navigation">
      <button type="button" onClick={back} disabled={!canGoBack} aria-label="Go to previous area">← Back</button>
      <button type="button" onClick={home} aria-label="Go to starting area">⌂ Home</button>
      <button type="button" onClick={() => {closeMaps();onStartTour();}} title="Play a guided automatic tour of the entire portfolio">▶ Start tour</button>
      <button type="button" onClick={() => {setHelpOpen(v=>!v);setMapOpen(false);}} aria-expanded={helpOpen}>Help</button>
      <button type="button" onClick={() => {if(tour.status === 'playing')onPauseTour();setPaused(true);setHelpOpen(false);setMapOpen(false)}} aria-label="Open settings">Settings</button>
    </nav></header>
    <section className="camera-controls" aria-label="Camera and viewpoint controls">
      <div className="camera-controls__modes" role="group" aria-label="Choose camera mode">
        <button type="button" className={viewMode==='move'?'is-active':''}
          aria-pressed={viewMode==='move'} onClick={()=>changeMode('move')} title="Two fingers move through the 3D world">
          Move
        </button>
        <button type="button" className={viewMode==='look'?'is-active':''}
          aria-pressed={viewMode==='look'} onClick={()=>changeMode('look')} title="Two fingers look left, right, up and down">
          Look 360°
        </button>
        <button type="button" className={viewMode==='bird'?'is-active':''}
          aria-pressed={viewMode==='bird'} onClick={()=>changeMode('bird')} title="Fly above the portfolio for a bird's-eye view">
          Bird's-eye
        </button>
      </div>
      {viewMode==='look' && <div className="camera-controls__actions" role="group" aria-label="Turn the camera">
        <button type="button" onClick={()=>adjustView({yawDelta:Math.PI/4})} title="Turn left 45 degrees">↶ Left</button>
        <button type="button" onClick={()=>adjustView({yawDelta:Math.PI})} title="Look directly behind you">Behind</button>
        <button type="button" onClick={()=>adjustView({yawDelta:-Math.PI/4})} title="Turn right 45 degrees">Right ↷</button>
        <button type="button" onClick={()=>adjustView({pitchDelta:.35})} title="Look up">↑ Up</button>
        <button type="button" onClick={()=>adjustView({pitchDelta:-.35})} title="Look down">↓ Down</button>
        <button type="button" onClick={()=>adjustView({level:true})} title="Return to a level view">Level</button>
      </div>}
      {viewMode==='bird' && <div className="camera-controls__actions" role="group" aria-label="Rotate and zoom overhead camera">
        <button type="button" onClick={()=>adjustView({yawDelta:Math.PI/4})}>↶ Rotate</button>
        <button type="button" onClick={()=>adjustView({yawDelta:-Math.PI/4})}>Rotate ↷</button>
        <button type="button" onClick={()=>adjustView({zoomDelta:-12})}>+ Zoom</button>
        <button type="button" onClick={()=>adjustView({zoomDelta:12})}>− Zoom</button>
        <button type="button" onClick={()=>adjustView({tiltDelta:.2})}>Tilt 3D</button>
        <button type="button" onClick={()=>adjustView({topDown:true})}>Top-down</button>
      </div>}
    </section>
    {(tour.status === 'playing' || tour.status === 'paused' || tour.status === 'complete') && (
      <section className="tour-player" aria-label="Guided portfolio tour player">
        <div className="tour-player__info" aria-live="polite">
          <strong>{tour.status === 'complete' ? '✓ Guided tour complete' : tour.status === 'paused' ? '⏸ Tour paused' : '▶ Guided tour'}</strong>
          <span>{tour.status === 'complete' ? 'You can explore freely or watch again' :
            `${tour.phase === 'visiting' ? 'Viewing' : 'Travelling to'}: ${tour.label}`}</span>
          <small>{tour.status === 'complete' ? 'Finished' : `Area ${tour.index} of ${tour.total}`}</small>
          {tour.status !== 'complete' && tour.phase === 'visiting' && projectsForZone(tour.id).length > 0 && (
            <em>Featured: {projectsForZone(tour.id).map(project=>project.title).join(' · ')}</em>
          )}
        </div>
        <div className="tour-player__actions">
          {tour.status === 'complete' ? (
            <button type="button" onClick={onStartTour}>↻ Replay</button>
          ) : (
            <>
              <button type="button" onClick={tour.status === 'paused' ? onResumeTour : onPauseTour}>
                {tour.status === 'paused' ? '▶ Resume' : '⏸ Pause'}
              </button>
              <button type="button" onClick={onStopTour}>■ Stop</button>
            </>
          )}
        </div>
      </section>
    )}
    <div className="reticle" aria-hidden="true"><i></i><i></i></div>
    <div className="hud-help">
      <span>1 FINGER: POINT & CLICK</span>
      <span>{viewMode==='move' ? '2 FINGERS: WALK & STRAFE' : viewMode==='look' ? '2 FINGERS: TURN & LOOK UP/DOWN' : '2 FINGERS: PAN OVERHEAD'}</span>
      <span>{viewMode==='bird' ? 'Q/E: ROTATE · +/-: ZOOM' : 'Q/E: TURN · R/F: LOOK UP/DOWN'}</span>
    </div>
    <button className="map-toggle" onClick={() => {setMapOpen(value=>!value);setHelpOpen(false)}} aria-expanded={mapOpen}>Explore areas <span>{mapOpen?'×':'+'}</span></button>
    {mapOpen && <nav className="world-map" aria-label="Jump to exhibition area">
      <button type="button" onClick={home}><span>⌂</span><i style={{background:'#05245A'}}></i>Central plaza</button>
      {worldZones.map((zone,index)=><button type="button" key={zone.id} className={zone.id===activeZone?'is-active':''} onClick={()=>{onTravel(zone.id);closeMaps()}}><span>0{index+1}</span><i style={{background:zone.color}}></i>{zone.label}</button>)}
    </nav>}
    {helpOpen && <section className="hud-quick-help" aria-label="How to explore">
      <strong>Explore the portfolio</strong>
      <p>Use <b>Move</b> for two-finger walking and strafing. Switch to <b>Look 360°</b> and two-finger swipe to turn behind you or look up and down. <b>Bird's-eye</b> shows the world from above; two fingers pan, and the rotate, zoom and tilt buttons adjust the view.</p><p>A single finger still points and clicks on a laptop touchpad. With a mouse, right-drag rotates in Look mode. Q/E turn, R/F tilt, and WASD or arrow keys move.</p>
      <p>For an automatic experience, select <b>Start tour</b>. The camera will travel through each exhibition, pause briefly, and return to the plaza. Pause, resume or stop whenever you want. You can still use <b>Explore areas</b> to jump directly to a zone.</p>
      <button type="button" onClick={()=>{setHelpOpen(false);setMapOpen(true)}}>Browse project areas →</button>
    </section>}
    <TouchControls />
    {paused && <div className="pause-layer" role="dialog" aria-modal="true" aria-labelledby="pauseTitle">
      <div className="pause-panel"><p>WORLD PAUSED</p><h2 id="pauseTitle">Settings</h2>
        <button className="resume" onClick={()=>setPaused(false)}>Resume exploration <span>→</span></button>
        <label><span>Ambient audio<small>Optional atmospheric sound</small></span><input type="checkbox" checked={ambient} onChange={event=>setAmbient(event.target.checked)} /></label>
        <label><span>Interaction sounds<small>Selection and transition cues</small></span><input type="checkbox" checked={effects} onChange={event=>setEffects(event.target.checked)} /></label>
        <label><span>Render quality<small>Lower quality improves mobile performance</small></span><select value={quality} onChange={event=>setQuality(event.target.value)}><option value="high">High</option><option value="low">Performance</option></select></label>
        <button className="accessible-link" onClick={onAccessible}>Switch to standard portfolio view</button>
        <button className="accessible-link" onClick={() => {setPaused(false);home()}}>Return to central plaza</button>
      </div>
    </div>}
  </div>;
}
