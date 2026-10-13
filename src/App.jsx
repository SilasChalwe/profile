import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, Preload } from '@react-three/drei';
import { portfolio, worldZones } from './content.js';
import { portfolioAudio } from './lib/audio.js';
import { readSession, saveSession } from './lib/session.js';
import World from './components/World.jsx';
import MediaGallery from './components/MediaGallery.jsx';
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
  const [viewMode, setViewMode] = useState(() => ['move','look','bird'].includes(saved?.viewMode) ? saved.viewMode : 'move');
  const [tour, setTour] = useState({
    status: 'idle', runId: 0, index: 0, total: worldZones.length,
    phase: 'travelling', label: ''
  });

  const [visitedZones, setVisitedZones] = useState(() =>
    Array.isArray(saved?.visitedZones)
      ? saved.visitedZones.filter(id => id === 'plaza' || worldZones.some(zone => zone.id === id)).slice(-20)
      : []
  );
  const [accessible, setAccessible] = useState(() => accessibleLink || saved?.accessible === true || reduceMotion);
  const [previewProjectId, setPreviewProjectId] = useState(null);
  const previewLeaveTimer = useRef(null);
  const [selectedProject, setSelectedProject] = useState(() =>
    portfolio.projects.find(item => item.id === saved?.selectedProjectId) || null
  );
  const [activeZone, setActiveZone] = useState(() =>
    (saved?.activeZone === 'plaza' || worldZones.some(zone => zone.id === saved?.activeZone)) ? saved.activeZone : 'plaza'
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
      entered, paused, accessible, activeZone, visitedZones, viewMode,
      selectedProjectId: selectedProject?.id || null,
      effects, quality
    });
  }, [entered, paused, accessible, activeZone, visitedZones, viewMode, selectedProject, effects, quality]);

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

  const startTour = () => {
    setEntered(true);
    setAccessible(false);
    setPaused(false);
    setSelectedProject(null);
    setPreviewProjectId(null);
    setViewMode('move');
    portfolioAudio.play('enter');
    setTour(previous => ({
      status: 'playing', runId: previous.runId + 1,
      index: 0, total: worldZones.length, phase: 'travelling',
      label: 'Starting at the central plaza'
    }));
  };
  const pauseTour = () => setTour(previous =>
    previous.status === 'playing' ? { ...previous, status: 'paused' } : previous
  );
  const resumeTour = () => {
    setPaused(false);
    setTour(previous =>
      previous.status === 'paused' ? { ...previous, status: 'playing' } : previous
    );
  };
  const stopTour = () => setTour(previous => ({
    ...previous, status: 'idle', index: 0, label: ''
  }));
  const onTourStep = step => {
    setTour(previous => ({ ...previous, ...step }));
    if (step.phase === 'visiting') setActiveZone(step.id);
    if (step.id === 'plaza') setActiveZone('plaza');
  };
  const finishTour = () => {
    setTour(previous => ({ ...previous, status: 'complete', label: 'Tour complete', index: previous.total }));
    setActiveZone('plaza');
  };
  const changeViewMode = mode => {
    stopTour();
    setViewMode(mode);
  };

  const previewProject = projectId => {
    if (previewLeaveTimer.current) clearTimeout(previewLeaveTimer.current);
    previewLeaveTimer.current = null;
    setPreviewProjectId(projectId);
  };
  const schedulePreviewClose = projectId => {
    if (previewLeaveTimer.current) clearTimeout(previewLeaveTimer.current);
    previewLeaveTimer.current = setTimeout(() => {
      setPreviewProjectId(current => current === projectId ? null : current);
    }, 3000);
  };
  useEffect(() => () => {
    if (previewLeaveTimer.current) clearTimeout(previewLeaveTimer.current);
  }, []);

  const openProject = projectId => {
    const project = portfolio.projects.find(item => item.id === projectId);
    if (!project) return;
    portfolioAudio.play('open');
    stopTour();
    setPreviewProjectId(null);
    setSelectedProject(project);
    setPaused(true);
    document.exitPointerLock?.();
  };

  const travel = (zoneId, recordHistory = true) => {
    const isHome = zoneId === 'plaza';
    const zone = worldZones.find(item => item.id === zoneId);
    if (!isHome && !zone) return;
    stopTour();
    if (recordHistory && zoneId !== activeZone) {
      setVisitedZones(history => [...history, activeZone].slice(-20));
    }
    document.exitPointerLock?.();
    portfolioAudio.play('travel');
    setActiveZone(zoneId);
    window.dispatchEvent(new CustomEvent('portfolio:travel', {
      detail: {
        position: isHome ? [0, 0, 0] : zone.position,
        home: isHome,
        yaw: isHome ? 0 : Math.atan2(-zone.position[0], -zone.position[2])
      }
    }));
    setPaused(false);
  };

  const goBack = () => {
    if (!visitedZones.length) return;
    const previous = visitedZones[visitedZones.length - 1];
    setVisitedZones(history => history.slice(0, -1));
    travel(previous, false);
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
    stopTour();
  };

  return <div className="app-shell">
    <IntroScreen visible={!entered && !accessible} onEnter={enterWorld} onTour={startTour} onAccessible={() => setAccessible(true)} />

    <div className={`world-shell ${entered && !accessible ? 'is-active' : ''}`} aria-hidden={accessible || !entered}>
      <Canvas
        dpr={quality === 'high' ? [1, 1.6] : 1}
        camera={{ position: [0, 2.2, 8], fov: 64, near: .1, far: 160 }}
        gl={{ antialias: quality === 'high', powerPreference: 'high-performance', alpha: false }}
        onCreated={({ gl }) => { gl.domElement.setAttribute('aria-label', 'Interactive 3D portfolio world'); }}
      >
        <World viewMode={viewMode} tourStatus={tour.status} tourRunId={tour.runId}
          onTourStep={onTourStep} onTourFinish={finishTour}
          paused={paused || !entered || accessible || Boolean(selectedProject)}
          quality={quality} reduceMotion={reduceMotion} onProject={openProject} onZone={setActiveZone} onPreview={previewProject} onPreviewLeave={schedulePreviewClose} />
        <AdaptiveDpr pixelated />
        <Preload all />
      </Canvas>
      <HUD
        paused={paused}
        setPaused={setPaused}
        activeZone={activeZone}
        viewMode={viewMode}
        setViewMode={changeViewMode}
        tour={tour}
        onStartTour={startTour}
        onPauseTour={pauseTour}
        onResumeTour={resumeTour}
        onStopTour={stopTour}
        onTravel={travel}
        onHome={() => travel('plaza')}
        onBack={goBack}
        canGoBack={visitedZones.length > 0}
        ambient={ambient}
        setAmbient={toggleAmbient}
        effects={effects}
        setEffects={toggleEffects}
        quality={quality}
        setQuality={setQuality}
        onAccessible={() => { setAccessible(true); setPaused(false); document.exitPointerLock?.(); }}
      />
    </div>

    {entered && !accessible && !selectedProject && previewProjectId && (() => {
      const project = portfolio.projects.find(item => item.id === previewProjectId);
      if (!project) return null;
      return <aside className="world-project-preview" aria-label={`${project.title} preview gallery`}>
        <button type="button" className="world-project-preview__close"
          onClick={() => setPreviewProjectId(null)} aria-label="Close project preview">×</button>
        <MediaGallery key={project.id} project={project} compact
          onKeepOpen={() => previewProject(project.id)}
          onLeave={() => schedulePreviewClose(project.id)}
          onOpen={openProject} />
      </aside>;
    })()}
    {selectedProject && <ProjectPanel project={selectedProject} onClose={() => {
      setSelectedProject(null);
      setPaused(false);
    }} />}
    {accessible && <AccessiblePortfolio onWorld={returnToWorld} onProject={project => openProject(project.id)} />}
  </div>;
}
