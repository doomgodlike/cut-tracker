import { useState, useEffect, useCallback } from 'react'
import { load, save } from './utils/storage'
import { calcFullStats, unlockAchievement } from './utils/gamification'
import Dashboard from './components/Dashboard'
import WorkoutView from './components/WorkoutView'
import NutritionView from './components/NutritionView'
import CardioView from './components/CardioView'
import ProgressView from './components/ProgressView'
import BodyView from './components/BodyView'
import ProfileView from './components/ProfileView'
import AchievementToast from './components/AchievementToast'

const NAV = [
  { id: 'dashboard', label: 'Dash', icon: '/img/icons/01_dashboard_home_flame.png' },
  { id: 'workout', label: 'Workout', icon: '/img/icons/02_workout_barbell.png' },
  { id: 'food', label: 'Food', icon: '/img/icons/03_nutrition_bowl.png' },
  { id: 'cardio', label: 'Cardio', icon: '/img/icons/04_cardio_heart_rate.png' },
  { id: 'progress', label: 'Progress', icon: '/img/icons/05_progress_trending_up.png' },
  { id: 'profile', label: 'Profile', icon: '/img/icons/06_body_ruler_outline.png' },
]

export default function App() {
  const [nav, setNav] = useState('dashboard')
  const [data, setData] = useState(load)
  const [toast, setToast] = useState(null)
  const [xpPopup, setXpPopup] = useState(null)

  const stats = calcFullStats(data)

  useEffect(() => {
    if (stats.newAchievements.length > 0) {
      const first = stats.newAchievements[0]
      let nd = data
      stats.newAchievements.forEach(a => { nd = unlockAchievement(nd, a.id) })
      save(nd); setData(nd); setToast(first)
    }
  }, [stats.totalSessions, stats.totalPRs, stats.totalCardio, stats.totalMetrics, stats.bestStreak])

  const onWorkoutComplete = useCallback((xp, workout) => {
    setXpPopup({ xp, name: workout.dNm })
    setTimeout(() => setXpPopup(null), 2500)
  }, [])

  const goTo = (tab) => setNav(tab)

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 16px 90px', minHeight: '100vh' }}>
      <div className="fade-in" key={nav}>
        {nav === 'dashboard' && <Dashboard data={data} setData={setData} stats={stats} goTo={goTo} />}
        {nav === 'workout' && <WorkoutView data={data} setData={setData} onWorkoutComplete={onWorkoutComplete} />}
        {nav === 'food' && <NutritionView data={data} setData={setData} />}
        {nav === 'cardio' && <CardioView data={data} setData={setData} />}
        {nav === 'progress' && <ProgressView data={data} setData={setData} stats={stats} goTo={goTo} />}
        {nav === 'body' && <BodyView data={data} setData={setData} />}
        {nav === 'profile' && <ProfileView data={data} setData={setData} stats={stats} goTo={goTo} />}
      </div>

      {xpPopup && (
        <div style={{
          position: 'fixed', top: 80, left: '50%', zIndex: 999,
          background: 'var(--bg2)', border: '1px solid var(--gold-hairline)',
          padding: '10px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          animation: 'fadeInScale 0.2s ease-out', textAlign: 'center',
          clipPath: 'var(--chamfer-sm)',
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--data)', color: 'var(--gold-bright)' }}>+{xpPopup.xp} XP</div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>{xpPopup.name}</div>
        </div>
      )}

      {toast && <AchievementToast achievement={toast} onDone={() => setToast(null)} />}

      {/* Bottom Nav — matches mockup exactly */}
      <div className="bottom-nav">
        <div className="bottom-nav-inner">
          {NAV.map(({ id, label, icon }) => {
            const active = nav === id
            return (
              <button key={id} onClick={() => setNav(id)} className={`nav-btn${active ? ' active' : ''}`}>
                <img src={icon} alt={label} className="nav-icon" />
                <span className="nav-label">{label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
