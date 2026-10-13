import React, { useRef, useState } from 'react';
import { worldZones } from '../content.js';

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

export default function HUD({ paused, setPaused, activeZone, onTravel, ambient, setAmbient, effects, setEffects, quality, setQuality, onAccessible }) {
  const [mapOpen, setMapOpen] = useState(false);
  return <div className="hud">
    <header className="hud-top"><div className="hud-brand"><b>SC</b><span>INTERACTIVE PORTFOLIO</span></div><div className="hud-location"><i></i>{worldZones.find(zone=>zone.id===activeZone)?.label || 'Central plaza'}</div><button onClick={() => setPaused(true)} aria-label="Pause and open settings">II</button></header>
    <div className="reticle" aria-hidden="true"><i></i><i></i></div>
    <div className="hud-help"><span>WASD / ARROWS</span><span>CLICK VIEW TO CAPTURE MOUSE</span><span>ESC / P TO PAUSE</span></div>
    <button className="map-toggle" onClick={() => setMapOpen(value=>!value)} aria-expanded={mapOpen}>World map <span>{mapOpen?'×':'+'}</span></button>
    {mapOpen && <nav className="world-map" aria-label="Travel to exhibition zone">{worldZones.map((zone,index)=><button key={zone.id} className={zone.id===activeZone?'is-active':''} onClick={()=>{onTravel(zone.id);setMapOpen(false)}}><span>0{index+1}</span><i style={{background:zone.color}}></i>{zone.short}</button>)}</nav>}
    <TouchControls />
    {paused && <div className="pause-layer" role="dialog" aria-modal="true" aria-labelledby="pauseTitle">
      <div className="pause-panel"><p>WORLD PAUSED</p><h2 id="pauseTitle">Settings</h2>
        <button className="resume" onClick={()=>setPaused(false)}>Resume exploration <span>→</span></button>
        <label><span>Ambient audio<small>Original procedural soundscape</small></span><input type="checkbox" checked={ambient} onChange={event=>setAmbient(event.target.checked)} /></label>
        <label><span>Interaction sounds<small>Selection and transition cues</small></span><input type="checkbox" checked={effects} onChange={event=>setEffects(event.target.checked)} /></label>
        <label><span>Render quality<small>Lower quality improves mobile performance</small></span><select value={quality} onChange={event=>setQuality(event.target.value)}><option value="high">High</option><option value="low">Performance</option></select></label>
        <button className="accessible-link" onClick={onAccessible}>Switch to accessible portfolio view</button>
      </div>
    </div>}
  </div>;
}
