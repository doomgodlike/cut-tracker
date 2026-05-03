import { useState, useEffect, useRef } from 'react'
import { save, today, timeNow, dayName, weekDates } from '../utils/storage'
import { calcNextTarget, logExerciseSession, resetBaseline, getPullupTarget } from '../utils/engine'
import { awardXP } from '../utils/gamification'
import { SPLIT, getSelectedExercise } from '../data/plans'
import RestTimer from './RestTimer'

function getRotationState(data) {
  const wo = data.wo || [], rotation = ['upper_a', 'lower_a', 'upper_b', 'lower_b']
  const names = ['Upper A — Push', 'Lower A — Quad', 'Upper B — Pull', 'Lower B — Hinge']
  let nextIdx = 0
  if (wo.length > 0) { const li = rotation.indexOf(wo[0].dayId); if (li >= 0) nextIdx = (li + 1) % 4 }
  const wk = weekDates(), thisWeek = wo.filter(w => wk.includes(w.date)).length
  const now = new Date(), lastDate = wo.length > 0 ? new Date(wo[0].date + 'T12:00:00') : null
  const daysSince = lastDate ? Math.round((now - lastDate) / 86400000) : 999
  let state = 'normal', coachMsg = '', coachColor = 'var(--gold)'
  if (wo.length === 0) { state = 'first'; coachMsg = 'First session. Engine calibrates from your first 3 workouts per exercise. Go at natural intensity.'; coachColor = 'var(--energy-blue)' }
  else if (thisWeek >= 4) { state = 'flex'; coachMsg = 'All 4 sessions done. Flex day — standalone cardio or rest.'; coachColor = 'var(--success)' }
  else if (daysSince >= 5) { state = 'extended'; coachMsg = `${daysSince} days off. Welcome back. Targets held steady for 2 sessions, then progression resumes.`; coachColor = 'var(--warning)' }
  else if (daysSince >= 2) { state = 'missed'; coachMsg = `You missed ${daysSince - 1} day${daysSince > 2 ? 's' : ''}. Start with clean form, no ego lifts. ${4 - thisWeek} sessions left this week.`; coachColor = 'var(--warning)' }
  else { state = 'normal'; coachMsg = `${names[nextIdx]} is next. ${4 - thisWeek} session${4 - thisWeek !== 1 ? 's' : ''} left this week.` }
  const slots = rotation.map((id, i) => {
    const done = wo.some(w => w.dayId === id && wk.includes(w.date))
    const isNext = i === nextIdx && state !== 'flex'
    const missed = !done && !isNext && i < nextIdx
    return { id, name: names[i], short: names[i].split(' — ')[0], focus: names[i].split(' — ')[1], done, isNext, missed }
  })
  const readiness = Math.min(100, Math.round((thisWeek / 4) * 60 + (daysSince <= 2 ? 22 : 0) + (wo.length > 0 ? 18 : 0)))
  return { nextIdx, nextDay: SPLIT.days[nextIdx], state, coachMsg, coachColor, thisWeek, slots, readiness }
}

