import React, { useRef, useState } from 'react';
import { worldZones } from '../content.js';
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
  const end = () => {
    origin.current = null;
    setStick({ x:0, y:0 });
    window.dispatchEvent(new CustomEvent('portfolio:move', { detail: { x:0, y:0 } }));
  };
  return <div className="touch-stick" onPointerDown={update}
    onPointerMove={event => { if (origin.current) update(event); }}
    onPointerUp={end} onPointerCancel={end} aria-label="Touch movement control">
    <i style={{ transform:`translate(${stick.x*28}px,${stick.y*28}px)` }}></i>
  </div>;
}

export default function HUD({
  paused, setPaused, activeZone, onTravel, onHome, ambient, setAmbient,
  effects, setEffects, quality, setQuality, onAccessible
}) {
  const [areasOpen, setAreasOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const current = worldZones.find(zone => zone.id === activeZone);
  const goHome = () => {
    document.exitPointerLock?.();
    onHome();
    setAreasOpen(false);
    setHelpOpen(false);
  };
  const visit = id => {
    document.exitPointerLock?.();
    onTravel(id);
    setAreasOpen(false);
    setHelpOpen(false);
  };
  const showAreas = () => {
    portfolioAudio.play('select');
    document.exitPointerLock?.();
    setAreasOpen(value => !value);
    setHelpOpen(false);
  };
  const showHelp = () => {
    portfolioAudio.play('select');
    document.exitPointerLock?.();
    setHelpOpen(value => !value);
    setAreasOpen(false);
  };
  return <div className="hud">
    <header className="hud-top">
      <div className="hud-brand"><b>SC</b><span>INTERACTIVE PORTFOLIO</span></div>
      <div className="hud-location" aria-live="polite"><i></i>{current?.label || 'Central Plaza'}</div>
      <nav className="hud-actions" aria-label="Portfolio world navigation">
        <button type="button" onClick={goHome} title="Return to the starting area">⌂ Start</button>
        <button type="button" className={areasOpen ? 'is-active' : ''} onClick={showAreas}
          aria-expanded={areasOpen} aria-controls="portfolio-area-list">Explore Areas</button>
        <button type="button" className={helpOpen ? 'is-active' : ''} onClick={showHelp}
          aria-expanded={helpOpen} aria-controls="portfolio-help">Help</button>
        <button type="button" onClick={() => { document.exitPointerLock?.(); setPaused(true); portfolioAudio.play('select'); }}>Settings</button>
      </nav>
    </header>
    <div className="reticle" aria-hidden="true"><i></i><i></i></div>
    <div className="hud-help">Choose <strong>Explore Areas</strong> to visit projects directly. Keyboard movement is optional.</div>
    <button className="map-toggle" type="button" onClick={showAreas}
      aria-expanded={areasOpen} aria-controls="portfolio-area-list">
      Explore Areas <span>{areasOpen ? '×' : '↗'}</span>
    </button>
    {areasOpen && <nav id="portfolio-area-list" className="world-map" aria-label="Jump directly to an exhibition area">
      <div className="world-map-heading">
        <strong>Explore my work</strong>
        <button type="button" onClick={() => setAreasOpen(false)} aria-label="Close area list">×</button>
      </div>
      <button type="button" onClick={goHome}><span>⌂</span><i style={{background:'#05245A'}}></i>Central Plaza / Start</button>
      {worldZones.map((zone,index) => <button type="button" key={zone.id}
        className={zone.id===activeZone ? 'is-active' : ''}
        onClick={() => visit(zone.id)}>
        <span>{String(index+1).padStart(2,'0')}</span>
        <i style={{background:zone.color}}></i>{zone.label} <b>→</b>
      </button>)}
    </nav>}
    {helpOpen && <section id="portfolio-help" className="hud-help-panel" aria-label="How to explore the portfolio">
      <div className="hud-help-heading"><strong>How to explore</strong>
        <button type="button" onClick={() => setHelpOpen(false)} aria-label="Close help">×</button>
      </div>
      <p><strong>Easiest:</strong> Select <b>Explore Areas</b> to jump straight to a category, then click a project card to see the details.</p>
      <p><strong>Optional game controls:</strong> WASD or arrow keys to walk, drag on the scene to look around, or use the touch joystick on phones.</p>
      <p>Press <b>Escape</b> to release mouse look. Use <b>Start</b> at any time to return to the central area.</p>
      <button type="button" className="hud-primary" onClick={() => {setHelpOpen(false);setAreasOpen(true);}}>Choose an area →</button>
    </section>}
    <TouchControls />
    {paused && <div className="pause-layer" role="dialog" aria-modal="true" aria-labelledby="pauseTitle">
      <div className="pause-panel"><p>EXPLORATION PAUSED</p><h2 id="pauseTitle">Settings</h2>
        <button className="resume" onClick={() => {portfolioAudio.play('select');setPaused(false);}}>Continue exploring <span>→</span></button>
        <label><span>Ambient audio<small>Optional atmospheric sound</small></span><input type="checkbox" checked={ambient} onChange={event=>setAmbient(event.target.checked)} /></label>
        <label><span>Interaction sounds<small>Selection and transition cues</small></span><input type="checkbox" checked={effects} onChange={event=>setEffects(event.target.checked)} /></label>
        <label><span>Render quality<small>Performance mode for low-powered devices</small></span><select value={quality} onChange={event=>setQuality(event.target.value)}><option value="high">High</option><option value="low">Performance</option></select></label>
        <button className="accessible-link" onClick={onAccessible}>Switch to standard, non-3D portfolio</button>
        <button className="accessible-link" onClick={() => {setPaused(false);goHome();}}>Return to the starting area</button>
      </div>
    </div>}
  </div>;
}
