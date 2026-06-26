import { useState } from 'react'

const NAV_ITEMS = [
  { key: 'scenario',   label: '📋 시나리오 정보' },
  { key: 'npc',        label: '👥 NPC 관리' },
  { key: 'solution',   label: '🎯 정답 설정' },
  { key: 'evidence',   label: '🔍 증거물 카탈로그' },
  { key: 'slots',      label: '⚙️ 생성 슬롯' },
  { key: 'preview',    label: '👁️ 미리보기' },
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
    padding: '20px 16px 16px',
    borderBottom: '1px solid #313244',
  },
  sidebarTitle: {
    fontSize: 13, fontWeight: 700, color: '#cba6f7', letterSpacing: 1,
    textTransform: 'uppercase', margin: 0,
  },
  sidebarSub: {
    fontSize: 11, color: '#6c7086', marginTop: 4,
  },
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
    margin: '12px', padding: '8px 12px', border: '1px solid #313244',
    borderRadius: 6, background: 'transparent', color: '#6c7086',
    cursor: 'pointer', fontSize: 12, textAlign: 'center',
  },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topbar: {
    height: 52, background: '#fff', borderBottom: '1px solid #e0e0e0',
    display: 'flex', alignItems: 'center', padding: '0 24px',
    flexShrink: 0,
  },
  topbarTitle: { fontSize: 16, fontWeight: 600, margin: 0 },
  content: { flex: 1, overflow: 'auto', padding: 24 },
  placeholder: {
    background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8,
    padding: 32, color: '#9399b2', fontSize: 14, textAlign: 'center',
  },
}

function Placeholder({ page }) {
  return (
    <div style={S.placeholder}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>🚧</div>
      <div><strong>{page}</strong> 페이지 — 2단계에서 구현 예정</div>
    </div>
  )
}

export default function AdminApp() {
  const [page, setPage] = useState('scenario')
  const current = NAV_ITEMS.find(n => n.key === page)

  return (
    <div style={S.root}>
      <aside style={S.sidebar}>
        <div style={S.sidebarHeader}>
          <p style={S.sidebarTitle}>Admin</p>
          <p style={S.sidebarSub}>고정층 에디터</p>
        </div>
        <nav style={S.nav}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              style={S.navItem(page === item.key)}
              onClick={() => setPage(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button style={S.backBtn} onClick={() => { window.location.hash = '/' }}>
          ← 플레이어 씬으로
        </button>
      </aside>

      <main style={S.main}>
        <div style={S.topbar}>
          <h1 style={S.topbarTitle}>{current?.label}</h1>
        </div>
        <div style={S.content}>
          <Placeholder page={current?.label} />
        </div>
      </main>
    </div>
  )
}
