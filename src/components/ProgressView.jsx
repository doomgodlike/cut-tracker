import { useState } from 'react'
import { RANKS, ACHIEVEMENT_DEFS } from '../utils/gamification'

export default function ProgressView({ data, stats, goTo }) {
  const { level, rankInfo, totalSessions, totalPRs, bestStreak, currentStreak, totalCardio, unlockedAchievements, allAchievements } = stats
  const wkSessions = (data.wo || []).filter(w => { const d = new Date(w.date + 'T12:00:00'), now = new Date(); return (now - d) / 86400000 < 7 }).length

  return (
    <div>
      <div style={{ padding: '12px 0 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)' }}>Cut Protocol</div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 32, fontWeight: 700, lineHeight: 1 }}>PROGRESS</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>XP, achievements, streaks</div>
        </div>
        <span style={{ background: 'var(--bg2)', border: '1px solid var(--gold-hairline)', clipPath: 'var(--chamfer-sm)', padding: '6px 14px', fontFamily: 'var(--data)', fontSize: 14, fontWeight: 700, color: 'var(--gold-bright)' }}>LVL {level.level}</span>
      </div>

      {/* Power Level card with victory art */}
      <div className="card" style={{ padding: 16, position: 'relative', overflow: 'hidden' }}>
        <img src="/img/illustrations/D_victory_art_400x300.png" alt="" style={{ position: 'absolute', right: -10, top: -10, width: 140, height: 120, objectFit: 'cover', opacity: 0.5, borderRadius: 8 }} onError={e => { e.target.style.display = 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)' }}>Power Level</div>
          <div style={{ fontFamily: 'var(--data)', fontSize: 42, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{level.totalXP.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{level.xpIntoLevel.toLocaleString()} / {level.xpNeeded.toLocaleString()} XP</div>
          <div className="pbar" style={{ marginTop: 8 }}>
            <div className="pbar-fill" style={{ width: `${level.progress * 100}%`, background: 'var(--gold)' }} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4, textAlign: 'right' }}>{Math.round(level.progress * 100)}%</div>
        </div>
      </div>

      {/* This Week stats */}
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)', margin: '8px 0' }}>This Week</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
        {[
          { v: wkSessions, l: 'Workouts' },
          { v: currentStreak, l: 'Streak' },
          { v: (wkSessions * 100 + (data.cl || []).filter(c => { const d = new Date(c.date + 'T12:00:00'), now = new Date(); return (now - d) / 86400000 < 7 }).length * 50).toLocaleString(), l: 'XP Earned' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: 14, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--data)', fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.7px', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Streak + Achievements side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        {/* Streak card */}
        <div className="card" style={{ padding: 14, position: 'relative', overflow: 'hidden', minHeight: 148 }}>
          <img src="/img/illustrations/C_streak_flame_art_300x400.png" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2 }} onError={e => { e.target.style.display = 'none' }} />
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--data)', fontSize: 48, fontWeight: 700, color: 'var(--gold-bright)', lineHeight: 1 }}>{currentStreak}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>DAYS</div>
            <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Keep the Streak Alive</div>
          </div>
        </div>

        {/* Achievements card */}
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>Achievements</div>
          {allAchievements.slice(0, 3).map(a => {
            const unlocked = unlockedAchievements.includes(a.id)
            return (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, opacity: unlocked ? 1 : 0.4 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{a.name}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{a.desc}</div>
                </div>
                {unlocked ? <span style={{ color: 'var(--success)', fontSize: 12 }}>✓</span> : <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>{a.check ? '' : ''}</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Rank Ladder */}
      <div className="card" style={{ padding: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>Rank Ladder</div>
        {RANKS.map((r, i) => {
          const reached = rankInfo.composite >= r.minScore
          const current = rankInfo.rank.name === r.name
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', opacity: reached ? 1 : 0.35 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: reached ? r.color : 'var(--text-dim)', flex: 1 }}>{r.name}</span>
              <div style={{ flex: 2, height: 4, background: 'var(--bg3)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 2, background: current ? 'var(--energy-blue)' : reached ? r.color : 'var(--bg3)', width: current ? '60%' : reached ? '100%' : '0%' }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: current ? 'var(--energy-blue)' : reached ? 'var(--success)' : 'var(--text-dim)', minWidth: 50, textAlign: 'right' }}>
                {current ? 'ACTIVE' : reached ? 'DONE' : 'LOCKED'}
              </span>
            </div>
          )
        })}
      </div>

      {/* Body link */}
      <button onClick={() => goTo('body')} className="btn-ghost" style={{ width: '100%', marginTop: 8, padding: 14, textAlign: 'center' }}>
        Body Tracking →
      </button>
    </div>
  )
}
