import { useState, useEffect, useRef } from 'react'
import initialData from '../data/fixedLayer.json'
import { getSession, logout, refreshActivity, SESSION_KEY } from '../services/auth'
import LoginPage from './LoginPage.jsx'
import ScenarioPage from './pages/ScenarioPage.jsx'
import NpcPage from './pages/NpcPage.jsx'
import SolutionPage from './pages/SolutionPage.jsx'
import EvidencePage from './pages/EvidencePage.jsx'
import SlotsPage from './pages/SlotsPage.jsx'
import CaseTypePage from './pages/CaseTypePage.jsx'
import ScenePage from './pages/ScenePage.jsx'
import PreviewPage from './pages/PreviewPage.jsx'
import InfoPage from './pages/InfoPage.jsx'

const STORAGE_KEY = 'csi_fixedLayer'

const NAV_ITEMS = [
  { key: 'scenario', label: '📋 시나리오 정보' },
  { key: 'npc',      label: '👥 등장인물 관리' },
  { key: 'solution', label: '🎯 정답 설정' },
  { key: 'evidence', label: '🔍 증거물 목록' },
  { key: 'slots',    label: '🤖 AI 생성 설정' },
  { key: 'casetype', label: '🗂️ 사건 유형 관리' },
  { key: 'scene',    label: '🎬 씬 시나리오' },
  { key: 'preview',  label: '👁️ 미리보기' },
  { key: 'info',     label: '📖 개발자 정보', divider: true },
]

const S = {
  root: {
    display: 'flex', height: '100vh', fontFamily: 'sans-serif',
    background: '#f5f5f5', color: '#1a1a1a',
  },
  sidebar: {
    width: 220, background: '#1e1e2e', color: '#cdd6f4',
    display: 'flex', flexDirection: 'column', flexShrink: 0,
  },
  sidebarHeader: {
    padding: '20px 16px 16px', borderBottom: '1px solid #313244',
  },
  sidebarTitle: {
    fontSize: 13, fontWeight: 700, color: '#cba6f7', letterSpacing: 1,
    textTransform: 'uppercase', margin: 0,
  },
  sidebarSub: { fontSize: 11, color: '#6c7086', marginTop: 4, margin: 0 },
  nav: { flex: 1, padding: '12px 0' },
  navItem: (active) => ({
    display: 'block', width: '100%', textAlign: 'left',
    padding: '10px 16px', border: 'none', cursor: 'pointer',
    fontSize: 13, borderRadius: 0,
    background: active ? '#313244' : 'transparent',
    color: active ? '#cdd6f4' : '#9399b2',
    borderLeft: active ? '3px solid #cba6f7' : '3px solid transparent',
    transition: 'background 0.15s',
  }),
  backBtn: {
    margin: '0 12px 12px', padding: '8px 12px', border: '1px solid #313244',
    borderRadius: 6, background: 'transparent', color: '#6c7086',
    cursor: 'pointer', fontSize: 12, textAlign: 'center',
  },
  userBox: {
    margin: '12px 12px 8px', padding: '10px 12px',
    borderTop: '1px solid #313244',
  },
  userInfo: { fontSize: 11, color: '#9399b2', marginBottom: 8, wordBreak: 'break-all' },
  userRole: { color: '#cba6f7', fontWeight: 600 },
  logoutBtn: {
    width: '100%', padding: '7px 12px', border: '1px solid #45475a',
    borderRadius: 6, background: 'transparent', color: '#f38ba8',
    cursor: 'pointer', fontSize: 12, textAlign: 'center',
  },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topbar: {
    height: 52, background: '#fff', borderBottom: '1px solid #e0e0e0',
    display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0,
  },
  topbarTitle: { fontSize: 16, fontWeight: 600, margin: 0, flex: 1, color: '#1a1a1a' },
  exportBtn: {
    padding: '5px 12px', border: '1px solid #e4e4e7', borderRadius: 5,
    background: '#fafafa', color: '#52525b', cursor: 'pointer', fontSize: 12,
  },
  content: { flex: 1, overflow: 'auto', padding: 24 },
  placeholder: {
    background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8,
    padding: 32, color: '#9399b2', fontSize: 14, textAlign: 'center',
  },
}

