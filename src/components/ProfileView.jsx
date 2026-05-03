import { useState } from 'react'
import { save } from '../utils/storage'
import { RANKS } from '../utils/gamification'
import { resetAllBaselines } from '../utils/engine'

export default function ProfileView({ data, setData, stats, goTo }) {
  const { level, rankInfo, totalSessions, totalPRs, bestStreak, currentStreak, totalCardio, totalMetrics } = stats
  const [showDanger, setShowDanger] = useState(false)

  const bh = (data.bd || []).filter(m => m.wt)
  const currentWt = bh.length ? bh[bh.length - 1].wt : null
  const startWt = bh.length ? bh[0].wt : null

  const doResetAll = () => {
    if (!confirm('Reset ALL exercise baselines? Workout history is kept.')) return
    const nd = resetAllBaselines(data)
    save(nd); setData(nd)
  }
  const doClearAll = () => {
    if (!confirm('DELETE ALL DATA? This cannot be undone.')) return
    if (!confirm('Are you absolutely sure?')) return
    localStorage.clear()
    window.location.reload()
  }
  const doExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `saiyan-mode-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* ── AVATAR HERO ── */}
      <div style={{ position: 'relative', width: '100%', height: 420, overflow: 'hidden', marginBottom: 0 }}>
        <img src="/img/illustrations/avatar_512.png" alt="Varun" style={{
          width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, var(--bg0) 12%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 100%)',
        }} />

        {/* Overlay info */}
        <div style={{ position: 'absolute', bottom: 20, left: 16, right: 16, zIndex: 2 }}>
          <div style={{ fontFamily: 'var(--display)', fontSize: 36, fontWeight: 700, color: 'var(--gold-bright)', lineHeight: 1, textShadow: '0 2px 16px rgba(0,0,0,0.8)' }}>
            VARUN
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginTop: 4 }}>
            {rankInfo.rank.name} · Level {level.level} · {level.title}
          </div>
        </div>

        {/* Power level badge */}
        <div style={{
          position: 'absolute', top: 16, right: 16, zIndex: 2,
          background: 'rgba(11,13,16,0.85)', border: '1px solid var(--gold-hairline)',
          clipPath: 'var(--chamfer-sm)', padding: '8px 14px', textAlign: 'center',
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.7px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Power Level</div>
          <div style={{ fontFamily: 'var(--data)', fontSize: 24, fontWeight: 700, color: 'var(--gold-bright)', lineHeight: 1 }}>
            {level.totalXP.toLocaleString()}
          </div>
        </div>

        {/* Kicker */}
        <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 2 }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)' }}>Cut Protocol</div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>PROFILE</div>
        </div>
      </div>

      {/* ── XP Progress ── */}
      <div className="card" style={{ padding: 16, marginTop: -8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)' }}>XP Progress</span>
          <span style={{ fontFamily: 'var(--data)', fontSize: 12, color: 'var(--text-muted)' }}>
            {level.xpIntoLevel} / {level.xpNeeded} to Level {level.level + 1}
          </span>
        </div>
        <div className="pbar">
          <div className="pbar-fill" style={{ width: `${level.progress * 100}%`, background: 'var(--gold)' }} />
        </div>
      </div>

      {/* ── Warrior Stats Grid ── */}
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)', margin: '12px 0 8px' }}>Warrior Stats</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
        {[
          { v: totalSessions, l: 'Battles', icon: '⚔️' },
          { v: currentStreak, l: 'Streak', icon: '🔥' },
          { v: totalPRs, l: 'PRs', icon: '🏆' },
          { v: totalCardio, l: 'Cardio', icon: '🏃' },
          { v: bestStreak, l: 'Best Streak', icon: '⭐' },
          { v: totalMetrics, l: 'Check-ins', icon: '📏' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontFamily: 'var(--data)', fontSize: 24, fontWeight: 700, lineHeight: 1, color: 'var(--text-primary)' }}>{s.v}</div>
            <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.7px', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── Body Stats ── */}
      {currentWt && (
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>Body Status</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Current</div>
              <div style={{ fontFamily: 'var(--data)', fontSize: 22, fontWeight: 700 }}>{currentWt}kg</div>
            </div>
            {startWt && (
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Change</div>
                <div style={{ fontFamily: 'var(--data)', fontSize: 22, fontWeight: 700, color: currentWt <= startWt ? 'var(--success)' : 'var(--warning)' }}>
                  {(currentWt - startWt).toFixed(1)}kg
                </div>
              </div>
            )}
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Target</div>
              <div style={{ fontFamily: 'var(--data)', fontSize: 22, fontWeight: 700, color: 'var(--energy-blue)' }}>~12% BF</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Goals ── */}
      <div className="card" style={{ padding: 14 }}>
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>Protocol Goals</div>
        {[
          { goal: 'Body recomp to ~12% BF', status: 'active' },
          { goal: 'Run 2km continuous', status: `${(data.cl || []).filter(l => l.type === 'flex').length}/40 sessions` },
          { goal: '4 workouts per week', status: 'active' },
          { goal: 'Hit protein daily (150g)', status: 'active' },
        ].map((g, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--gold-hairline)' : 'none' }}>
            <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{g.goal}</span>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.6px', color: 'var(--energy-blue)', textTransform: 'uppercase' }}>{g.status}</span>
          </div>
        ))}
      </div>

      {/* ── Rank ── */}
      <div className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14, borderColor: 'var(--gold)' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 8, background: 'var(--bg3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, border: '1px solid var(--gold-hairline)',
        }}>
          {rankInfo.rank.icon}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 20, fontWeight: 700, color: rankInfo.rank.color, textTransform: 'uppercase' }}>
            {rankInfo.rank.name}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < rankInfo.stars ? 'var(--gold)' : 'var(--bg3)' }} />
            ))}
            <span style={{ fontSize: 10, fontFamily: 'var(--data)', color: 'var(--text-muted)', marginLeft: 4 }}>MMR {rankInfo.composite}</span>
          </div>
        </div>
      </div>

      {/* ── Quick Links ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
        <button onClick={() => goTo('body')} className="btn-ghost" style={{ width: '100%', padding: 14, textAlign: 'center' }}>Body Tracking</button>
        <button onClick={() => goTo('progress')} className="btn-ghost" style={{ width: '100%', padding: 14, textAlign: 'center' }}>Rank Ladder</button>
      </div>

      {/* ── Data Management ── */}
      <div className="card" style={{ padding: 14, marginTop: 12 }}>
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>Data Management</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button onClick={doExport} style={{ width: '100%', padding: 10, background: 'var(--bg3)', border: '1px solid var(--neutral)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, clipPath: 'var(--chamfer-sm)' }}>
            Export Backup (JSON)
          </button>
          <button onClick={() => setShowDanger(!showDanger)} style={{ width: '100%', padding: 10, background: 'var(--bg3)', border: '1px solid var(--neutral)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, clipPath: 'var(--chamfer-sm)' }}>
            {showDanger ? 'Hide' : 'Show'} Danger Zone
          </button>
          {showDanger && (
            <div className="fade-in" style={{ padding: 12, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', clipPath: 'var(--chamfer-sm)' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={doResetAll} style={{ flex: 1, padding: 10, background: 'none', border: '1px solid var(--warning)', color: 'var(--warning)', cursor: 'pointer', fontSize: 11, clipPath: 'var(--chamfer-sm)' }}>
                  Reset Baselines
                </button>
                <button onClick={doClearAll} style={{ flex: 1, padding: 10, background: 'none', border: '1px solid var(--error)', color: 'var(--error)', cursor: 'pointer', fontSize: 11, clipPath: 'var(--chamfer-sm)' }}>
                  Delete All Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── App version ── */}
      <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.6px' }}>
        SAIYAN MODE v6.0 · CUT PROTOCOL
      </div>
    </div>
  )
}
