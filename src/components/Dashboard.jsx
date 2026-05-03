import { today, dayName, weekDates } from '../utils/storage'

const TARGETS = {
  training: { cal: 2025, protein: 150, carbs: 190, fat: 65 },
  rest: { cal: 1825, protein: 150, carbs: 140, fat: 65 },
}
const TRAINING_DAYS = ['Mon', 'Tue', 'Thu', 'Fri']

export default function Dashboard({ data, stats, goTo }) {
  const { level, currentStreak, bestStreak } = stats
  const todayDate = today()
  const dow = dayName(todayDate)
  const isTraining = TRAINING_DAYS.includes(dow)
  const targets = isTraining ? TARGETS.training : TARGETS.rest
  const todayMeals = (data.meals || []).filter(m => m.date === todayDate)

  const totals = todayMeals.reduce((a, m) => ({
    cal: a.cal + (m.cal || 0), p: a.p + (m.p || 0), f: a.f + (m.f || 0), c: a.c + (m.c || 0),
  }), { cal: 0, p: 0, f: 0, c: 0 })

  const calPct = Math.min(totals.cal / targets.cal, 1)
  const remaining = Math.round(targets.cal - totals.cal)
  const todayWorkout = (data.wo || []).find(w => w.date === todayDate)

  const slots = [
    { id: 'breakfast', nm: 'Breakfast', sub: 'Oats, eggs, whey' },
    { id: 'lunch', nm: 'Lunch', sub: 'Chicken rice plan' },
    { id: 'snack', nm: 'Snack', sub: 'Greek yogurt, nuts' },
    { id: 'dinner', nm: 'Dinner', sub: '15 presets ready' },
    { id: 'whey', nm: 'Whey Backup', sub: '117 cal · 25g P' },
  ]

  const slotState = (id) => {
    const logged = todayMeals.filter(m => m.slot === id)
    if (logged.length > 0) return { state: 'DONE', color: 'var(--success)', cal: logged.reduce((a, m) => a + (m.cal || 0), 0), p: logged.reduce((a, m) => a + (m.p || 0), 0) }
    if (id === 'lunch') return { state: 'PLAN', color: 'var(--energy-blue)' }
    if (id === 'whey') return { state: 'OPT', color: 'var(--text-dim)' }
    return { state: 'ADD', color: 'var(--gold)' }
  }

  // Objectives
  const objectives = [
    { label: 'Hit calorie & protein targets', done: totals.cal >= targets.cal * 0.85 && totals.p >= targets.protein * 0.85 },
    { label: 'Complete 1 workout', done: !!todayWorkout },
    { label: 'Pre-LISS cardio', done: !!(data.cl || []).find(c => c.date === todayDate) },
    { label: 'No cheat meals', done: todayMeals.length > 0 },
  ]
  const objDone = objectives.filter(o => o.done).length

  return (
    <div>
      {/* ── HERO PORTRAIT ── */}
      <div className="hero-wrap" style={{ height: 380, marginBottom: 0 }}>
        <img src="/img/hero-dashboard.png" alt="" style={{ objectPosition: 'center 20%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg0) 10%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.15) 100%)', zIndex: 1 }} />

        {/* Title overlay */}
        <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 2 }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 2 }}>Cut Protocol</div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 28, fontWeight: 700, color: 'var(--gold-bright)', lineHeight: 1, letterSpacing: '0.5px' }}>SAIYAN MODE</div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginTop: 4 }}>Discipline. Focus. Power.</div>
        </div>

        {/* Power level badge */}
        <div style={{
          position: 'absolute', top: 16, right: 16, zIndex: 2,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--gold-hairline)',
            clipPath: 'var(--chamfer-sm)', padding: '8px 16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.7px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Power Level</div>
            <div style={{ fontFamily: 'var(--data)', fontSize: 28, fontWeight: 700, color: 'var(--gold-bright)', lineHeight: 1 }}>
              {level.totalXP.toLocaleString()}
            </div>
          </div>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', overflow: 'hidden',
            border: '2px solid var(--gold)', flexShrink: 0,
          }}>
            <img src="/img/illustrations/avatar_512.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} />
          </div>
        </div>
      </div>

      {/* ── CALORIES CARD ── */}
      <div className="card" style={{ padding: 16, marginTop: -8 }}>
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>Calories</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: 'var(--data)', fontSize: 40, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
            {Math.round(totals.cal).toLocaleString()}
          </span>
          <span style={{ fontFamily: 'var(--data)', fontSize: 16, color: 'var(--text-muted)' }}>/ {targets.cal}</span>
          <span style={{ marginLeft: 'auto', fontSize: 12, fontFamily: 'var(--data)', color: 'var(--text-muted)' }}>{Math.round(calPct * 100)}%</span>
        </div>
        <div style={{ fontSize: 9, fontFamily: 'var(--body)', color: 'var(--text-muted)', letterSpacing: '0.7px', textTransform: 'uppercase', marginTop: 2 }}>
          {remaining > 0 ? `${remaining} remaining` : 'Target reached'}
        </div>
        <div className="pbar" style={{ marginTop: 8 }}>
          <div className="pbar-fill" style={{ width: `${calPct * 100}%`, background: calPct >= 1 ? 'var(--error)' : 'var(--gold)' }} />
        </div>
      </div>

      {/* ── MACRO CARDS (3 columns) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
        <MacroCard label="Protein" current={totals.p} target={targets.protein} color="var(--protein)" />
        <MacroCard label="Carbs" current={totals.c} target={targets.carbs} color="var(--carbs)" />
        <MacroCard label="Fat" current={totals.f} target={targets.fat} color="var(--fat)" />
      </div>

      {/* ── TODAY'S MEALS ── */}
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)', margin: '12px 0 8px' }}>Today&apos;s Meals</div>
      {slots.map(slot => {
        const ss = slotState(slot.id)
        return (
          <div key={slot.id} className="meal-row" onClick={() => goTo('food')}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{slot.nm}</div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 1 }}>
                {ss.state === 'DONE' ? `${ss.cal} cal · ${ss.p}g P` : slot.sub}
              </div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.6px', color: ss.color }}>{ss.state}</span>
          </div>
        )
      })}

      {/* ── OBJECTIVE STRIP ── */}
      <div className="card" style={{ padding: '10px 16px', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)' }}>Today&apos;s Objective</span>
          <span style={{ fontSize: 11, fontFamily: 'var(--data)', fontWeight: 700, color: 'var(--text-primary)' }}>{objDone}/{objectives.length} completed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>streak</span>
          <span style={{ fontFamily: 'var(--data)', fontSize: 14, fontWeight: 700, color: 'var(--gold-bright)' }}>{currentStreak} days</span>
        </div>
      </div>
    </div>
  )
}

function MacroCard({ label, current, target, color }) {
  const pct = target > 0 ? Math.min(current / target, 1) : 0
  return (
    <div className="card" style={{ padding: 12, textAlign: 'left' }}>
      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color, marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
        <span style={{ fontFamily: 'var(--data)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{Math.round(current)}</span>
        <span style={{ fontFamily: 'var(--data)', fontSize: 12, color: 'var(--text-muted)' }}>/ {target}g</span>
      </div>
      <div className="pbar" style={{ marginTop: 6 }}>
        <div className="pbar-fill" style={{ width: `${pct * 100}%`, background: current > target ? 'var(--error)' : color }} />
      </div>
    </div>
  )
}
