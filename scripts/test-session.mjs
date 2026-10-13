import assert from 'node:assert/strict';
import { clearSession, readPose, readSession, saveSession } from '../src/lib/session.js';

const entries = new Map();
globalThis.window = {
  sessionStorage: {
    getItem: key => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
    removeItem: key => entries.delete(key)
  }
};

const KEY = 'silas-portfolio-session-v1';

assert.equal(readSession(), null, 'a new tab should start a new session');
saveSession({ entered: true, activeZone: 'design', selectedProjectId: 'gate', effects: false });
saveSession({ pose: { position: [21, 2.2, 13], yaw: .8, pitch: -.2 } });
assert.equal(readSession().entered, true);
assert.equal(readSession().selectedProjectId, 'gate');
assert.equal(readSession().effects, false);
assert.deepEqual(readPose(), { position: [21, 2.2, 13], yaw: .8, pitch: -.2 });

saveSession({ pose: { position: [150, 2.2, 13], yaw: 0, pitch: 0 } });
assert.equal(readPose(), null, 'invalid camera positions must not be resumed');

entries.set(KEY, 'invalid JSON');
assert.equal(readSession(), null, 'corrupted session data must not crash the portfolio');
saveSession({ entered: true });
clearSession();
assert.equal(readSession(), null, 'a session can be intentionally cleared');

console.log('Portfolio refresh/session recovery tests passed.');
