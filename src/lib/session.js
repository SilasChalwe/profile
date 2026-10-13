// Reload continuity is scoped to the current browser tab.
// A new tab starts at the introduction; refreshing this tab restores its session.
const KEY = 'silas-portfolio-session-v1';
const VERSION = 1;
const MAX_AGE = 8 * 60 * 60 * 1000;

function storage() {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readSession() {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (saved?.version !== VERSION ||
        !Number.isFinite(saved.savedAt) ||
        Date.now() - saved.savedAt > MAX_AGE ||
        saved.savedAt > Date.now() + 60_000) {
      store.removeItem(KEY);
      return null;
    }
    return saved;
  } catch {
    return null;
  }
}

export function readPose() {
  const pose = readSession()?.pose;
  if (!pose || !Array.isArray(pose.position) || pose.position.length !== 3) return null;
  const [x, y, z] = pose.position;
  if (![x,y,z,pose.yaw,pose.pitch].every(Number.isFinite)) return null;
  if (Math.abs(x) > 34 || Math.abs(z) > 34 || Math.abs(y - 2.2) > .1) return null;
  if (Math.abs(pose.yaw) > 1_000 || pose.pitch < -1.491 || pose.pitch > 1.491) return null;
  return { position: [x, 2.2, z], yaw: pose.yaw, pitch: pose.pitch };
}

// Merge patches so game-loop camera snapshots never overwrite UI state,
// or vice versa. This also survives storage being disabled by the browser.
export function saveSession(patch) {
  const store = storage();
  if (!store) return;
  try {
    const previous = readSession() || {};
    store.setItem(KEY, JSON.stringify({
      ...previous,
      ...patch,
      version: VERSION,
      savedAt: Date.now()
    }));
  } catch {
    // Storage may be blocked or full. The portfolio must still work normally.
  }
}

export function clearSession() {
  try { storage()?.removeItem(KEY); } catch { /* ignore */ }
}
