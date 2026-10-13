import React, { useState } from 'react';

export default function IntroScreen({ visible, onEnter, onTour, onAccessible }) {
  const [sound, setSound] = useState(false);
  if (!visible) return null;
  return <main className="entry-screen">
    <div className="entry-grid" aria-hidden="true"></div>
    <header className="entry-header"><span>SC / PORTFOLIO V2</span><span>ZAMBIA · 2026</span></header>
    <div className="entry-orbit" aria-hidden="true"><i></i><i></i><i></i><b>SC</b></div>
    <section className="entry-copy">
      <p>COMPUTER ENGINEER · SOFTWARE ENGINEER · UI/UX DESIGNER</p>
      <h1><span>SILAS</span><span>CHALWE</span></h1>
      <p className="entry-copy__lede">Enter a navigable exhibition of systems, interfaces and engineering work.</p>
      <div className="entry-actions">
        <button className="primary-action" onClick={() => onEnter(sound)}>Enter world <span>→</span></button>
        <button className="tour-entry-action" type="button" onClick={onTour}>▶ Start guided tour</button>
        <button className={`sound-choice ${sound ? 'is-on' : ''}`} onClick={() => setSound(value => !value)} aria-pressed={sound}>Ambient sound: {sound ? 'on' : 'off'}</button>
        <button className="text-button" onClick={onAccessible}>Open accessible portfolio</button>
      </div>
    </section>
    <div className="entry-help"><span>2 FINGERS TO MOVE OR LOOK 360°</span><span>1 FINGER TO POINT & CLICK</span><span>SWITCH TO BIRD'S-EYE FOR AN OVERHEAD VIEW</span></div>
  </main>;
}