// ── Spotify embed ──
function SpotifyPlayer() {
  const [uri, setUri] = useState(() => localStorage.getItem('spotify_uri') || '37i9dQZF1DX76Wlfdnj7AP')
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')
  const saveUri = () => { let id = input.trim(); if (id.includes('playlist/')) id = id.split('playlist/')[1].split('?')[0]; if (id.includes(':playlist:')) id = id.split(':playlist:')[1]; if (id) { setUri(id); localStorage.setItem('spotify_uri', id) }; setEditing(false); setInput('') }
  return (
    <div className="card" style={{ padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#1DB954' }}>Battle Music</span>
        <button onClick={() => setEditing(!editing)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 10, cursor: 'pointer' }}>{editing ? 'cancel' : 'change'}</button>
      </div>
      {editing ? (
        <div style={{ display: 'flex', gap: 6 }}>
          <input className="input" value={input} onChange={e => setInput(e.target.value)} placeholder="Paste Spotify playlist link" style={{ fontSize: 12, padding: 8 }} />
          <button onClick={saveUri} className="btn-cta" style={{ width: 'auto', padding: '8px 14px' }}>Set</button>
        </div>
      ) : (
        <iframe style={{ borderRadius: 8, border: 'none', width: '100%', height: 80, background: 'var(--bg3)' }}
          src={`https://open.spotify.com/embed/playlist/${uri}?utm_source=generator&theme=0`}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" />
      )}
    </div>
  )
}

export default function WorkoutView({ data, setData, onWorkoutComplete }) {
  const [act, setAct] = useState(null)
  const [energy, setEnergy] = useState(4)
  const [showEquip, setShowEquip] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef(null)
  const [selections, setSelections] = useState(() => { try { return JSON.parse(localStorage.getItem('ex_selections') || '{}') } catch { return {} } })
  const rot = getRotationState(data), day = rot.nextDay

  // ── Live session timer ──
  useEffect(() => {
    if (act) {
      timerRef.current = setInterval(() => setElapsed(Math.round((Date.now() - new Date(act.sAt).getTime()) / 1000)), 1000)
      return () => clearInterval(timerRef.current)
    } else { setElapsed(0) }
  }, [act?.sAt])
  const eFmt = `${String(Math.floor(elapsed / 3600)).padStart(2, '0')}:${String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`

  const saveSelection = (slot, optId) => { const ns = { ...selections, [slot]: optId }; setSelections(ns); localStorage.setItem('ex_selections', JSON.stringify(ns)) }
  const buildWorkout = () => day.ex.map(exSlot => { const sel = getSelectedExercise(exSlot, selections); const target = calcNextTarget(data, sel.nm, exSlot.repRange, exSlot.isLower); const sets = Array.from({ length: target.sets || 3 }, () => ({ w: target.weight ? String(target.weight) : '', r: '', dn: false })); return { nm: sel.nm, sets, target, repRange: exSlot.repRange, slot: exSlot.slot, isLower: exSlot.isLower, options: exSlot.options, optional: exSlot.optional, purpose: exSlot.purpose, skipped: false } })
  const start = () => setAct({ id: Date.now(), date: today(), time: timeNow(), dow: dayName(today()), dNm: day.nm, dayId: day.id, ex: buildWorkout(), sAt: new Date().toISOString() })
  const uS = (ei, si, f, v) => setAct(a => ({ ...a, ex: a.ex.map((x, i) => i !== ei ? x : { ...x, sets: x.sets.map((s, j) => j !== si ? s : { ...s, [f]: v }) }) }))
  const aS = (ei) => setAct(a => ({ ...a, ex: a.ex.map((x, i) => i !== ei ? x : { ...x, sets: [...x.sets, { w: x.sets[0]?.w || '', r: '', dn: false }] }) }))
  const rS = (ei, si) => setAct(a => ({ ...a, ex: a.ex.map((x, i) => i !== ei ? x : { ...x, sets: x.sets.filter((_, j) => j !== si) }) }))
  // ── Skip exercise (marks as skipped, doesn't affect baseline) ──
  const skipEx = (ei) => setAct(a => ({ ...a, ex: a.ex.map((x, i) => i !== ei ? x : { ...x, skipped: true, sets: [] }) }))
  const unskipEx = (ei) => setAct(a => ({ ...a, ex: a.ex.map((x, i) => i !== ei ? x : { ...x, skipped: false, sets: [{ w: '', r: '', dn: false }, { w: '', r: '', dn: false }, { w: '', r: '', dn: false }] }) }))

  const swapEquipment = (ei, optId) => { const exSlot = act.ex[ei]; const newOpt = exSlot.options.find(o => o.id === optId); if (!newOpt) return; saveSelection(exSlot.slot, optId); const target = calcNextTarget(data, newOpt.nm, exSlot.repRange, exSlot.isLower); const sets = Array.from({ length: target.sets || 3 }, () => ({ w: target.weight ? String(target.weight) : '', r: '', dn: false })); setAct(a => ({ ...a, ex: a.ex.map((x, i) => i !== ei ? x : { ...x, nm: newOpt.nm, sets, target, skipped: false }) })); setShowEquip(null) }
  const finish = () => { clearInterval(timerRef.current); const dt = new Date(); const w = { ...act, done: true, fAt: dt.toISOString(), fTm: timeNow(), dur: Math.round((dt - new Date(act.sAt)) / 60000), energy }; let nd = { ...data, wo: [w, ...data.wo] }; w.ex.forEach(ex => { if (!ex.skipped && ex.sets.some(s => s.w && s.r)) nd = logExerciseSession(nd, ex.nm, ex.sets, ex.repRange, ex.isLower) }); let xp = 100; w.ex.forEach(ex => { if (!ex.skipped && ex.target?.type === 'progress') xp += 50 }); nd = awardXP(nd, xp, `Workout: ${w.dNm}`); setData(nd); save(nd); setAct(null); onWorkoutComplete?.(xp, w) }
  const del = (id) => { const nd = { ...data, wo: data.wo.filter(w => w.id !== id) }; setData(nd); save(nd) }
  const tc = (type) => ({ progress: 'var(--success)', push: 'var(--warning)', hold: 'var(--energy-blue)', deload: 'var(--error)', first: 'var(--energy-blue)', calibrating: 'var(--energy-blue)' }[type] || 'var(--gold)')

  // Pull-up data
  const pullupMax = data.pullupCount || 0
  const pullupTarget = getPullupTarget(pullupMax)

  // ══ ACTIVE SESSION ══
  if (act) {
    return (
      <div className="slide-up">
        <div style={{ padding: '12px 0 4px' }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)' }}>Cut Protocol</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--display)', fontSize: 28, fontWeight: 700 }}>ACTIVE BATTLE</div>
            <span style={{ background: 'var(--energy-blue)', color: 'var(--bg0)', padding: '4px 12px', fontSize: 10, fontWeight: 700, letterSpacing: '0.6px', clipPath: 'var(--chamfer-sm)' }}>LIVE</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Logging sets · {act.dNm}</div>
        </div>

        {/* Session clock + Rest timer */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.7px', textTransform: 'uppercase', color: 'var(--gold)' }}>Session</div>
            <div style={{ fontFamily: 'var(--data)', fontSize: 24, fontWeight: 700 }}>{eFmt}</div>
          </div>
          <div className="card card-blue" style={{ padding: 12 }}>
            <RestTimer />
          </div>
        </div>

        <SpotifyPlayer />

        {/* Exercise cards */}
        {act.ex.map((ex, ei) => {
          if (ex.skipped) {
            return (
              <div key={ei} className="card" style={{ padding: 12, opacity: 0.4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 15, textDecoration: 'line-through' }}>{ex.nm}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Skipped — baseline not affected</div>
                </div>
                <button onClick={() => unskipEx(ei)} style={{ background: 'none', border: '1px solid var(--neutral)', padding: '4px 10px', fontSize: 9, color: 'var(--text-muted)', cursor: 'pointer', clipPath: 'var(--chamfer-sm)' }}>UNDO</button>
              </div>
            )
          }
          const t = ex.target, color = tc(t.type)
          return (
            <div key={ei} className="card" style={{ padding: 16, borderColor: color }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--text-primary)' }}>{ex.nm}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                    Target: {t.weight || '?'}kg × {t.reps || '?'} · {ex.repRange} range
                    {t.calibrating && <span style={{ color: 'var(--energy-blue)', marginLeft: 6 }}>CALIBRATING</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {ex.options?.length > 1 && (
                    <button onClick={() => setShowEquip(showEquip === ei ? null : ei)} style={{ background: 'none', border: '1px solid var(--neutral)', padding: '3px 8px', fontSize: 9, color: 'var(--gold)', cursor: 'pointer' }}>SWAP</button>
                  )}
                  <button onClick={() => skipEx(ei)} style={{ background: 'none', border: '1px solid var(--neutral)', padding: '3px 8px', fontSize: 9, color: 'var(--text-dim)', cursor: 'pointer' }}>SKIP</button>
                </div>
              </div>
              {showEquip === ei && (
                <div style={{ marginBottom: 8, padding: 8, background: 'var(--bg3)' }}>
                  {ex.options.map(opt => (
                    <button key={opt.id} onClick={() => swapEquipment(ei, opt.id)} style={{ width: '100%', padding: '6px 8px', background: opt.nm === ex.nm ? 'var(--energy-blue-deep)' : 'none', border: 'none', textAlign: 'left', color: opt.nm === ex.nm ? 'var(--energy-blue)' : 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>{opt.nm}</button>
                  ))}
                </div>
              )}
              {/* Coach message */}
              <div style={{ padding: '6px 10px', background: 'var(--bg3)', marginBottom: 8, borderLeft: `2px solid ${color}`, fontSize: 11, color, lineHeight: 1.5 }}>
                {t.msg}
              </div>
              {/* Set table */}
              <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 32px 22px', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.7px', color: 'var(--text-dim)', textAlign: 'center' }}>SET</span>
                <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.7px', color: 'var(--text-dim)' }}>KG</span>
                <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.7px', color: 'var(--text-dim)' }}>REPS</span>
                <span></span><span></span>
              </div>
              {ex.sets.map((st, si) => (
                <div key={si} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 32px 22px', gap: 6, marginBottom: 4, alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--data)', fontSize: 14, fontWeight: 700, color: 'var(--gold)', textAlign: 'center' }}>{si + 1}</span>
                  <input className="input" type="number" inputMode="decimal" value={st.w} onChange={e => uS(ei, si, 'w', e.target.value)} placeholder={t.weight ? String(t.weight) : 'kg'} style={{ height: 38, fontSize: 15, padding: '0 8px' }} />
                  <input className="input" type="number" inputMode="numeric" value={st.r} onChange={e => uS(ei, si, 'r', e.target.value)} placeholder={t.reps ? String(t.reps) : ''} style={{ height: 38, fontSize: 15, padding: '0 8px' }} />
                  <button onClick={() => uS(ei, si, 'dn', !st.dn)} style={{ width: 32, height: 38, border: `1px solid ${st.dn ? 'var(--success)' : 'var(--neutral)'}`, background: st.dn ? 'rgba(34,197,94,0.1)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: st.dn ? 'var(--success)' : 'var(--text-dim)', fontSize: 14 }}>{st.dn ? '✓' : ''}</button>
                  <button onClick={() => rS(ei, si)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: 14 }}>×</button>
                </div>
              ))}
              <button onClick={() => aS(ei)} style={{ width: '100%', padding: 6, marginTop: 4, background: 'none', border: '1px dashed var(--neutral)', color: 'var(--text-dim)', fontSize: 11, cursor: 'pointer' }}>+ Add set</button>
            </div>
          )
        })}

        {/* Energy rating */}
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>Energy Rating</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
            {[1, 2, 3, 4, 5].map(e => (
              <button key={e} onClick={() => setEnergy(e)} style={{ flex: 1, padding: 6, background: e <= energy ? 'var(--gold-deep)' : 'var(--bg3)', border: `1px solid ${e <= energy ? 'var(--gold)' : 'var(--neutral)'}`, cursor: 'pointer', color: e <= energy ? 'var(--gold-bright)' : 'var(--text-dim)', fontSize: 16 }}>⚡</button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{energy} / 5 — {energy >= 4 ? 'strong, controlled aggression' : energy >= 3 ? 'steady' : 'low energy'}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
          <button onClick={() => { if (confirm('Abandon workout?')) { clearInterval(timerRef.current); setAct(null) } }} className="btn-ghost" style={{ padding: 14, width: '100%' }}>End Session</button>
          <button onClick={finish} className="btn-cta">Complete Workout</button>
        </div>
      </div>
    )
  }

  // ══ PRE-BATTLE SCREEN ══
  return (
    <div>
      {/* Hero image */}
      <div className="hero-wrap" style={{ height: 200, marginBottom: 8 }}>
        <img src="/img/hero-battle.png" alt="" style={{ objectPosition: 'center top' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg0) 10%, transparent 60%)', zIndex: 1 }} />
        <div style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 2 }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)' }}>Cut Protocol</div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 28, fontWeight: 700, textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>WORKOUT</div>
        </div>
        <span style={{ position: 'absolute', top: 16, right: 16, zIndex: 2, background: 'var(--bg2)', border: '1px solid var(--gold-hairline)', clipPath: 'var(--chamfer-sm)', padding: '6px 14px', fontFamily: 'var(--data)', fontSize: 14, fontWeight: 700, color: 'var(--gold-bright)' }}>
          {rot.slots.find(s => s.isNext)?.short || 'FLEX'}
        </span>
      </div>

      {/* Next Battle card */}
      <div className="card" style={{ padding: 16, position: 'relative', overflow: 'hidden', minHeight: 160 }}>
        <img src="/img/illustrations/B_warrior_card_art_400x500.png" alt="" style={{ position: 'absolute', right: -10, top: -10, width: 150, height: 180, objectFit: 'cover', opacity: 0.5 }} onError={e => { e.target.style.display = 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>Next Battle</div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 24, fontWeight: 700, lineHeight: 1.1 }}>{day.nm}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{day.focus}</div>
          <div style={{ fontSize: 12, color: rot.coachColor, marginTop: 8, lineHeight: 1.5, borderLeft: `2px solid ${rot.coachColor}`, paddingLeft: 8 }}>Coach: {rot.coachMsg}</div>
          {rot.state !== 'flex' && <button onClick={start} className="btn-cta" style={{ marginTop: 14, width: 'auto', padding: '10px 28px' }}>Start Workout</button>}
        </div>
      </div>

      {rot.state === 'flex' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <div className="card" style={{ padding: 14, textAlign: 'center', borderColor: 'var(--success)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)' }}>Standalone Cardio</div>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>Progress toward 2km</div>
          </div>
          <div className="card" style={{ padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>Rest Day</div>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>Recover</div>
          </div>
        </div>
      )}

      {/* 4-Day Rotation */}
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)', margin: '8px 0' }}>4-Day Rotation</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        {rot.slots.map((s, i) => (
          <div key={i} className="card" style={{ padding: 12, borderColor: s.isNext ? 'var(--gold)' : undefined }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 700 }}>{s.short}</div>
              <span style={{ fontSize: 9, fontWeight: 600, color: s.done ? 'var(--success)' : s.isNext ? 'var(--gold)' : s.missed ? 'var(--warning)' : 'var(--text-dim)' }}>
                {s.done ? 'DONE' : s.isNext ? 'NEXT' : s.missed ? 'MISSED' : 'QUEUED'}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.focus}</div>
          </div>
        ))}
      </div>

      {/* Pull-up progression */}
      <div className="card" style={{ padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)' }}>Pull-Up Progression</span>
          <span style={{ fontFamily: 'var(--data)', fontSize: 16, fontWeight: 700, color: 'var(--energy-blue)' }}>{pullupMax} → {pullupTarget.target}</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{pullupTarget.msg}</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15].map(n => (
            <button key={n} onClick={() => { const nd = { ...data, pullupCount: n }; save(nd); setData(nd) }}
              style={{ flex: 1, padding: '4px 0', fontSize: 9, fontFamily: 'var(--data)', fontWeight: 700, background: n <= pullupMax ? 'var(--energy-blue-deep)' : 'var(--bg3)', border: `1px solid ${n <= pullupMax ? 'var(--energy-blue)' : 'var(--neutral)'}`, color: n <= pullupMax ? 'var(--energy-blue)' : 'var(--text-dim)', cursor: 'pointer' }}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Battle Readiness */}
      <div className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)' }}>Battle Readiness</span>
        <div style={{ flex: 1, height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 3, background: 'var(--energy-blue)', width: `${rot.readiness}%` }} />
        </div>
        <span style={{ fontFamily: 'var(--data)', fontSize: 18, fontWeight: 700, color: 'var(--energy-blue)' }}>{rot.readiness}%</span>
      </div>

      {/* Last 3 Workouts */}
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)', margin: '8px 0' }}>Last 3 Workouts</div>
      {data.wo.slice(0, 3).map(w => (
        <div key={w.id} className="card" style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{w.dNm}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
              {w.dow} {w.date?.slice(5)} · {(w.ex || []).filter(e => !e.skipped).length} exercises{w.dur ? ` · ${w.dur}m` : ''}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>
              {(w.ex || []).filter(e => !e.skipped).slice(0, 4).map((x, i) => {
                const b = x.sets?.reduce((a, c) => +c.w > +a.w ? c : a, { w: 0, r: 0 })
                return b?.w ? <span key={i} style={{ padding: '2px 6px', background: 'var(--bg3)', fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>{x.nm.split(' ').slice(0, 2).join(' ')}:{b.w}×{b.r}</span> : null
              })}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <span style={{ fontFamily: 'var(--data)', fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>+{100 + (w.ex || []).filter(e => !e.skipped && e.target?.type === 'progress').length * 50} XP</span>
            <button onClick={() => del(w.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: 12 }}>×</button>
          </div>
        </div>
      ))}
      {data.wo.length === 0 && <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--text-dim)' }}>No battles yet.</div>}
    </div>
  )
}
