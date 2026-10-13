// Pure route and camera-pose helpers for the optional guided portfolio tour.
// All stops are derived from editable zone data; adding a zone extends the tour.
export const TOUR_EYE_HEIGHT = 2.2;
export const TOUR_VISIT_SECONDS = 4.5;
export const TOUR_SPEED = 4.2; // world units / second

export function shortestAngle(from, to) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

export function smoothStep(value) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

export function createTourStops(zones = []) {
  const home = { id: 'plaza', label: 'Central plaza', position: [0, TOUR_EYE_HEIGHT, 8], yaw: 0, pitch: -.08 };
  const exhibitions = zones.map(zone => {
    const [x,,z] = zone.position;
    const yaw = Math.atan2(-x, -z); // exhibitions face the center of the world
    return {
      id: zone.id,
      label: zone.label,
      position: [
        Math.max(-34, Math.min(34, x + Math.sin(yaw) * 8)),
        TOUR_EYE_HEIGHT,
        Math.max(-34, Math.min(34, z + Math.cos(yaw) * 8))
      ],
      yaw,
      pitch: -.075
    };
  });
  return [home, ...exhibitions, { ...home, id: 'finish', label: 'Tour complete' }];
}

export function tourTravelDuration(from, to) {
  const distance = Math.hypot(to.position[0] - from.position[0], to.position[2] - from.position[2]);
  return Math.max(4.5, Math.min(11, distance / TOUR_SPEED));
}

export function interpolateTourPose(from, to, progress) {
  const t = smoothStep(progress);
  return {
    position: from.position.map((value, index) => value + (to.position[index] - value) * t),
    yaw: from.yaw + shortestAngle(from.yaw, to.yaw) * t,
    pitch: from.pitch + (to.pitch - from.pitch) * t
  };
}
