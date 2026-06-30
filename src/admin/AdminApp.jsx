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

// 페이지 아이콘 — 일관된 1.5 stroke 커스텀 라인 세트 (이모지 대체).
const ICON_PATHS = {
  projects: <path d="M4 7.5A1.5 1.5 0 0 1 5.5 6h3l1.8 2H18a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 18 18H5.5A1.5 1.5 0 0 1 4 16.5Z" />,
  scenario: (
    <>
      <path d="M13.5 4H7a1.5 1.5 0 0 0-1.5 1.5v13A1.5 1.5 0 0 0 7 20h10a1.5 1.5 0 0 0 1.5-1.5V9Z" />
      <path d="M13.5 4v5h5" />
      <path d="M8.5 13h7M8.5 16h5" />
    </>
  ),
  npc: (
    <>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.8 18.5a5.2 5.2 0 0 1 10.4 0" />
      <path d="M15.5 6a3 3 0 0 1 0 5.6" />
      <path d="M17.2 18.5a5.2 5.2 0 0 0-2-4.1" />
    </>
  ),
  solution: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
  evidence: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.6-3.6" />
    </>
  ),
  slots: (
    <>
      <path d="M12 4.5l1.7 4.3 4.3 1.7-4.3 1.7L12 16.5l-1.7-4.3L6 10.5l4.3-1.7Z" />
      <path d="M18.5 5l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6Z" />
    </>
  ),
  casetype: (
    <>
      <path d="M4.5 12.8V6A1.5 1.5 0 0 1 6 4.5h6.8a1.5 1.5 0 0 1 1.06.44l5.2 5.2a1.5 1.5 0 0 1 0 2.12l-6.8 6.8a1.5 1.5 0 0 1-2.12 0l-5.2-5.2A1.5 1.5 0 0 1 4.5 12.8Z" />
      <circle cx="8.5" cy="8.5" r="1.3" />
    </>
  ),
  scene: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M4 9.5h16M4 14.5h16M9 5v14M15 5v14" />
    </>
  ),
  preview: (
    <>
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  info: (
    <>
      <path d="M12 6.8C10.6 5.6 8.6 5 6.2 5A1.2 1.2 0 0 0 5 6.2v10.3a1.2 1.2 0 0 0 1.2 1.2c2.4 0 4.4.6 5.8 1.8" />
      <path d="M12 6.8C13.4 5.6 15.4 5 17.8 5A1.2 1.2 0 0 1 19 6.2v10.3a1.2 1.2 0 0 1-1.2 1.2c-2.4 0-4.4.6-5.8 1.8" />
      <path d="M12 6.8V20.1" />
    </>
  ),
}

function NavIcon({ name, size = 16 }) {
  const paths = ICON_PATHS[name]
  if (!paths) return null
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }} aria-hidden="true">
      {paths}
    </svg>
  )
}

// 브랜드 마크 — 포렌식 지문 엠블럼.
function Fingerprint({ size = 19 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 10.5a6 6 0 0 1 11.3-2.7" />
      <path d="M8.7 13a3.3 3.3 0 0 1 6.5.8c0 2-.3 4-1 5.9" />
      <path d="M12 13.3c0 2.3-.4 4.5-1.2 6.5" />
      <path d="M6.3 14c.3-1 .4-2 .4-3" />
      <path d="M17.4 11.4c0 2.6-.6 5.1-1.7 7.4" />
    </svg>
  )
}

// 시나리오 편집 nav (시나리오를 연 상태에서만 표시)
const NAV_EDIT = [
  { key: 'scenario', label: '시나리오 정보' },
  { key: 'npc',      label: '등장인물 관리' },
  { key: 'solution', label: '정답 설정' },
  { key: 'evidence', label: '증거물 목록' },
  { key: 'slots',    label: 'AI 생성 설정' },
  { key: 'casetype', label: '사건 유형 관리' },
  { key: 'scene',    label: '씬 시나리오' },
  { key: 'preview',  label: '미리보기' },
]

const LABELS = {
  projects: '프로젝트 목록',
  info: '개발자 정보',
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
  brand: {
    display: 'flex', alignItems: 'center', gap: 11, width: '100%',
    padding: '17px 16px 16px', textAlign: 'left',
    background: 'none', border: 'none', borderBottom: `1px solid ${C.line}`,
    cursor: 'pointer',
  },
  brandMark: {
    width: 36, height: 36, flexShrink: 0, borderRadius: 11,
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accent,
    background: 'linear-gradient(160deg, rgba(185,164,240,0.24), rgba(185,164,240,0.05))',
    border: `1px solid ${C.accentBd}`,
    boxShadow: '0 1px 1px rgba(255,255,255,0.10) inset, 0 6px 16px -8px rgba(150,124,232,0.5)',
  },
  brandText: { display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 },
  brandWord: {
    fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 600,
    color: C.txt, letterSpacing: '-0.02em', lineHeight: 1,
  },
  brandSub: {
    fontSize: 10.5, color: C.txtMute, letterSpacing: '0.05em', lineHeight: 1,
  },
  nav: { flex: 1, padding: '12px 10px', overflowY: 'auto' },
  navItem: (active) => ({
    display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
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
    display: 'flex', alignItems: 'center', gap: 10,
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
        <button
          className="csi-brand"
          style={S.brand}
          onClick={() => setPage('projects')}
          title="프로젝트 목록으로"
          aria-label="CSI Admin — 프로젝트 목록으로"
        >
          <span className="csi-brand__mark" style={S.brandMark}>
            <Fingerprint />
          </span>
          <span style={S.brandText}>
            <span style={S.brandWord}>
              CSI <span style={{ color: C.txtFaint, fontWeight: 400 }}>Admin</span>
            </span>
            <span style={S.brandSub}>고정층 에디터</span>
          </span>
        </button>
        <nav style={S.nav}>
          <button style={S.navItem(page === 'projects')} onClick={() => setPage('projects')}>
            <NavIcon name="projects" />
            <span>프로젝트 목록</span>
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
                  <NavIcon name={item.key} />
                  <span>{item.label}</span>
                </button>
              ))}
            </>
          )}

          <div style={S.divider} />
          <button style={S.navItem(page === 'info')} onClick={() => setPage('info')}>
            <NavIcon name="info" />
            <span>개발자 정보</span>
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
          <h1 style={S.topbarTitle}>
            <span style={{ color: C.accent, display: 'flex' }}>
              <NavIcon name={page} size={18} />
            </span>
            <span>{LABELS[page] ?? '프로젝트 목록'}</span>
          </h1>
          {showExport && (
            <button style={S.exportBtn} onClick={() => exportJson(data)}>
              JSON 내보내기
            </button>
          )}
        </div>
        <div style={S.content}>
          <div key={page} className="csi-page">
            {content}
          </div>
        </div>
      </main>
    </div>
  )
}
