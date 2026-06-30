import { useState, useEffect, useRef } from 'react'
import { getSession, logout, refreshActivity, SESSION_KEY } from '../services/auth'
import { getScenario, getScenarioMeta, saveScenario, canEdit } from '../services/db'
import { C, AdminStyles } from './shared.jsx'
import LoginPage from './LoginPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import ScenarioPage from './pages/ScenarioPage.jsx'
import NpcPage from './pages/NpcPage.jsx'
import SolutionPage from './pages/SolutionPage.jsx'
import EvidencePage from './pages/EvidencePage.jsx'
import SlotsPage from './pages/SlotsPage.jsx'
import CaseTypePage from './pages/CaseTypePage.jsx'
import ScenePage from './pages/ScenePage.jsx'
import PreviewPage from './pages/PreviewPage.jsx'
import InfoPage from './pages/InfoPage.jsx'

// 시나리오 편집 nav (시나리오를 연 상태에서만 표시)
const NAV_EDIT = [
  { key: 'scenario', label: '📋 시나리오 정보' },
  { key: 'npc',      label: '👥 등장인물 관리' },
  { key: 'solution', label: '🎯 정답 설정' },
  { key: 'evidence', label: '🔍 증거물 목록' },
  { key: 'slots',    label: '🤖 AI 생성 설정' },
  { key: 'casetype', label: '🗂️ 사건 유형 관리' },
  { key: 'scene',    label: '🎬 씬 시나리오' },
  { key: 'preview',  label: '👁️ 미리보기' },
]

const LABELS = {
  projects: '📁 프로젝트 목록',
  info: '📖 개발자 정보',
  ...Object.fromEntries(NAV_EDIT.map((n) => [n.key, n.label])),
}