function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : initialData
  } catch {
    return initialData
  }
}

function exportJson(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'fixedLayer.json'
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminApp() {
  const [session, setSession] = useState(getSession)
  const [page, setPage] = useState('scenario')
  const [data, setData] = useState(loadData)
  const current = NAV_ITEMS.find(n => n.key === page)
  const lastRefresh = useRef(0)

  // 사용자 활동 감지 → 세션 활동 시각 갱신 (30초 쓰로틀)
  // keydown/click 만 활동으로 간주 (mousemove 는 idle 만료를 무력화하므로 제외).
  useEffect(() => {
    if (!session) return
    const onActivity = () => {
      // 이미 만료됐으면 즉시 로그인 화면으로 (1분 interval 대기 없이)
      if (!getSession()) { setSession(null); return }
      const now = Date.now()
      if (now - lastRefresh.current < 30 * 1000) return
      lastRefresh.current = now
      refreshActivity()
    }
    window.addEventListener('keydown', onActivity)
    window.addEventListener('click', onActivity)
    return () => {
      window.removeEventListener('keydown', onActivity)
      window.removeEventListener('click', onActivity)
    }
  }, [session])

  // 1분마다 만료 체크 → 만료 시 자동 로그아웃
  useEffect(() => {
    if (!session) return
    const timer = setInterval(() => {
      if (!getSession()) setSession(null)
    }, 60 * 1000)
    return () => clearInterval(timer)
  }, [session])

  // 다른 탭에서 로그인/로그아웃/만료 시 현재 탭 동기화
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === SESSION_KEY) setSession(getSession())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const handleLogout = () => {
    logout()
    setSession(null)
  }

  if (!session) return <LoginPage onLogin={setSession} />

  const handleSave = (updated) => {
    setData(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const PAGE_MAP = {
    scenario: <ScenarioPage data={data} onSave={handleSave} />,
    npc:      <NpcPage      data={data} onSave={handleSave} />,
    solution: <SolutionPage data={data} onSave={handleSave} />,
    evidence: <EvidencePage data={data} onSave={handleSave} />,
    slots:    <SlotsPage    data={data} onSave={handleSave} />,
    casetype: <CaseTypePage data={data} onSave={handleSave} />,
    scene:    <ScenePage />,
    preview:  <PreviewPage data={data} />,
    info: <InfoPage />,
  }

  return (
    <div style={S.root}>
      <aside style={S.sidebar}>
        <div style={S.sidebarHeader}>
          <p style={S.sidebarTitle}>Admin</p>
          <p style={S.sidebarSub}>고정층 에디터</p>
        </div>
        <nav style={S.nav}>
          {NAV_ITEMS.map(item => (
            <div key={item.key}>
              {item.divider && (
                <div style={{ borderTop: '1px solid #313244', margin: '8px 0' }} />
              )}
              <button
                style={S.navItem(page === item.key)}
                onClick={() => setPage(item.key)}
              >
                {item.label}
              </button>
            </div>
          ))}
        </nav>
        <div style={S.userBox}>
          <p style={S.userInfo}>
            {session.userId} · <span style={S.userRole}>{session.role}</span>
          </p>
          <button style={S.logoutBtn} onClick={handleLogout}>
            로그아웃
          </button>
        </div>
        <button style={S.backBtn} onClick={() => { window.location.href = '/' }}>
          ← 플레이어 씬으로
        </button>
      </aside>

      <main style={S.main}>
        <div style={S.topbar}>
          <h1 style={S.topbarTitle}>{current?.label}</h1>
          <button style={S.exportBtn} onClick={() => exportJson(data)}>
            JSON 내보내기
          </button>
        </div>
        <div style={S.content}>
          {PAGE_MAP[page]}
        </div>
      </main>
    </div>
  )
}
