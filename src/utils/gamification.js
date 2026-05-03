/*
  GAMIFICATION ENGINE — DOTA-INSPIRED PROGRESSION
  
  XP SOURCES:
  - Workout completed:     100 XP base
  - Beat coach target:     +50 XP per exercise where you hit green (progress)
  - Streak bonus:          +25 XP per consecutive training day in streak
  - PR (personal record):  +200 XP
  - Cardio completed:      75 XP
  - Body metric logged:    25 XP
  
  RANKS (Dota MMR style):
  Herald → Guardian → Crusader → Archon → Legend → Ancient → Divine → Immortal
  Each rank has 5 stars. Composite score:
  - 40% consistency (streak / attendance)
  - 30% total sessions
  - 30% PR count
  
  LEVEL SYSTEM:
  XP thresholds scale: Level N needs N*150 XP
  Level 1 = 150, Level 2 = 300, Level 3 = 450...
  Titles change every 5 levels.
*/

// ── RANK DEFINITIONS ──
export const RANKS = [
  { name: 'Herald',   tier: 1, color: '#78716c', icon: '🛡️', minScore: 0 },
  { name: 'Guardian', tier: 2, color: '#a8a29e', icon: '⚔️', minScore: 100 },
  { name: 'Crusader', tier: 3, color: '#22c55e', icon: '🗡️', minScore: 250 },
  { name: 'Archon',   tier: 4, color: '#3b82f6', icon: '🔷', minScore: 500 },
  { name: 'Legend',    tier: 5, color: '#a855f7', icon: '💎', minScore: 850 },
  { name: 'Ancient',   tier: 6, color: '#f59e0b', icon: '👑', minScore: 1300 },
  { name: 'Divine',    tier: 7, color: '#ef4444', icon: '🔥', minScore: 2000 },
  { name: 'Immortal',  tier: 8, color: '#fbbf24', icon: '⭐', minScore: 3000 },
];

// ── LEVEL TITLES ──
const TITLES = [
  { lvl: 1,  title: 'Recruit' },
  { lvl: 5,  title: 'Trainee' },
  { lvl: 10, title: 'Warrior' },
  { lvl: 15, title: 'Veteran' },
  { lvl: 20, title: 'Elite' },
  { lvl: 25, title: 'Champion' },
  { lvl: 30, title: 'Warlord' },
  { lvl: 40, title: 'Titan' },
  { lvl: 50, title: 'Immortal' },
];

// ── ACHIEVEMENTS ──
// `item` = Dota 2 CDN item filename for the icon image
export const ACHIEVEMENT_DEFS = [
  // Session milestones
  { id: 'first_blood',    name: 'First Blood',       desc: 'Complete your first workout',           item: 'quelling_blade',     check: s => s.totalSessions >= 1 },
  { id: 'ten_sessions',   name: 'Double Kill',       desc: 'Complete 10 workouts',                  item: 'broadsword',         check: s => s.totalSessions >= 10 },
  { id: 'twenty_five',    name: 'Killing Spree',     desc: 'Complete 25 workouts',                  item: 'claymore',           check: s => s.totalSessions >= 25 },
  { id: 'fifty_sessions', name: 'Rampage',           desc: 'Complete 50 workouts',                  item: 'demon_edge',         check: s => s.totalSessions >= 50 },
  { id: 'hundred',        name: 'Godlike',           desc: 'Complete 100 workouts',                 item: 'rapier',             check: s => s.totalSessions >= 100 },
  
  // Streak milestones
  { id: 'streak_3',       name: 'Win Streak',        desc: '3 workouts in a row',                   item: 'bracer',             check: s => s.bestStreak >= 3 },
  { id: 'streak_7',       name: 'Unstoppable',       desc: '7-day training streak',                 item: 'sange',              check: s => s.bestStreak >= 7 },
  { id: 'streak_14',      name: 'Beyond Godlike',    desc: '14-day training streak',                item: 'satanic',            check: s => s.bestStreak >= 14 },
  
  // PR milestones
  { id: 'first_pr',       name: 'Power Treads',      desc: 'Hit your first PR',                     item: 'power_treads',       check: s => s.totalPRs >= 1 },
  { id: 'five_prs',       name: 'Battle Fury',       desc: 'Hit 5 PRs',                             item: 'bfury',              check: s => s.totalPRs >= 5 },
  { id: 'ten_prs',        name: 'Divine Rapier',     desc: 'Hit 10 PRs',                            item: 'rapier',             check: s => s.totalPRs >= 10 },
  
  // Cardio milestones
  { id: 'first_cardio',   name: 'Phase Boots',       desc: 'Complete first cardio session',          item: 'phase_boots',        check: s => s.totalCardio >= 1 },
  { id: 'first_jog',      name: 'Blink Dagger',      desc: 'First walk/jog interval',               item: 'blink',              check: s => s.totalCardio >= 12 },
  { id: 'two_km',         name: 'Force Staff',       desc: 'Attempt the 2km run',                   item: 'force_staff',        check: s => s.totalCardio >= 36 },
  
  // Body tracking
  { id: 'first_weigh',    name: 'Observer Ward',     desc: 'Log your first body metric',            item: 'ward_observer',      check: s => s.totalMetrics >= 1 },
  { id: 'consistent_log', name: 'Sentry Ward',       desc: 'Log 10 body metrics',                   item: 'ward_sentry',        check: s => s.totalMetrics >= 10 },
  
  // Compound milestones
  { id: 'bench_bw',       name: 'Desolator',         desc: 'Bench press your bodyweight',            item: 'desolator',          check: s => s.benchMax >= (s.bodyWeight || 999) },
  { id: 'squat_bw',       name: 'Heart of Tarrasque', desc: 'Squat your bodyweight',                item: 'heart',              check: s => s.squatMax >= (s.bodyWeight || 999) },
];

