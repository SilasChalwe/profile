import React, { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, Preload } from '@react-three/drei';
import { portfolio, worldZones } from './content.js';
import { portfolioAudio } from './lib/audio.js';
import World from './components/World.jsx';
import IntroScreen from './components/IntroScreen.jsx';
import HUD from './components/HUD.jsx';
import ProjectPanel from './components/ProjectPanel.jsx';
import AccessiblePortfolio from './components/AccessiblePortfolio.jsx';

export default function App() {
  const reduceMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const [entered, setEntered] = useState(false);
  const [paused, setPaused] = useState(false);
  const [accessible, setAccessible] = useState(reduceMotion);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeZone, setActiveZone] = useState(worldZones[0].id);
  const [ambient, setAmbient] = useState(false);
  const [effects, setEffects] = useState(true);
  const [quality, setQuality] = useState(window.innerWidth < 760 ? 'low' : 'high');

  useEffect(() => {
    const onKey = event => {
      if (event.key === 'Escape' && entered && !selectedProject) setPaused(value => !value);
      if (event.key.toLowerCase() === 'p' && entered && !selectedProject) setPaused(value => !value);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [entered, selectedProject]);

  const enterWorld = withSound => {
    setEntered(true);
    setAmbient(withSound);
    if (withSound) portfolioAudio.setAmbient(true);
    portfolioAudio.effectsEnabled = effects;
    portfolioAudio.play('enter');
  };

  const openProject = projectId => {
    const project = portfolio.projects.find(item => item.id === projectId);
    if (!project) return;
    portfolioAudio.play('open');
    setSelectedProject(project);
    setPaused(true);
    document.exitPointerLock?.();
  };

  const travel = zoneId => {
    const zone = worldZones.find(item => item.id === zoneId);
    if (!zone) return;
    portfolioAudio.play('travel');
    setActiveZone(zoneId);
    window.dispatchEvent(new CustomEvent('portfolio:travel', { detail: { position: zone.position } }));
    setPaused(false);
  };

  const toggleAmbient = value => { setAmbient(value); portfolioAudio.setAmbient(value); };
  const toggleEffects = value => { setEffects(value); portfolioAudio.effectsEnabled = value; if (value) portfolioAudio.play('select'); };

  return <div className="app-shell">
    <IntroScreen visible={!entered && !accessible} onEnter={enterWorld} onAccessible={() => setAccessible(true)} />

    <div className={`world-shell ${entered && !accessible ? 'is-active' : ''}`} aria-hidden={accessible || !entered}>
      <Canvas
        dpr={quality === 'high' ? [1, 1.6] : 1}
        camera={{ position: [0, 2.2, 8], fov: 64, near: .1, far: 160 }}
        gl={{ antialias: quality === 'high', powerPreference: 'high-performance', alpha: false }}
        onCreated={({ gl }) => { gl.domElement.setAttribute('aria-label', 'Interactive 3D portfolio world'); }}
      >
        <World paused={paused || !entered} quality={quality} reduceMotion={reduceMotion} onProject={openProject} onZone={setActiveZone} />
        <AdaptiveDpr pixelated />
        <Preload all />
      </Canvas>
      <HUD
        paused={paused}
        setPaused={setPaused}
        activeZone={activeZone}
        onTravel={travel}
        ambient={ambient}
        setAmbient={toggleAmbient}
        effects={effects}
        setEffects={toggleEffects}
        quality={quality}
        setQuality={setQuality}
        onAccessible={() => { setAccessible(true); document.exitPointerLock?.(); }}
      />
    </div>

    {selectedProject && <ProjectPanel project={selectedProject} onClose={() => { setSelectedProject(null); setPaused(false); }} />}
    {accessible && <AccessiblePortfolio onWorld={() => { setAccessible(false); setEntered(true); }} onProject={project => setSelectedProject(project)} />}
  </div>;
}
