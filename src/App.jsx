import React, { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, Preload } from '@react-three/drei';
import { portfolio, worldZones } from './content.js';
import { portfolioAudio } from './lib/audio.js';
import { readSession, saveSession } from './lib/session.js';
import World from './components/World.jsx';
import IntroScreen from './components/IntroScreen.jsx';
import HUD from './components/HUD.jsx';
import ProjectPanel from './components/ProjectPanel.jsx';
import AccessiblePortfolio from './components/AccessiblePortfolio.jsx';

export default function App() {
  const reduceMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const saved = useMemo(() => readSession(), []);
  const accessibleLink = useMemo(() => window.location.hash.startsWith('#accessible-'), []);

  const [entered, setEntered] = useState(() => saved?.entered === true);
  const [paused, setPaused] = useState(() => saved?.paused === true);
  const [accessible, setAccessible] = useState(() => accessibleLink || saved?.accessible === true || reduceMotion);
  const [selectedProject, setSelectedProject] = useState(() =>
    portfolio.projects.find(item => item.id === saved?.selectedProjectId) || null
  );
  const [activeZone, setActiveZone] = useState(() =>
    worldZones.some(zone => zone.id === saved?.activeZone) ? saved.activeZone : worldZones[0].id
  );

  // Browsers require a fresh user gesture to restart audio after navigation.
  const [ambient, setAmbient] = useState(false);
  const [effects, setEffects] = useState(() => saved?.effects !== false);
  const [quality, setQuality] = useState(() =>
    ['low', 'high'].includes(saved?.quality)
      ? saved.quality
      : window.innerWidth < 760 ? 'low' : 'high'
  );

  useEffect(() => {
    portfolioAudio.effectsEnabled = effects;
  }, [effects]);

  useEffect(() => {
    saveSession({
      entered, paused, accessible, activeZone,
      selectedProjectId: selectedProject?.id || null,
      effects, quality
    });
  }, [entered, paused, accessible, activeZone, selectedProject, effects, quality]);

  // Refreshing a bookmarked accessible section should restore that section.
  useEffect(() => {
    if (!accessible) return;
    const id = window.location.hash.slice(1);
    if (!id.startsWith('accessible-')) return;
    const frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    return () => cancelAnimationFrame(frame);
  }, [accessible]);

  useEffect(() => {
    const onKey = event => {
      if (!entered || accessible || selectedProject ||
          event.target?.closest?.('input,select,textarea,[contenteditable="true"]')) return;
      if (event.key === 'Escape' || event.key.toLowerCase() === 'p') {
        setPaused(value => !value);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [entered, accessible, selectedProject]);

  const enterWorld = withSound => {
    setEntered(true);
    setPaused(false);
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
  const toggleEffects = value => {
    setEffects(value);
    portfolioAudio.effectsEnabled = value;
    if (value) portfolioAudio.play('select');
  };

  const returnToWorld = () => {
    if (window.location.hash.startsWith('#accessible-')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setAccessible(false);
    setEntered(true);
    setPaused(false);
  };

  return <div className="app-shell">
    <IntroScreen visible={!entered && !accessible} onEnter={enterWorld} onAccessible={() => setAccessible(true)} />

    <div className={`world-shell ${entered && !accessible ? 'is-active' : ''}`} aria-hidden={accessible || !entered}>
      <Canvas
        dpr={quality === 'high' ? [1, 1.6] : 1}
        camera={{ position: [0, 2.2, 8], fov: 64, near: .1, far: 160 }}
        gl={{ antialias: quality === 'high', powerPreference: 'high-performance', alpha: false }}
        onCreated={({ gl }) => { gl.domElement.setAttribute('aria-label', 'Interactive 3D portfolio world'); }}
      >
        <World paused={paused || !entered || accessible || Boolean(selectedProject)}
          quality={quality} reduceMotion={reduceMotion} onProject={openProject} onZone={setActiveZone} />
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
        onAccessible={() => { setAccessible(true); setPaused(false); document.exitPointerLock?.(); }}
      />
    </div>

    {selectedProject && <ProjectPanel project={selectedProject} onClose={() => {
      setSelectedProject(null);
      setPaused(false);
    }} />}
    {accessible && <AccessiblePortfolio onWorld={returnToWorld} onProject={project => openProject(project.id)} />}
  </div>;
}
