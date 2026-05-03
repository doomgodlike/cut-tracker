import { useState, useMemo } from 'react'
import { save, today, dayName, weekDates } from '../utils/storage'
import { IP_RECIPES, BREAKFASTS, QUICK_ITEMS, SNACK_ITEMS, MACRO_TARGETS, TRAINING_DAYS } from '../data/recipes'

function timeStr() { return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) }

export default function NutritionView({ data, setData }) {
  const [search, setSearch] = useState('')
  const [openCat, setOpenCat] = useState(null)
  const [customForm, setCustomForm] = useState(null)

  const isTraining = TRAINING_DAYS.includes(dayName(today()))
  const targets = isTraining ? MACRO_TARGETS.training : MACRO_TARGETS.rest
  const todayDate = today()
  const todayLog = (data.meals || []).filter(m => m.date === todayDate)
  const totals = todayLog.reduce((a, m) => ({ cal: a.cal + (m.cal || 0), p: a.p + (m.p || 0), f: a.f + (m.f || 0), c: a.c + (m.c || 0) }), { cal: 0, p: 0, f: 0, c: 0 })
  const remaining = Math.round(targets.cal - totals.cal)
  const calPct = Math.min(totals.cal / targets.cal, 1)

  // Dynamic coaching — changes throughout the day based on what's eaten
  const getCoaching = () => {
    const pPct = totals.p / targets.protein, cPct = totals.cal / targets.cal
    if (todayLog.length === 0) return 'Fresh day. Hit protein at breakfast to front-load. Training day = carbs around workout.'
    if (cPct >= 0.95 && pPct >= 0.85) return 'Targets nailed. If hungry, only whey or zero-cal drinks from here.'
    if (cPct >= 0.8 && pPct < 0.7) return `Calories at ${Math.round(cPct * 100)}% but protein only ${Math.round(pPct * 100)}%. Use whey backup — don't waste remaining cals on carbs.`
    if (pPct >= 0.8 && cPct < 0.5) return 'Protein is ahead — solid. Put remaining carbs around training; keep dinner lean.'
    if (cPct >= 0.6) return `${Math.round(remaining)} cal left. Prioritize protein for remaining meals. ${isTraining ? 'Post-workout carbs OK.' : 'Keep carbs moderate — rest day.'}`
    if (todayLog.some(m => m.slot === 'breakfast')) return 'Breakfast done. Plan lunch from IP presets — cook once, eat twice.'
    return 'Log breakfast first. Every meal counts on a cut.'
  }
  const coachMsg = getCoaching()

  const tonightsCook = (recipe) => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
    const nd = { ...data, meals: [...(data.meals || []), { ...recipe, date: todayDate, slot: 'dinner', time: timeStr(), id: Date.now() }, { ...recipe, date: tomorrow, slot: 'lunch', time: '12:30 pm', id: Date.now() + 1, nm: recipe.nm + ' (leftover)' }] }
    save(nd); setData(nd)
  }
  const addMeal = (item, slot) => {
    if (item.custom) { setCustomForm({ nm: '', cal: '', p: '', f: '', c: '' }); return }
    const nd = { ...data, meals: [...(data.meals || []), { ...item, date: todayDate, slot, time: timeStr(), id: Date.now() }] }
    save(nd); setData(nd)
  }
  const addCustom = () => {
    if (!customForm?.nm) return
    const nd = { ...data, meals: [...(data.meals || []), { nm: customForm.nm, cal: +customForm.cal || 0, p: +customForm.p || 0, f: +customForm.f || 0, c: +customForm.c || 0, date: todayDate, id: Date.now(), time: timeStr() }] }
    save(nd); setData(nd); setCustomForm(null)
  }
  const removeMeal = (id) => { const nd = { ...data, meals: (data.meals || []).filter(m => m.id !== id) }; save(nd); setData(nd) }

  const slots = [
    { id: 'breakfast', nm: 'Breakfast', sub: 'Oats, eggs, whey' },
    { id: 'lunch', nm: 'Lunch', sub: 'Chicken rice plan' },
    { id: 'snack', nm: 'Snack', sub: 'Greek yogurt, nuts' },
    { id: 'dinner', nm: 'Dinner', sub: '15 presets ready' },
    { id: 'whey', nm: 'Whey Backup', sub: '117 cal · 25g P' },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ padding: '12px 0 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)' }}>Cut Protocol</div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 32, fontWeight: 700, lineHeight: 1 }}>NUTRITION</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{isTraining ? 'Training' : 'Rest'} day food protocol</span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.6px', padding: '2px 8px', background: isTraining ? 'var(--gold-deep)' : 'var(--energy-blue-deep)', color: isTraining ? 'var(--gold-bright)' : 'var(--energy-blue)', clipPath: 'var(--chamfer-sm)' }}>
              {isTraining ? 'TRAINING DAY' : 'REST DAY'}
            </span>
          </div>
        </div>
        <span style={{ background: 'var(--bg2)', border: '1px solid var(--gold-hairline)', clipPath: 'var(--chamfer-sm)', padding: '6px 14px', fontFamily: 'var(--data)', fontSize: 14, fontWeight: 700, color: 'var(--gold-bright)' }}>
          {remaining > 0 ? `${remaining} LEFT` : 'DONE'}
        </span>
      </div>

      {/* Remaining Calories hero */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>Remaining Calories</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: 'var(--data)', fontSize: 42, fontWeight: 700, lineHeight: 1 }}>{remaining > 0 ? remaining.toLocaleString() : 0}</span>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>of {targets.cal} target</span>
          <span style={{ marginLeft: 'auto', fontSize: 12, fontFamily: 'var(--data)', color: 'var(--text-muted)' }}>{Math.round(calPct * 100)}%</span>
        </div>
        <div className="pbar" style={{ marginTop: 8 }}>
          <div className="pbar-fill" style={{ width: `${calPct * 100}%`, background: 'var(--gold)' }} />
        </div>
      </div>

      {/* Macro cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
        {[{ l: 'Protein', c: totals.p, t: targets.protein, col: 'var(--protein)' }, { l: 'Carbs', c: totals.c, t: targets.carbs, col: 'var(--carbs)' }, { l: 'Fat', c: totals.f, t: targets.fat, col: 'var(--fat)' }].map(m => (
          <div key={m.l} className="card" style={{ padding: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: m.col, marginBottom: 4 }}>{m.l}</div>
            <div style={{ fontFamily: 'var(--data)', fontSize: 20, fontWeight: 700, lineHeight: 1 }}>{Math.round(m.c)} <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ {m.t}g</span></div>
            <div className="pbar" style={{ marginTop: 6 }}><div className="pbar-fill" style={{ width: `${Math.min(m.c / m.t, 1) * 100}%`, background: m.c > m.t ? 'var(--error)' : m.col }} /></div>
          </div>
        ))}
      </div>

      {/* Coaching Intel */}
      <div className="card card-blue" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
        <img src="/img/illustrations/C_streak_flame_art_300x400.png" alt="" style={{ width: 44, height: 58, objectFit: 'cover', borderRadius: 4, opacity: 0.8 }} onError={e => { e.target.style.display = 'none' }} />
        <div>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--energy-blue)', marginBottom: 2 }}>Coaching Intel</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{coachMsg}</div>
        </div>
      </div>

      {/* Meal Slots */}
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)', margin: '12px 0 8px' }}>Meal Slots</div>
      {slots.map(slot => {
        const logged = todayLog.filter(m => m.slot === slot.id)
        const done = logged.length > 0
        return (
          <div key={slot.id} className="meal-row">
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{slot.nm}</div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                {done ? logged.map(m => m.nm).join(', ') : slot.sub}
              </div>
            </div>
            {done ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, color: 'var(--success)', fontWeight: 600 }}>DONE</span>
                {logged.map(m => (
                  <button key={m.id} onClick={() => removeMeal(m.id)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 12 }}>×</button>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: 10, fontWeight: 600, color: slot.id === 'dinner' ? 'var(--gold)' : slot.id === 'lunch' ? 'var(--energy-blue)' : 'var(--gold)', cursor: 'pointer' }}
                onClick={() => setOpenCat(slot.id === 'dinner' ? 'dinner' : slot.id === 'breakfast' ? 'breakfast' : 'quick')}>
                {slot.id === 'dinner' ? 'CHOOSE' : slot.id === 'lunch' ? 'PLAN' : slot.id === 'whey' ? 'OPT' : 'ADD'}
              </span>
            )}
          </div>
        )
      })}

      {/* Dinner Presets (horizontal scroll) */}
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)', margin: '16px 0 8px' }}>Dinner Presets</div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
        {IP_RECIPES.filter(r => !search || r.nm.toLowerCase().includes(search.toLowerCase())).map(r => (
          <button key={r.id} onClick={() => tonightsCook(r)} style={{
            minWidth: 80, padding: '10px 8px', background: 'var(--bg2)', border: '1px solid var(--gold-hairline)',
            clipPath: 'var(--chamfer-sm)', cursor: 'pointer', textAlign: 'left', flexShrink: 0,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 6 }}>{r.nm.split(' ').slice(0, 2).join(' ')}</div>
            <div style={{ fontFamily: 'var(--data)', fontSize: 14, fontWeight: 700, color: 'var(--gold)' }}>{r.cal} cal</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>{r.p}P</div>
          </button>
        ))}
      </div>

      {/* Breakfast + Quick add sections */}
      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.6px', color: 'var(--gold)', marginTop: 8, textTransform: 'uppercase' }}>
        7 Breakfast Options · {isTraining ? 'Training' : 'Rest'} Day Detected
      </div>

      {/* Expandable categories */}
      {[
        { id: 'breakfast', nm: 'Breakfast Options', items: BREAKFASTS, slot: 'breakfast' },
        { id: 'quick', nm: 'Quick Add', items: QUICK_ITEMS, slot: null },
        { id: 'snacks', nm: 'Snacks', items: SNACK_ITEMS, slot: 'snack' },
      ].map(cat => (
        <div key={cat.id} className="card" style={{ padding: 14, marginTop: 6 }}>
          <button onClick={() => setOpenCat(openCat === cat.id ? null : cat.id)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>{cat.nm}</span>
            <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{cat.items.length} · {openCat === cat.id ? '▲' : '▼'}</span>
          </button>
          {openCat === cat.id && (
            <div className="fade-in" style={{ marginTop: 8 }}>
              {cat.items.map((item, i) => (
                <button key={i} onClick={() => addMeal(item, cat.slot || (item.nm?.includes('whey') ? 'whey' : null))} style={{
                  width: '100%', display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                  borderBottom: i < cat.items.length - 1 ? '1px solid var(--neutral)' : 'none',
                  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{item.nm}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>P{item.p} · F{item.f} · C{item.c}{item.cat ? ` · ${item.cat}` : ''}</div>
                  </div>
                  <span style={{ fontFamily: 'var(--data)', fontSize: 14, fontWeight: 700, color: 'var(--gold)' }}>{item.cal}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Custom food */}
      {customForm ? (
        <div className="card" style={{ padding: 14, marginTop: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>Custom Food</div>
          <input className="input" value={customForm.nm} onChange={e => setCustomForm({ ...customForm, nm: e.target.value })} placeholder="Food name" style={{ marginBottom: 8 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 4, marginBottom: 8 }}>
            {[{ k: 'cal', l: 'Cal' }, { k: 'p', l: 'P' }, { k: 'f', l: 'F' }, { k: 'c', l: 'C' }].map(f => (
              <input key={f.k} className="input" type="number" value={customForm[f.k]} onChange={e => setCustomForm({ ...customForm, [f.k]: e.target.value })} placeholder={f.l} style={{ textAlign: 'center' }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addCustom} className="btn-cta" style={{ flex: 1 }}>Add</button>
            <button onClick={() => setCustomForm(null)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setCustomForm({ nm: '', cal: '', p: '', f: '', c: '' })} style={{ width: '100%', padding: 12, marginTop: 8, background: 'none', border: '1px dashed var(--neutral)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>+ Custom food</button>
      )}

      {/* 7-day calorie/protein history */}
      {(() => {
        const wk = weekDates()
        const last7 = wk.map(d => {
          const dm = (data.meals || []).filter(m => m.date === d)
          return { date: d, day: dayName(d), cal: dm.reduce((a, m) => a + (m.cal || 0), 0), p: dm.reduce((a, m) => a + (m.p || 0), 0) }
        })
        if (!last7.some(d => d.cal > 0)) return null
        const maxCal = Math.max(...last7.map(d => d.cal), 1)
        return (
          <div className="card" style={{ padding: 14, marginTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>7-Day Intake</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 50, marginBottom: 6 }}>
              {last7.map((d, i) => (
                <div key={i} style={{ flex: 1, borderRadius: 3, height: Math.max((d.cal / maxCal) * 42, 3), background: d.date === todayDate ? 'var(--gold)' : d.cal > 0 ? 'var(--bg3)' : 'var(--bg4)' }} title={`${d.day}: ${d.cal} cal, ${d.p}g P`} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {last7.map((d, i) => (
                <span key={i} style={{ fontSize: 8, fontFamily: 'var(--data)', textAlign: 'center', flex: 1, color: d.date === todayDate ? 'var(--gold)' : 'var(--text-dim)' }}>{d.day}</span>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 10, fontFamily: 'var(--data)', color: 'var(--text-muted)' }}>
                Avg: {Math.round(last7.reduce((a, d) => a + d.cal, 0) / (last7.filter(d => d.cal > 0).length || 1))} cal
              </span>
              <span style={{ fontSize: 10, fontFamily: 'var(--data)', color: 'var(--text-muted)' }}>
                Avg P: {Math.round(last7.reduce((a, d) => a + d.p, 0) / (last7.filter(d => d.p > 0).length || 1))}g
              </span>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
