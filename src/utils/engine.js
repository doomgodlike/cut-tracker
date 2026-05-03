/*
  ADAPTIVE RECALIBRATION ENGINE v3
  
  Per-machine progression profiles.
  First 3 sessions = calibration (no auto-adjustment).
  From session 4+, engine recalibrates based on performance:
  
  BEAT (hit top of rep range on all sets):
    → Next: +2.5kg (upper) or +5kg (lower), reset to bottom of rep range
  MET (hit target reps on all sets):
    → Next: same weight, +1 rep target
  CLOSE (1 rep short on average):
    → Next: hold same target
  MISSED (2+ reps short on average):
    → Next: deload -10%, rebuild from bottom of rep range
  
  Rolling 3-session average prevents single bad day from triggering deload.
*/

// ── REP RANGES ──
export function parseRepRange(str) {
  if (!str) return { low: 8, high: 12 };
  const m = str.match(/(\d+)\s*[-–x×]\s*(\d+)/);
  if (m) return { low: +m[1], high: +m[2] };
  const s = str.match(/(\d+)/);
  return s ? { low: +s[1], high: +s[1] + 4 } : { low: 8, high: 12 };
}

// ── GET BASELINE FOR AN EXERCISE ──
export function getBaseline(data, exName) {
  return data.baselines?.[exName] || null;
}

// ── SET / UPDATE BASELINE ──
export function setBaseline(data, exName, baseline) {
  return {
    ...data,
    baselines: { ...data.baselines, [exName]: baseline },
  };
}

// ── CALC NEXT TARGET (the core engine) ──
export function calcNextTarget(data, exName, repRange, isLower = false) {
  const bl = getBaseline(data, exName);
  
  // No baseline yet → blank (Day 1 calibration)
  if (!bl) {
    return {
      type: 'first',
      weight: null,
      reps: null,
      sets: 3,
      msg: 'First session — enter your working weight and reps. This calibrates the engine.',
      color: 'blue',
      calibrating: true,
    };
  }
  
  const sessions = bl.sessions || [];
  const range = parseRepRange(repRange);
  
  // Still calibrating (< 3 sessions logged)
  if (sessions.length < 3) {
    return {
      type: 'calibrating',
      weight: bl.w,
      reps: bl.r || range.low,
      sets: 3,
      msg: `Calibrating (${sessions.length}/3). Log naturally — engine activates after 3 sessions.`,
      color: 'blue',
      calibrating: true,
    };
  }
  
  // Engine active — look at last 3 sessions
  const last3 = sessions.slice(-3);
  const lastSession = sessions[sessions.length - 1];
  const targetW = bl.w;
  const targetR = bl.r || range.low;
  
  // Calculate average performance across last 3 sessions
  const avgReps = Math.round(last3.reduce((s, sess) => {
    const setAvg = sess.sets.reduce((a, st) => a + (st.r || 0), 0) / (sess.sets.length || 1);
    return s + setAvg;
  }, 0) / last3.length);
  
  const weightInc = isLower ? 5 : 2.5;
  
  // BEAT: avg reps >= top of range
  if (avgReps >= range.high) {
    return {
      type: 'progress',
      weight: targetW + weightInc,
      reps: range.low,
      sets: 3,
      msg: `Level up! ${targetW + weightInc}kg × ${range.low} reps. You've been hitting ${avgReps} avg — time to add weight.`,
      color: 'green',
      calibrating: false,
    };
  }
  
  // MET: avg reps >= target reps
  if (avgReps >= targetR) {
    const newReps = Math.min(targetR + 1, range.high);
    return {
      type: newReps > targetR ? 'push' : 'hold',
      weight: targetW,
      reps: newReps,
      sets: 3,
      msg: newReps > targetR
        ? `Push for ${newReps} reps at ${targetW}kg. You're hitting target — add a rep.`
        : `Hold at ${targetW}kg × ${targetR}. Nailing it — keep pushing for ${range.high} to level up.`,
      color: newReps > targetR ? 'amber' : 'blue',
      calibrating: false,
    };
  }
  
  // CLOSE: within 1 rep
  if (avgReps >= targetR - 1) {
    return {
      type: 'hold',
      weight: targetW,
      reps: targetR,
      sets: 3,
      msg: `Hold at ${targetW}kg × ${targetR}. Almost there — averaging ${avgReps} reps.`,
      color: 'blue',
      calibrating: false,
    };
  }
  
  // MISSED: 2+ reps short
  const deloadW = Math.round(targetW * 0.9 / 2.5) * 2.5; // round to nearest 2.5
  return {
    type: 'deload',
    weight: Math.max(deloadW, 5),
    reps: range.low,
    sets: 3,
    msg: `Deload to ${deloadW}kg × ${range.low}. Averaging ${avgReps} reps — rebuild from here.`,
    color: 'red',
    calibrating: false,
  };
}

