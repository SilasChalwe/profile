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
  const end = () => { origin.current = null; setStick({ x:0,y:0 }); window.dispatchEvent(new CustomEvent('portfolio:move', { detail: { x:0,y:0 } })); };
  return <div className="touch-stick" onPointerDown={update} onPointerMove={event => { if (origin.current) update(event); }} onPointerUp={end} onPointerCancel={end} aria-label="Touch movement control"><i style={{ transform:`translate(${stick.x*28}px,${stick.y*28}px)` }}></i></div>;
}

export default function HUD({ paused, setPaused, activeZone, onTravel, onHome, onBack, canGoBack, ambient, setAmbient, effects, setEffects, quality, setQuality, onAccessible }) {
  const [mapOpen, setMapOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const closeMaps = () => { setMapOpen(false); setHelpOpen(false); };
  const home = () => { closeMaps(); onHome(); };
  const back = () => { closeMaps(); onBack(); };
  return <div className="hud">
    <header className="hud-top"><div className="hud-brand"><b>SC</b><span>INTERACTIVE PORTFOLIO</span></div><div className="hud-location"><i></i>{worldZones.find(zone=>zone.id===activeZone)?.label || 'Central plaza'}</div><nav className="hud-actions" aria-label="Portfolio navigation">
      <button type="button" onClick={back} disabled={!canGoBack} aria-label="Go to previous area">← Back</button>
      <button type="button" onClick={home} aria-label="Go to starting area">⌂ Start</button>
      <button type="button" onClick={() => {setHelpOpen(v=>!v);setMapOpen(false);}} aria-expanded={helpOpen}>Help</button>
      <button type="button" onClick={() => {setPaused(true);setHelpOpen(false);setMapOpen(false)}} aria-label="Open settings">Settings</button>
    </nav></header>
    <div className="reticle" aria-hidden="true"><i></i><i></i></div>
    <div className="hud-help"><span>1 FINGER: POINT & CLICK</span><span>2 FINGERS: SWIPE TO MOVE</span><span>WASD / ARROWS: OPTIONAL</span></div>
    <button className="map-toggle" onClick={() => {setMapOpen(value=>!value);setHelpOpen(false)}} aria-expanded={mapOpen}>Explore areas <span>{mapOpen?'×':'+'}</span></button>
    {mapOpen && <nav className="world-map" aria-label="Jump to exhibition area">
      <button type="button" onClick={home}><span>⌂</span><i style={{background:'#05245A'}}></i>Central plaza</button>
      {worldZones.map((zone,index)=><button type="button" key={zone.id} className={zone.id===activeZone?'is-active':''} onClick={()=>{onTravel(zone.id);closeMaps()}}><span>0{index+1}</span><i style={{background:zone.color}}></i>{zone.label}</button>)}
    </nav>}
    {helpOpen && <section className="hud-quick-help" aria-label="How to explore">
      <strong>Explore the portfolio</strong>
      <p>Use two fingers to swipe on a laptop touchpad to walk forward, back or sideways. Use one finger to point and click a project.</p>
      <p>Or select <b>Explore areas</b> to jump directly to a project zone. You can also use WASD or arrow keys.</p>
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