const S = {
  root: {
    display: 'flex', height: '100vh',
    background: C.appBg, color: C.txt,
  },
  sidebar: {
    width: 224, background: '#0d0d14', color: C.txt,
    borderRight: `1px solid ${C.line}`,
    display: 'flex', flexDirection: 'column', flexShrink: 0,
  },
  sidebarHeader: {
    padding: '22px 18px 16px', borderBottom: `1px solid ${C.line}`,
  },
  sidebarTitle: {
    fontSize: 13, fontWeight: 600, color: C.accent, letterSpacing: 1.5,
    textTransform: 'uppercase', margin: 0, fontFamily: 'Space Grotesk, sans-serif',
  },
  sidebarSub: { fontSize: 11, color: C.txtMute, marginTop: 4, margin: 0 },
  nav: { flex: 1, padding: '12px 10px', overflowY: 'auto' },
  navItem: (active) => ({
    display: 'block', width: '100%', textAlign: 'left',
    padding: '9px 12px', border: 'none', cursor: 'pointer',
    fontSize: 12.5, borderRadius: 9, marginBottom: 2,
    background: active ? C.accentBg : 'transparent',
    color: active ? C.txt : C.txtMute,
    fontWeight: active ? 600 : 500,
    boxShadow: active ? `inset 2px 0 0 ${C.accent}` : 'none',
    transition: 'background 0.2s ease, color 0.2s ease',
  }),
  editingLabel: {
    padding: '10px 12px 4px', fontSize: 10, color: C.txtFaint,
    letterSpacing: 1, textTransform: 'uppercase',
  },
  editingTitle: {
    padding: '0 12px 8px', fontSize: 12.5, color: C.txt, fontWeight: 600,
    wordBreak: 'break-all',
  },
  divider: { borderTop: `1px solid ${C.line}`, margin: '10px 6px' },
  backBtn: {
    margin: '0 12px 14px', padding: '8px 12px', border: `1px solid ${C.line}`,
    borderRadius: 9, background: 'transparent', color: C.txtMute,
    cursor: 'pointer', fontSize: 12, textAlign: 'center',
  },
  userBox: {
    margin: '10px 12px 6px', padding: '12px',
    borderTop: `1px solid ${C.line}`,
  },
  userInfo: { fontSize: 11, color: C.txtDim, marginBottom: 9, wordBreak: 'break-all' },
  userRole: { color: C.accent, fontWeight: 600 },
  logoutBtn: {
    width: '100%', padding: '8px 12px', border: `1px solid ${C.dangerBd}`,
    borderRadius: 9, background: C.dangerBg, color: C.danger,
    cursor: 'pointer', fontSize: 12, textAlign: 'center', fontWeight: 600,
  },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topbar: {
    height: 56, background: 'rgba(13,13,20,0.7)', borderBottom: `1px solid ${C.line}`,
    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    display: 'flex', alignItems: 'center', padding: '0 26px', gap: 12, flexShrink: 0,
  },
  topbarTitle: {
    fontSize: 16, fontWeight: 600, margin: 0, flex: 1, color: C.txt,
    fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.01em',
  },
  exportBtn: {
    padding: '6px 14px', border: `1px solid ${C.line}`, borderRadius: 999,
    background: 'rgba(255,255,255,0.06)', color: C.txtDim, cursor: 'pointer', fontSize: 12, fontWeight: 600,
  },
  content: { flex: 1, overflow: 'auto', padding: 26 },
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
  const [page, setPage] = useState('projects')
  const [editingId, setEditingId] = useState(null)
  const [data, setData] = useState(null)
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

  // 계정이 바뀌면(로그아웃·재로그인·만료 등) 편집 상태 초기화.
  // 다른 계정의 시나리오가 "편집 중"에 남아 노출되는 권한 누수 방지.
  const userId = session?.userId
  useEffect(() => {
    setEditingId(null)
    setData(null)
    setPage('projects')
  }, [userId])

  const handleLogout = () => {
    logout()
    setSession(null)
  }

  if (!session) return <LoginPage onLogin={setSession} />

  // 프로젝트 목록에서 시나리오 열기. 편집은 owner 만 — 데이터 레이어에서도 가드.
  const openScenario = (id) => {
    if (!canEdit(getScenarioMeta(id), session.userId)) return
    const d = getScenario(id)
    if (!d) return
    setEditingId(id)
    setData(d)
    setPage('scenario')
  }

  const handleSave = (updated) => {
    setData(updated)
    if (editingId) saveScenario(editingId, updated)
  }

  const editing = editingId && data
  const isEditPage = NAV_EDIT.some((n) => n.key === page)

  // content 결정 — 편집 페이지인데 시나리오 미선택이면 목록으로 강등
  let content
  if (page === 'info') {
    content = <InfoPage />
  } else if (page === 'projects' || !editing || !isEditPage) {
    content = <ProjectsPage userId={session.userId} onOpen={openScenario} />
  } else {
    const PAGE_MAP = {
      scenario: <ScenarioPage data={data} onSave={handleSave} />,
      npc:      <NpcPage      data={data} onSave={handleSave} />,
      solution: <SolutionPage data={data} onSave={handleSave} />,
      evidence: <EvidencePage data={data} onSave={handleSave} />,
      slots:    <SlotsPage    data={data} onSave={handleSave} />,
      casetype: <CaseTypePage data={data} onSave={handleSave} />,
      scene:    <ScenePage />,
      preview:  <PreviewPage data={data} />,
    }
    content = PAGE_MAP[page]
  }

  const showExport = editing && isEditPage && page !== 'scene'

  return (
    <div className="csi-admin" style={S.root}>
      <AdminStyles />
      <aside style={S.sidebar}>
        <div style={S.sidebarHeader}>
          <p style={S.sidebarTitle}>Admin</p>
          <p style={S.sidebarSub}>고정층 에디터</p>
        </div>
        <nav style={S.nav}>
          <button style={S.navItem(page === 'projects')} onClick={() => setPage('projects')}>
            📁 프로젝트 목록
          </button>

          {editing && (
            <>
              <div style={S.divider} />
              <div style={S.editingLabel}>편집 중</div>
              <div style={S.editingTitle}>{data.scenario?.title ?? '제목 없음'}</div>
              {NAV_EDIT.map((item) => (
                <button
                  key={item.key}
                  style={S.navItem(page === item.key)}
                  onClick={() => setPage(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </>
          )}

          <div style={S.divider} />
          <button style={S.navItem(page === 'info')} onClick={() => setPage('info')}>
            📖 개발자 정보
          </button>
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
          <h1 style={S.topbarTitle}>{LABELS[page] ?? '프로젝트 목록'}</h1>
          {showExport && (
            <button style={S.exportBtn} onClick={() => exportJson(data)}>
              JSON 내보내기
            </button>
          )}
        </div>
        <div style={S.content}>
          {content}
        </div>
      </main>
    </div>
  )
}
