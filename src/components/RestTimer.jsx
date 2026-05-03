import { useState, useEffect, useRef } from 'react'

export default function RestTimer() {
  const [active, setActive] = useState(false)
  const [left, setLeft] = useState(120)
  const interval = useRef(null)

  useEffect(() => {
    if (active && left > 0) {
      interval.current = setInterval(() => setLeft(l => l - 1), 1000)
      return () => clearInterval(interval.current)
    }
    if (left <= 0 && active) { setActive(false); try { navigator.vibrate?.(200) } catch {} }
  }, [active, left])

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {active ? (
        <>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--blue-hairline)',
            clipPath: 'var(--chamfer-sm)', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.7px', textTransform: 'uppercase', color: 'var(--energy-blue)' }}>Rest Timer</span>
            <span style={{
              fontFamily: 'var(--data)', fontSize: 22, fontWeight: 700,
              color: left <= 10 ? 'var(--error)' : left <= 30 ? 'var(--warning)' : 'var(--energy-blue)',
              ...(left <= 10 ? { animation: 'pulse 0.5s ease-in-out infinite' } : {}),
            }}>{fmt(left)}</span>
            <button onClick={() => { setActive(false); clearInterval(interval.current) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}>⏸</button>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', gap: 4 }}>
          {[60, 90, 120, 180].map(s => (
            <button key={s} onClick={() => { setLeft(s); setActive(true) }}
              style={{ background: 'var(--bg3)', border: '1px solid var(--neutral)', borderRadius: 4, padding: '4px 8px', color: 'var(--text-secondary)', fontSize: 11, fontFamily: 'var(--data)', fontWeight: 600, cursor: 'pointer' }}>
              {s < 60 ? s + 's' : (s / 60) + 'm'}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
