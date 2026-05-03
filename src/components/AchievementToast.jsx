import { useEffect } from 'react'

export default function AchievementToast({ achievement, onDone }) {
  useEffect(() => {
    // Play achievement sound
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator(); const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'sine'; osc.frequency.setValueAtTime(523, ctx.currentTime)
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1)
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5)
    } catch {}
    try { navigator.vibrate?.(200) } catch {}
    const t = setTimeout(onDone, 4000); return () => clearTimeout(t)
  }, [onDone])
  if (!achievement) return null
  return (
    <div style={{
      position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', zIndex: 999,
      background: 'var(--bg2)', border: '1px solid var(--gold-hairline)',
      clipPath: 'var(--chamfer)', padding: '14px 20px',
      boxShadow: '0 8px 32px rgba(214,136,74,0.15), 0 4px 16px rgba(0,0,0,0.5)',
      animation: 'slideUp 0.3s ease-out', display: 'flex', alignItems: 'center', gap: 12, maxWidth: 340,
    }}>
      <div style={{ width: 40, height: 30, borderRadius: 4, overflow: 'hidden', background: 'var(--bg3)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${achievement.item}.png`}
          alt={achievement.name} width={36} height={26} style={{ borderRadius: 3, objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} />
      </div>
      <div>
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)' }}>Item Acquired</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{achievement.name}</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{achievement.desc}</div>
      </div>
    </div>
  )
}