// ── XP CALCULATION ──
export function calcXPForWorkout(workout, coachTargets) {
  let xp = 100; // base
  let breakdown = [{ src: 'Workout', xp: 100 }];
  
  // Check each exercise against coach target
  if (workout.ex && coachTargets) {
    workout.ex.forEach(ex => {
      const target = coachTargets[ex.nm];
      if (target && target.type === 'progress') {
        xp += 50;
        breakdown.push({ src: `${ex.nm.split(' ')[0]} ↑`, xp: 50 });
      }
    });
  }
  
  return { xp, breakdown };
}

// ── STREAK CALCULATION ──
export function calcStreak(workouts) {
  if (!workouts || workouts.length === 0) return { current: 0, best: 0 };
  
  const dates = [...new Set(workouts.map(w => w.date))].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  
  // Current streak: count consecutive days working back from today/yesterday
  let current = 0;
  let checkDate = new Date(today + 'T12:00:00');
  
  // Allow 1 day gap (rest day doesn't break streak, 2 days off does)
  let gapUsed = false;
  for (let i = 0; i < dates.length; i++) {
    const d = dates[i];
    const diff = Math.round((checkDate - new Date(d + 'T12:00:00')) / 86400000);
    
    if (diff <= 0) {
      current++;
      checkDate = new Date(d + 'T12:00:00');
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (diff === 1 && !gapUsed) {
      // Allow one rest day gap
      gapUsed = true;
      current++;
      checkDate = new Date(d + 'T12:00:00');
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  // Best streak (simple: longest consecutive unique dates with max 1 gap)
  let best = current;
  let tempStreak = 1;
  let tempGap = false;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1] + 'T12:00:00');
    const curr = new Date(dates[i] + 'T12:00:00');
    const diff = Math.round((prev - curr) / 86400000);
    
    if (diff <= 1) {
      tempStreak++;
    } else if (diff === 2 && !tempGap) {
      tempGap = true;
      tempStreak++;
    } else {
      best = Math.max(best, tempStreak);
      tempStreak = 1;
      tempGap = false;
    }
  }
  best = Math.max(best, tempStreak);
  
  return { current, best };
}

// ── PR DETECTION ──
export function detectPRs(workouts) {
  const prs = {}; // exerciseName -> { weight, reps, date }
  const prEvents = []; // chronological PR events
  
  // Go oldest to newest
  const sorted = [...(workouts || [])].reverse();
  sorted.forEach(w => {
    (w.ex || []).forEach(ex => {
      const bestSet = ex.sets.reduce((a, c) => {
        const wt = parseFloat(c.w) || 0;
        const rp = parseInt(c.r) || 0;
        if (wt > (parseFloat(a.w) || 0)) return c;
        if (wt === (parseFloat(a.w) || 0) && rp > (parseInt(a.r) || 0)) return c;
        return a;
      }, { w: '0', r: '0' });
      
      const wt = parseFloat(bestSet.w) || 0;
      const rp = parseInt(bestSet.r) || 0;
      if (wt <= 0) return;
      
      const prev = prs[ex.nm];
      if (!prev || wt > prev.weight || (wt === prev.weight && rp > prev.reps)) {
        if (prev) { // Only count as PR event if there was a previous record
          prEvents.push({ exercise: ex.nm, weight: wt, reps: rp, date: w.date, prev: { ...prev } });
        }
        prs[ex.nm] = { weight: wt, reps: rp, date: w.date };
      }
    });
  });
  
  return { prs, prEvents };
}