// ── LOG A SET AND UPDATE BASELINE ──
export function logExerciseSession(data, exName, sets, repRange, isLower = false) {
  const bl = getBaseline(data, exName) || { w: 0, r: 0, sessions: [], calibrating: true };
  
  // Get the weight used (max across sets)
  const maxW = Math.max(...sets.map(s => parseFloat(s.w) || 0));
  const avgR = Math.round(sets.reduce((a, s) => a + (parseInt(s.r) || 0), 0) / (sets.length || 1));
  
  const newSession = { date: new Date().toISOString().slice(0, 10), sets: sets.map(s => ({ w: +s.w || 0, r: +s.r || 0 })) };
  const sessions = [...(bl.sessions || []), newSession];
  const range = parseRepRange(repRange);
  
  // Update baseline weight/reps target based on engine
  let newW = maxW || bl.w;
  let newR = avgR >= range.high ? range.low : Math.min(avgR + 1, range.high);
  
  // If still calibrating, just track
  if (sessions.length <= 3) {
    newW = maxW || bl.w;
    newR = bl.r || range.low;
  } else {
    // Recalibrate based on performance
    const last3 = sessions.slice(-3);
    const last3Avg = Math.round(last3.reduce((s, sess) => {
      const sa = sess.sets.reduce((a, st) => a + (st.r || 0), 0) / (sess.sets.length || 1);
      return s + sa;
    }, 0) / last3.length);
    
    const weightInc = isLower ? 5 : 2.5;
    
    if (last3Avg >= range.high) {
      newW = (bl.w || maxW) + weightInc;
      newR = range.low;
    } else if (last3Avg >= (bl.r || range.low)) {
      newW = bl.w || maxW;
      newR = Math.min((bl.r || range.low) + 1, range.high);
    } else if (last3Avg >= (bl.r || range.low) - 1) {
      newW = bl.w || maxW;
      newR = bl.r || range.low;
    } else {
      newW = Math.max(Math.round((bl.w || maxW) * 0.9 / 2.5) * 2.5, 5);
      newR = range.low;
    }
  }
  
  const newBl = { w: newW, r: newR, sessions, calibrating: sessions.length < 3 };
  return setBaseline(data, exName, newBl);
}

// ── RESET BASELINE (preserves history) ──
export function resetBaseline(data, exName) {
  const bl = getBaseline(data, exName);
  const hist = {
    exercise: exName,
    resetAt: new Date().toISOString(),
    previousBaseline: bl,
  };
  return {
    ...data,
    baselines: { ...data.baselines, [exName]: null },
    resetHistory: [...(data.resetHistory || []), hist],
  };
}

// ── RESET ALL BASELINES ──
export function resetAllBaselines(data) {
  const hist = {
    type: 'full_reset',
    resetAt: new Date().toISOString(),
    previousBaselines: { ...data.baselines },
  };
  return {
    ...data,
    baselines: {},
    cardioBaseline: null,
    resetHistory: [...(data.resetHistory || []), hist],
  };
}

// ══════════ CARDIO ENGINE ══════════

/*
  Unified cardio: pre-LISS (weight days) + flex standalone sessions.
  All count toward 2km goal.
  
  Pre-LISS progression (must not exhaust):
  - Duration: 12 → 20 min (slow)
  - Incline: 10% → 15% (slow)
  - Speed: stays 4.5-5.0 km/h
  
  Flex/standalone progression (where real progress happens):
  - Duration: 20 → 35 min
  - Speed: 4.5 → 7+ km/h
  - Introduces jog intervals, then sustained jog, then 2km run
  
  Phases (40 milestone sessions on flex days):
  1-15: Base walk (build aerobic base, increase duration)
  16-25: Walk/jog (30s-1min jog intervals)
  26-35: Sustained jog (2-5 min jog blocks)
  36-40: 2km continuous run attempts
*/

