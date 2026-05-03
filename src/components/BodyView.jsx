import { useState } from 'react'
import { save, today } from '../utils/storage'
import { awardXP } from '../utils/gamification'
import { MEASUREMENTS } from '../data/plans'

export default function BodyView({ data, setData }) {
  const [tab, setTab] = useState('measurements')
  const [vals, setVals] = useState({})
  const [bw, setBw] = useState(''); const [wa, setWa] = useState('')

  const getHistory = (key) => (data.bd || []).filter(m => m[key]).map(m => ({ d: m.date, v: m[key] }))
  const latest = (key) => { const h = getHistory(key); return h.length ? h[h.length - 1].v : null }
  const bh = (data.bd || []).filter(m => m.wt).slice(-14)
  const trend = bh.length >= 2 ? (bh[bh.length - 1].wt - bh[bh.length - 2].wt).toFixed(1) : null
  const currentWt = latest('wt')

  const logCheckIn = () => {
    const entry = { date: today() }; let hasAny = false
    if (bw) { entry.wt = +bw; hasAny = true }
    if (wa) { entry.wa = +wa; hasAny = true }
    MEASUREMENTS.forEach(m => { if (vals[m.id]) { entry[m.id] = +vals[m.id]; hasAny = true } })
    if (!hasAny) return
    let nd = { ...data, bd: [...(data.bd || []), entry] }
    nd = awardXP(nd, 25, 'Body check-in')
    save(nd); setBw(''); setWa(''); setVals({}); setData(nd)
  }

  return (
    <div>
      <div style={{ padding: '12px 0 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)' }}>Cut Protocol</div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 32, fontWeight: 700, lineHeight: 1 }}>BODY</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Measurements and trends</div>
        </div>
        <button onClick={logCheckIn} style={{ background: 'var(--bg2)', border: '1px solid var(--gold-hairline)', clipPath: 'var(--chamfer-sm)', padding: '6px 14px', fontFamily: 'var(--data)', fontSize: 14, fontWeight: 700, color: 'var(--energy-blue)', cursor: 'pointer' }}>CHECK-IN</button>
      </div>

      {/* Body Stats Hero */}
      <div className="card" style={{ padding: 16, position: 'relative', overflow: 'hidden' }}>
        <img src="/img/illustrations/E_rest_day_art_400x300.png" alt="" style={{ position: 'absolute', right: -10, top: -10, width: 130, height: 110, objectFit: 'cover', opacity: 0.5, borderRadius: 8 }} onError={e => { e.target.style.display = 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)' }}>Current Body Stats</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
            <span style={{ fontFamily: 'var(--data)', fontSize: 42, fontWeight: 700, lineHeight: 1 }}>{currentWt || '—'}</span>
            <span style={{ fontFamily: 'var(--data)', fontSize: 16, color: 'var(--text-muted)' }}>kg</span>
          </div>
          {trend !== null && (
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              Trend: {parseFloat(trend) < 0 ? '' : '+'}{trend}kg this week · {parseFloat(trend) <= 0 ? 'protocol on track' : 'watch intake'}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '8px 0' }}>
        {['measurements', 'trends'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`btn-ghost${tab === t ? ' active' : ''}`} style={{ width: '100%', textAlign: 'center' }}>{t}</button>
        ))}
      </div>

      {tab === 'measurements' && (
        <div className="fade-in">
          {/* Quick inputs */}
          <div className="card" style={{ padding: 14 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" type="number" step="0.1" value={bw} onChange={e => setBw(e.target.value)} placeholder={`Weight ${currentWt ? `(${currentWt})` : 'kg'}`} style={{ flex: 1 }} />
              <input className="input" type="number" step="0.1" value={wa} onChange={e => setWa(e.target.value)} placeholder={`Waist ${latest('waist') ? `(${latest('waist')})` : 'cm'}`} style={{ flex: 1 }} />
            </div>
          </div>

          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)', margin: '8px 0' }}>Measurements</div>

          {/* Measurement rows with change indicators */}
          {[
            { key: 'wt', nm: 'Weight', unit: 'kg' },
            { key: 'bf', nm: 'Body Fat', unit: '%' },
            { key: 'chest', nm: 'Chest', unit: 'cm' },
            { key: 'waist', nm: 'Waist', unit: 'cm' },
            { key: 'arm_l', nm: 'Arms', unit: 'cm' },
            { key: 'thigh_l', nm: 'Thighs', unit: 'cm' },
            { key: 'calves', nm: 'Calves', unit: 'cm' },
          ].map(m => {
            const h = getHistory(m.key)
            const prev = h.length >= 2 ? h[h.length - 2].v : null
            const curr = h.length >= 1 ? h[h.length - 1].v : null
            const delta = prev && curr ? (curr - prev).toFixed(1) : null
            const shrinkGood = m.key === 'wt' || m.key === 'waist' || m.key === 'bf'
            return (
              <div key={m.key} className="meal-row" style={{ marginBottom: 6 }}>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{m.nm}</span>
                {delta && (
                  <span style={{ fontSize: 10, fontFamily: 'var(--data)', fontWeight: 600, marginRight: 8, color: (shrinkGood ? parseFloat(delta) <= 0 : parseFloat(delta) >= 0) ? 'var(--success)' : 'var(--warning)' }}>
                    {parseFloat(delta) >= 0 ? '+' : ''}{delta}
                  </span>
                )}
                <input className="input" type="number" step="0.1" value={vals[m.key] || ''} onChange={e => setVals({ ...vals, [m.key]: e.target.value })}
                  placeholder={curr ? `${curr} ${m.unit}` : m.unit}
                  style={{ width: 100, textAlign: 'right', fontSize: 16, fontFamily: 'var(--data)', fontWeight: 700, background: 'transparent', border: 'none', padding: '4px 0' }} />
              </div>
            )
          })}
        </div>
      )}

      {tab === 'trends' && (
        <div className="fade-in">
          {/* Weight over time chart */}
          {bh.length > 1 ? (
            <div className="card" style={{ padding: 14 }}>
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>Weight Over Time</div>
              <div style={{ height: 80, display: 'flex', alignItems: 'flex-end', gap: 2 }}>
                {bh.map((m, i) => {
                  const mn = Math.min(...bh.map(x => x.wt)) - 0.5, mx = Math.max(...bh.map(x => x.wt)) + 0.5
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: i === bh.length - 1 ? 'var(--gold-bright)' : 'var(--energy-blue)', marginBottom: Math.max(((m.wt - mn) / (mx - mn || 1)) * 60, 4) }} />
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{bh[0].wt}kg</span>
                <span style={{ fontSize: 10, color: bh[bh.length - 1].wt <= bh[0].wt ? 'var(--success)' : 'var(--warning)' }}>
                  {(bh[bh.length - 1].wt - bh[0].wt).toFixed(1)}kg
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{bh[bh.length - 1].wt}kg</span>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--text-dim)' }}>Log 2+ check-ins to see trends.</div>
          )}
        </div>
      )}

      {/* Add Body Check-In */}
      <button onClick={logCheckIn} className="btn-cta" style={{ marginTop: 12 }}>Add Body Check-In</button>
    </div>
  )
}