// ── LEVEL FROM XP ──
export function levelFromXP(totalXP) {
  let level = 0;
  let xpNeeded = 0;
  let xpConsumed = 0;
  
  while (true) {
    const nextReq = (level + 1) * 150;
    if (xpConsumed + nextReq > totalXP) {
      xpNeeded = nextReq;
      break;
    }
    xpConsumed += nextReq;
    level++;
  }
  
  const xpIntoLevel = totalXP - xpConsumed;
  const progress = xpNeeded > 0 ? xpIntoLevel / xpNeeded : 0;
  
  // Get title
  let title = 'Novice';
  for (const t of TITLES) {
    if (level >= t.lvl) title = t.title;
  }
  
  return { level, title, xpIntoLevel, xpNeeded, progress, totalXP };
}

// ── RANK FROM STATS ──
export function calcRank(stats) {
  const { totalSessions, bestStreak, totalPRs, currentStreak } = stats;
  
  // Composite score
  const consistencyScore = (currentStreak * 8) + (bestStreak * 4); // 40% weight
  const sessionScore = totalSessions * 3; // 30% weight  
  const prScore = totalPRs * 15; // 30% weight
  
  const composite = consistencyScore + sessionScore + prScore;
  
  let rank = RANKS[0];
  let stars = 1;
  
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (composite >= RANKS[i].minScore) {
      rank = RANKS[i];
      // Calculate stars within rank (1-5)
      const nextMin = RANKS[i + 1]?.minScore || rank.minScore * 2;
      const range = nextMin - rank.minScore;
      const progress = composite - rank.minScore;
      stars = Math.min(5, Math.max(1, Math.ceil((progress / range) * 5)));
      break;
    }
  }
  
  return { rank, stars, composite };
}

// ── FULL STATS AGGREGATOR ──
export function calcFullStats(data) {
  const workouts = data.wo || [];
  const cardioLogs = data.cl || [];
  const bodyMetrics = data.bd || [];
  
  const totalSessions = workouts.length;
  const totalCardio = cardioLogs.length;
  const totalMetrics = bodyMetrics.length;
  
  const streak = calcStreak(workouts);
  const { prs, prEvents } = detectPRs(workouts);
  const totalPRs = prEvents.length;
  
  // Get latest body weight
  const latestBW = bodyMetrics.filter(m => m.wt).slice(-1)[0];
  const bodyWeight = latestBW ? latestBW.wt : null;
  
  // Max lifts
  const benchMax = prs['Barbell Bench Press']?.weight || 0;
  const squatMax = prs['Barbell Back Squat']?.weight || 0;
  
  const stats = {
    totalSessions, totalCardio, totalMetrics,
    currentStreak: streak.current, bestStreak: streak.best,
    totalPRs, prs, prEvents, bodyWeight, benchMax, squatMax,
  };
  
  // XP calculation
  let totalXP = data.xp || 0;
  // If no stored XP, calculate from history (migration)
  if (totalXP === 0 && totalSessions > 0) {
    totalXP = totalSessions * 100 + totalPRs * 200 + totalCardio * 75 + totalMetrics * 25;
    // Add streak bonus estimate
    totalXP += streak.best * 25;
  }
  
  const level = levelFromXP(totalXP);
  const rankInfo = calcRank(stats);
  
  // Check achievements
  const unlocked = data.achievements || [];
  const newAchievements = [];
  ACHIEVEMENT_DEFS.forEach(a => {
    if (!unlocked.includes(a.id) && a.check(stats)) {
      newAchievements.push(a);
    }
  });
  
  return {
    ...stats, totalXP, level, rankInfo,
    unlockedAchievements: unlocked,
    newAchievements,
    allAchievements: ACHIEVEMENT_DEFS,
  };
}

// ── XP AWARD (call after actions) ──
export function awardXP(data, amount, source) {
  const xp = (data.xp || 0) + amount;
  const xpLog = [...(data.xpLog || []), { amount, source, date: new Date().toISOString() }];
  return { ...data, xp, xpLog };
}

export function unlockAchievement(data, achievementId) {
  const achievements = [...(data.achievements || [])];
  if (!achievements.includes(achievementId)) {
    achievements.push(achievementId);
  }
  return { ...data, achievements };
}