const CARDIO_PHASES = [
  { name: 'Base walk', sessions: 15, item: 'boots', color: '#4a8fcc', desc: 'Build aerobic base' },
  { name: 'Walk / jog', sessions: 10, item: 'phase_boots', color: '#c49030', desc: 'Introduce jog intervals' },
  { name: 'Sustained jog', sessions: 10, item: 'travel_boots', color: '#8866aa', desc: 'Longer jog blocks' },
  { name: '2km target', sessions: 5, item: 'overwhelming_blink', color: '#c8a84e', desc: 'Run 2km continuous' },
];

export { CARDIO_PHASES };

export function calcNextCardio(logs, type = 'pre') {
  const count = logs.length;
  
  if (type === 'pre') {
    // Pre-LISS: gentle progression
    const baseDur = 12;
    const maxDur = 20;
    const baseIncline = 10;
    const maxIncline = 15;
    const speed = 4.5;
    
    // Progress every 5 sessions
    const step = Math.floor(count / 5);
    const dur = Math.min(baseDur + step * 2, maxDur);
    const incline = Math.min(baseIncline + step, maxIncline);
    
    return {
      type: 'pre',
      duration: dur,
      incline,
      speed,
      label: `Incline walk — ${dur} min`,
      detail: `${incline}% incline, ${speed} km/h`,
      instruction: `Treadmill ${incline}% at ${speed} km/h for ${dur} min. Warm-up pace — don't gas out before weights.`,
    };
  }
  
  // Flex/standalone sessions — this is where the 2km progression happens
  const flexLogs = logs.filter(l => l.type === 'flex' || l.type === 'standalone');
  const fc = flexLogs.length;
  
  // Phase detection
  let phase = 0, sessionInPhase = fc;
  let cumulative = 0;
  for (let i = 0; i < CARDIO_PHASES.length; i++) {
    if (fc < cumulative + CARDIO_PHASES[i].sessions) {
      phase = i;
      sessionInPhase = fc - cumulative;
      break;
    }
    cumulative += CARDIO_PHASES[i].sessions;
    if (i === CARDIO_PHASES.length - 1) { phase = i; sessionInPhase = fc - cumulative; }
  }
  
  const p = CARDIO_PHASES[phase];
  
  if (phase === 0) {
    // Base walk
    const dur = 20 + Math.floor(sessionInPhase / 3) * 2; // 20 → 30 min
    const spd = 4.5 + Math.floor(sessionInPhase / 5) * 0.3; // 4.5 → 5.4
    const inc = 10 + Math.floor(sessionInPhase / 5);
    return {
      type: 'flex', phase: 0, phaseInfo: p, sessionInPhase, totalFlex: fc,
      duration: Math.min(dur, 30), incline: Math.min(inc, 15), speed: Math.round(spd * 10) / 10,
      jogTime: 0,
      label: `Walk — ${Math.min(dur, 30)} min`,
      detail: `${Math.min(inc, 15)}% incline, ${Math.round(spd * 10) / 10} km/h`,
      instruction: `Treadmill at ${Math.min(inc, 15)}% and ${Math.round(spd * 10) / 10} km/h for ${Math.min(dur, 30)} min. Steady pace, deep breathing.`,
    };
  }
  
  if (phase === 1) {
    // Walk/jog intervals
    const jogSecs = 30 + sessionInPhase * 15; // 30s → 2.5min jog intervals
    const dur = 25 + Math.floor(sessionInPhase / 3) * 2;
    return {
      type: 'flex', phase: 1, phaseInfo: p, sessionInPhase, totalFlex: fc,
      duration: Math.min(dur, 32), incline: 5, speed: 6.0, jogTime: jogSecs,
      label: `Walk/jog — ${Math.min(dur, 32)} min`,
      detail: `${Math.round(jogSecs / 60 * 10) / 10} min jog intervals at 6 km/h`,
      instruction: `Walk 3 min at 5 km/h, jog ${Math.round(jogSecs / 60 * 10) / 10} min at 6 km/h. Repeat for ${Math.min(dur, 32)} min total.`,
    };
  }
  
  if (phase === 2) {
    // Sustained jog
    const jogMins = 2 + sessionInPhase * 0.5; // 2 → 7 min blocks
    const dur = 28 + Math.floor(sessionInPhase / 3);
    const spd = 6.5 + sessionInPhase * 0.1;
    return {
      type: 'flex', phase: 2, phaseInfo: p, sessionInPhase, totalFlex: fc,
      duration: Math.min(dur, 35), incline: 3, speed: Math.round(spd * 10) / 10, jogTime: jogMins * 60,
      label: `Sustained jog — ${Math.min(dur, 35)} min`,
      detail: `${Math.round(jogMins * 10) / 10} min jog blocks at ${Math.round(spd * 10) / 10} km/h`,
      instruction: `Jog ${Math.round(jogMins * 10) / 10} min at ${Math.round(spd * 10) / 10} km/h, walk 2 min recovery. Repeat for ${Math.min(dur, 35)} min.`,
    };
  }
  
  // 2km target
  const spd = 7.5 + sessionInPhase * 0.2;
  return {
    type: 'flex', phase: 3, phaseInfo: p, sessionInPhase, totalFlex: fc,
    duration: 20, incline: 1, speed: Math.round(spd * 10) / 10, jogTime: 1200,
    label: '2km attempt',
    detail: `Target: 2km continuous at ${Math.round(spd * 10) / 10} km/h`,
    instruction: `Run 2km without stopping at ${Math.round(spd * 10) / 10} km/h. Walk cooldown after. You've got this.`,
  };
}

