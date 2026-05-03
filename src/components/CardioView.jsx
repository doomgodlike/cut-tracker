import { useState } from 'react'
import { save, today, timeNow } from '../utils/storage'
import { awardXP } from '../utils/gamification'
import { calcNextCardio, getCardioLookahead, getCardioProgress, calcCaloriesBurned } from '../utils/engine'

export default function CardioView({ data, setData }) {
  const [mode, setMode] = useState('pre')
  const [dur, setDur] = useState(''); const [inc, setInc] = useState(''); const [spd, setSpd] = useState('')
  const logs = data.cl || [], flexLogs = logs.filter(l => l.type === 'flex' || l.type === 'standalone')
  const preLogs = logs.filter(l => l.type === 'pre')
  const nextPre = calcNextCardio(preLogs, 'pre'), nextFlex = calcNextCardio(logs, 'flex')
  const lookahead = getCardioLookahead(logs), phases = getCardioProgress(logs), totalFlex = flexLogs.length
  const next = mode === 'pre' ? nextPre : nextFlex
  const bw = data.bd?.filter(m => m.wt)?.slice(-1)?.[0]?.wt || 69
  const estCal = calcCaloriesBurned(next.duration, next.speed, next.incline, bw)
  const logSession = () => {
    const entry = { date: today(), time: timeNow(), type: mode, duration: dur ? +dur : next.duration, incline: inc ? +inc : next.incline, speed: spd ? +spd : next.speed, jogTime: mode === 'flex' ? (nextFlex.jogTime || 0) : 0 }
    let nd = { ...data, cl: [...logs, entry] }; nd = awardXP(nd, mode === 'pre' ? 30 : 75, mode === 'pre' ? 'Pre-LISS' : 'Cardio session')
    save(nd); setData(nd); setDur(''); setInc(''); setSpd('')
  }
  const undo = () => { if (!logs.length) return; save({ ...data, cl: logs.slice(0, -1) }); setData({ ...data, cl: logs.slice(0, -1) }) }
  // 2km ring SVG
  const ringPct = totalFlex / 40
  const r = 58, circ = 2 * Math.PI * r

  return (
    <div>
      <div style={{ padding: '12px 0 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)' }}>Cut Protocol</div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 32, fontWeight: 700, lineHeight: 1 }}>CARDIO</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Treadmill progression</div>
        </div>
        <span style={{ background: 'var(--bg2)', border: '1px solid var(--gold-hairline)', clipPath: 'var(--chamfer-sm)', padding: '6px 14px', fontFamily: 'var(--data)', fontSize: 14, fontWeight: 700, color: 'var(--energy-blue)' }}>2KM GOAL</span>
      </div>

      {/* Mode tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        {[{ m: 'pre', l: 'Pre-Workout Warmup' }, { m: 'flex', l: 'Standalone Session' }].map(t => (
          <button key={t.m} onClick={() => setMode(t.m)} className={`btn-ghost${mode === t.m ? ' active' : ''}`} style={{ width: '100%', textAlign: 'center' }}>{t.l}</button>
        ))}
      </div>

      {/* Goal card with ring */}
      <div className="card" style={{ padding: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>Today&apos;s Treadmill Target</div>
        <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 16px' }}>
          <svg width={140} height={140} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
            <circle cx={70} cy={70} r={r} fill="none" stroke="var(--bg3)" strokeWidth={12} />
            <circle cx={70} cy={70} r={r} fill="none" stroke="var(--energy-blue)" strokeWidth={12}
              strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - ringPct)} style={{ transition: 'stroke-dashoffset 0.6s' }} />
            <circle cx={70} cy={70} r={r} fill="none" stroke="var(--gold-bright)" strokeWidth={3}
              strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - Math.min(ringPct + 0.05, 1))} opacity={0.5} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.7px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Today&apos;s Goal</div>
            <div style={{ fontFamily: 'var(--data)', fontSize: 36, fontWeight: 700, color: 'var(--energy-blue)', lineHeight: 1 }}>2.00</div>
            <div style={{ fontFamily: 'var(--data)', fontSize: 14, color: 'var(--text-muted)' }}>KM</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Target: {next.duration} min · {next.incline}% incline · {next.speed} km/h
        </div>
        <div className="pbar" style={{ marginTop: 10 }}>
          <div className="pbar-fill" style={{ width: `${ringPct * 100}%`, background: 'var(--energy-blue)' }} />
        </div>
      </div>

      {/* Session Inputs (2-col grid) */}
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)', margin: '8px 0' }}>Session Inputs</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        {[
          { l: 'Duration', v: dur, set: setDur, ph: `${next.duration}`, u: '' },
          { l: 'Speed', v: spd, set: setSpd, ph: `${next.speed} km/h`, u: '' },
          { l: 'Incline', v: inc, set: setInc, ph: `${next.incline}%`, u: '' },
          { l: 'Calories', v: '', set: () => {}, ph: `${estCal} kcal`, u: '', disabled: true },
        ].map((f, i) => (
          <div key={i} className="card" style={{ padding: 12 }}>
            <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.7px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>{f.l}</div>
            <input className="input" type="number" step="0.1" value={f.v} onChange={e => f.set(e.target.value)} placeholder={f.ph} disabled={f.disabled} style={{ fontSize: 18, fontFamily: 'var(--data)', fontWeight: 700, padding: '6px 8px' }} />
          </div>
        ))}
      </div>

      {/* 3-day Lookahead */}
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)', margin: '8px 0' }}>3-Day Lookahead</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
        {[
          { l: 'Today', d: nextPre, active: true },
          { l: 'Tomorrow', d: lookahead.tomorrow },
          { l: 'Flex Day', d: lookahead.dayAfterFlex },
        ].map((d, i) => (
          <div key={i} className="card" style={{ padding: 10, textAlign: 'center', borderColor: d.active ? 'var(--energy-blue)' : undefined }}>
            <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.7px', textTransform: 'uppercase', color: d.active ? 'var(--energy-blue)' : 'var(--text-dim)' }}>{d.l}</div>
            <div style={{ fontFamily: 'var(--data)', fontSize: 22, fontWeight: 700, color: d.active ? 'var(--text-primary)' : 'var(--text-dim)', lineHeight: 1.3 }}>
              {d.d.duration}m
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>Pre · {d.d.incline}% · {d.d.speed}</div>
          </div>
        ))}
      </div>

      {/* Log CTA */}
      <button onClick={logSession} className="btn-cta">Log Cardio Session</button>

      {/* Recent */}
      {logs.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)' }}>Recent</span>
            <button onClick={undo} className="btn-ghost" style={{ padding: '4px 10px', fontSize: 9 }}>Undo</button>
          </div>
          {logs.slice(-5).reverse().map((c, i) => {
            const cal = calcCaloriesBurned(c.duration, c.speed, c.incline, bw)
            return (
              <div key={i} className="card" style={{ padding: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase', color: c.type === 'pre' ? 'var(--energy-blue)' : 'var(--gold)' }}>{c.type === 'pre' ? 'PRE' : 'FLEX'}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, marginLeft: 8 }}>{c.duration}min · {c.incline}% · {c.speed}km/h</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, fontFamily: 'var(--data)', color: 'var(--warning)' }}>🔥 {cal}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.date?.slice(5)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
