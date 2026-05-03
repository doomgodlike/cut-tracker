const KEY = 'cut_v4';
const OLD_KEY = 'cut_v3';

const EMPTY = {
  wo: [],       // workout logs
  cl: [],       // cardio logs (unified: pre-liss + flex)
  bd: [],       // body metrics (weight, measurements)
  xp: 0,
  xpLog: [],
  achievements: [],
  baselines: {}, // per-exercise baselines: { "Smith Incline Press": { w: 20, r: 8, calibrating: true, sessions: [] } }
  cardioBaseline: null, // { duration: 15, incline: 10, speed: 4.5, calibrating: true, sessions: [] }
  pullupCount: 0, // current max pull-ups
  resetHistory: [], // timestamps of baseline resets
};

export function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d) return { ...EMPTY, ...d };
    // migrate from v3
    const old = JSON.parse(localStorage.getItem(OLD_KEY));
    if (old) return { ...EMPTY, ...old };
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function save(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}

export function today() { return new Date().toISOString().slice(0, 10); }
export function timeNow() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}
export function dayName(d) {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(d + 'T12:00:00').getDay()];
}
export function weekDates() {
  const d = new Date(), dy = d.getDay(), m = new Date(d);
  m.setDate(d.getDate() - ((dy + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(m); x.setDate(m.getDate() + i);
    return x.toISOString().slice(0, 10);
  });
}