// ── NEXT 3 DAYS ──
export function getCardioLookahead(logs) {
  const today = calcNextCardio(logs, 'pre');
  const todayFlex = calcNextCardio(logs, 'flex');
  
  // Simulate +1 session for tomorrow
  const fakeLogs1 = [...logs, { type: 'pre', date: 'sim' }];
  const tomorrow = calcNextCardio(fakeLogs1, 'pre');
  
  // Simulate +2 for day after (flex day)
  const fakeLogs2 = [...fakeLogs1, { type: 'pre', date: 'sim' }];
  const dayAfterFlex = calcNextCardio(fakeLogs2, 'flex');
  
  return { today, todayFlex, tomorrow, dayAfterFlex };
}

// ── CARDIO PHASE PROGRESS ──
export function getCardioProgress(logs) {
  const flexLogs = logs.filter(l => l.type === 'flex' || l.type === 'standalone');
  const fc = flexLogs.length;
  
  let cumulative = 0;
  return CARDIO_PHASES.map((p, i) => {
    const done = Math.max(0, Math.min(fc - cumulative, p.sessions));
    cumulative += p.sessions;
    return { ...p, done, total: p.sessions };
  });
}

// ── PULL-UP PROGRESSION ──
export function getPullupTarget(currentMax) {
  if (!currentMax || currentMax < 5) return { target: 5, msg: 'Build to 5 clean pull-ups' };
  if (currentMax < 8) return { target: currentMax + 1, msg: `Push for ${currentMax + 1} reps. Add 1 each week.` };
  if (currentMax < 12) return { target: currentMax + 1, msg: `${currentMax + 1} reps. Getting close to muscle-up range.` };
  if (currentMax < 15) return { target: 15, msg: 'Build to 15 for muscle-up prerequisite.' };
  return { target: currentMax, msg: 'Muscle-up ready. Start practicing the transition.' };
}

// ══════════ CALORIE BURN CALCULATOR ══════════
/*
  MET values for treadmill walking/jogging:
  Walking 4.0 km/h flat = 3.0 MET
  Walking 5.0 km/h flat = 3.5 MET
  Walking 5.0 km/h 5% incline = 5.0 MET
  Walking 5.0 km/h 10% incline = 6.5 MET
  Walking 5.0 km/h 15% incline = 8.0 MET
  Jogging 6.0 km/h = 6.0 MET
  Jogging 7.0 km/h = 7.0 MET
  Running 8.0 km/h = 8.3 MET
  
  Formula: calories = MET × weight_kg × duration_hours
  Incline adds ~0.3 MET per 1% grade above flat
*/
export function calcCaloriesBurned(durationMin, speedKmh, inclinePct, weightKg = 69) {
  // Base MET from speed
  let met;
  if (speedKmh <= 4.0) met = 2.8;
  else if (speedKmh <= 5.0) met = 3.3;
  else if (speedKmh <= 5.5) met = 3.8;
  else if (speedKmh <= 6.5) met = 5.5;
  else if (speedKmh <= 7.5) met = 7.0;
  else if (speedKmh <= 8.5) met = 8.3;
  else met = 9.5;
  
  // Incline bonus: ~0.3 MET per 1% grade
  met += (inclinePct || 0) * 0.3;
  
  const hours = durationMin / 60;
  return Math.round(met * weightKg * hours);
}
