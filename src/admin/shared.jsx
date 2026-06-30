// ── 어드민 다크 디자인 시스템 (Linear-tier) ─────────────────────────
// 단일 진실 소스(C 토큰)로 전 페이지의 다크 톤을 통일한다.
// 로그인 화면과 동일한 팔레트·억제된 보라 단일 액센트.
// 인라인 스타일은 :hover/:focus/스크롤바를 표현할 수 없어,
// AdminStyles 전역 <style>(.csi-admin 스코프)에서 보강한다.

export const C = {
  appBg:      '#0b0b10', // 콘텐츠 배경
  surface:    '#14141d', // 카드
  surfaceUp:  '#1b1b25', // 라이즈드 / 행 hover
  sunken:     '#0e0e15', // 인풋 배경
  line:       'rgba(255,255,255,0.08)',
  lineSoft:   'rgba(255,255,255,0.05)',
  lineStrong: 'rgba(255,255,255,0.13)',
  txt:        '#e8e7ef',
  txtDim:     '#9d9cae',
  txtMute:    '#7c7b8c',
  txtFaint:   '#5b5a6b',
  accent:     '#b9a4f0',
  accent2:    '#cbb8ff',
  accentBg:   'rgba(185,164,240,0.10)',
  accentBd:   'rgba(185,164,240,0.45)',
  danger:     '#f0879f',
  dangerBg:   'rgba(240,135,159,0.10)',
  dangerBd:   'rgba(240,135,159,0.30)',
  ok:         '#86e3ad',
  warn:       '#f1cf8e',
}

export const S = {
  card: {
    background: C.surface,
    border: `1px solid ${C.line}`,
    borderRadius: 14,
    padding: '22px 24px',
    marginBottom: 20,
    boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 18px 40px -28px rgba(0,0,0,0.8)',
  },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  cardTitle: {
    fontSize: 11, fontWeight: 600, color: C.txtMute,
    textTransform: 'uppercase', letterSpacing: 1, margin: 0,
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13, color: C.txt },
  th: {
    textAlign: 'left', padding: '9px 12px',
    borderBottom: `1px solid ${C.lineStrong}`, color: C.txtDim, fontWeight: 600,
    whiteSpace: 'nowrap', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4,
  },
  td: { padding: '10px 12px', borderBottom: `1px solid ${C.lineSoft}`, verticalAlign: 'middle', color: C.txt },
  input: {
    padding: '8px 11px', border: `1px solid ${C.line}`, borderRadius: 9,
    fontSize: 13, width: '100%', boxSizing: 'border-box',
    background: C.sunken, color: C.txt, outline: 'none',
  },
  textarea: {
    padding: '9px 11px', border: `1px solid ${C.line}`, borderRadius: 9,
    fontSize: 12, width: '100%', boxSizing: 'border-box',
    background: C.sunken, color: C.txt,
    fontFamily: 'ui-monospace, "JetBrains Mono", Consolas, monospace', resize: 'vertical', outline: 'none',
  },
  select: {
    padding: '8px 11px', border: `1px solid ${C.line}`, borderRadius: 9,
    fontSize: 13, background: C.sunken, color: C.txt, width: '100%', outline: 'none',
  },
  warning: {
    background: 'rgba(241,207,142,0.08)', border: '1px solid rgba(241,207,142,0.28)', borderRadius: 10,
    padding: '10px 14px', fontSize: 12, color: C.warn, marginBottom: 16,
  },
}

export function btn(variant = 'default') {
  const map = {
    primary: {
      background: `linear-gradient(180deg, ${C.accent2}, ${C.accent})`,
      color: '#1b1530',
      boxShadow: '0 1px 0 rgba(255,255,255,0.45) inset, 0 10px 22px -12px rgba(150,124,232,0.6)',
    },
    danger:  { background: C.dangerBg, color: C.danger, border: `1px solid ${C.dangerBd}` },
    default: { background: 'rgba(255,255,255,0.06)', color: '#d6d5e0', border: `1px solid ${C.line}` },
    ghost:   { background: 'transparent', color: C.txtDim, border: `1px solid ${C.line}` },
  }
  return {
    padding: '7px 15px', border: 'none', borderRadius: 999,
    cursor: 'pointer', fontSize: 13, fontWeight: 600, letterSpacing: 0.1,
    transition: 'transform 0.4s cubic-bezier(0.32,0.72,0,1), filter 0.3s ease, background 0.3s ease',
    ...(map[variant] ?? map.default),
  }
}

export function badge(color) {
  const map = {
    blue:   { background: 'rgba(122,162,255,0.14)', color: '#a7c0ff' },
    green:  { background: 'rgba(120,214,160,0.15)', color: '#95e3b5' },
    yellow: { background: 'rgba(240,200,120,0.15)', color: '#f1d49a' },
    purple: { background: 'rgba(185,164,240,0.16)', color: '#cbb8ff' },
    orange: { background: 'rgba(245,176,120,0.15)', color: '#f3c89a' },
    gray:   { background: 'rgba(255,255,255,0.07)', color: '#b3b2c2' },
  }
  return {
    display: 'inline-block', padding: '2px 9px', borderRadius: 999,
    fontSize: 11, fontWeight: 600, letterSpacing: 0.2,
    ...(map[color] ?? map.gray),
  }
}

export function Card({ title, children, action }) {
  return (
    <div style={S.card}>
      {title && (
        <div style={S.cardHeader}>
          <p style={S.cardTitle}>{title}</p>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

export function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.txtDim, marginBottom: 5 }}>
        {label}
      </label>
      {children}
      {hint && <div style={{ fontSize: 11, color: C.txtFaint, marginTop: 4 }}>{hint}</div>}
    </div>
  )
}

export function SaveBar({ onSave, saved }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
      <button style={{ ...btn('primary'), display: 'inline-flex', alignItems: 'center', gap: 7 }} onClick={onSave}>
        {saved ? <><ActionIcon name="confirm" size={15} />저장됨</> : '저장'}
      </button>
    </div>
  )
}

// 액션 아이콘 — 1.5 stroke 통일 라인 세트 (이모지 대체).
const ACTION_PATHS = {
  edit: (
    <>
      <path d="M16.5 4.5a2 2 0 0 1 2.8 2.8l-10 10-3.8 1 1-3.8Z" />
      <path d="M14 7 17 10" />
    </>
  ),
  delete: (
    <>
      <path d="M5 7h14" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="M6.5 7l.8 11A1.5 1.5 0 0 0 8.8 19.4h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-11" />
      <path d="M10 10.5v5M14 10.5v5" />
    </>
  ),
  duplicate: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5V5A1.5 1.5 0 0 1 4.5 3.5H13A1.5 1.5 0 0 1 14.5 5v.5" />
    </>
  ),
  confirm: <path d="M5 12.5 10 17.5 19 6.5" />,
  cancel: <path d="M6 6 18 18M18 6 6 18" />,
  lock: (
    <>
      <rect x="5.5" y="10.5" width="13" height="9" rx="2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16" />
      <path d="M12 4c2.5 2.2 2.5 13.8 0 16M12 4c-2.5 2.2-2.5 13.8 0 16" />
    </>
  ),
  refresh: (
    <>
      <path d="M4.5 9a7.5 7.5 0 0 1 12.6-2.8L20 9" />
      <path d="M20 4.5V9h-4.5" />
      <path d="M19.5 15a7.5 7.5 0 0 1-12.6 2.8L4 15" />
      <path d="M4 19.5V15h4.5" />
    </>
  ),
}

export function ActionIcon({ name, size = 15 }) {
  const paths = ACTION_PATHS[name]
  if (!paths) return null
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block' }} aria-hidden="true">
      {paths}
    </svg>
  )
}

export function IconBtn({ icon, name, title, onClick, danger }) {
  return (
    <button
      aria-label={title}
      data-tip={title}
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: 14, padding: 6, borderRadius: 7, verticalAlign: 'middle',
        color: danger ? C.danger : C.txtMute,
        transition: 'background 0.2s ease, color 0.2s ease',
      }}
    >
      {name ? <ActionIcon name={name} /> : icon}
    </button>
  )
}

// 빈 상태 — 이중 베젤 메달리온 + 타이틀 + 힌트 + 선택적 CTA.
export function EmptyState({ icon, title, hint, action }) {
  return (
    <div className="csi-empty" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center', padding: '46px 24px 40px',
    }}>
      <div style={{
        width: 60, height: 60, borderRadius: 999, padding: 6, marginBottom: 18,
        background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.line}`,
        boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset',
      }}>
        <div style={{
          width: '100%', height: '100%', borderRadius: 999,
          background: C.sunken, color: C.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 1px rgba(255,255,255,0.08) inset',
        }}>
          {icon ?? <DocGlyph />}
        </div>
      </div>
      <div style={{
        fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 600,
        color: C.txt, letterSpacing: '-0.01em', marginBottom: 6,
      }}>
        {title}
      </div>
      {hint && (
        <div style={{ fontSize: 13, color: C.txtMute, lineHeight: 1.6, maxWidth: 320 }}>
          {hint}
        </div>
      )}
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  )
}

// 테이블 tbody 안에서 쓰는 빈 상태 행.
export function TableEmpty({ colSpan, ...rest }) {
  return (
    <tr className="csi-nohover">
      <td colSpan={colSpan} style={{ padding: 0, borderBottom: 'none' }}>
        <EmptyState {...rest} />
      </td>
    </tr>
  )
}

// 셔머 스켈레톤 블록. w/h/radius로 형태 조정.
export function Skeleton({ w = '100%', h = 14, radius = 7, style }) {
  return <div className="csi-skeleton" style={{ width: w, height: h, borderRadius: radius, ...style }} />
}

function DocGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5" />
    </svg>
  )
}

// 전역 어드민 스타일 — 폰트·포커스 링·행 hover·스크롤바.
// AdminApp 루트(.csi-admin)에 1회 마운트. 인라인 base 위에 :focus/:hover를
// 얹기 위해 일부 규칙은 !important 필요.
export function AdminStyles() {
  return <style>{ADMIN_CSS}</style>
}

const ADMIN_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

.csi-admin {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  letter-spacing: -0.005em;
}
.csi-admin h1, .csi-admin h2, .csi-admin h3 {
  font-family: 'Space Grotesk', sans-serif;
  letter-spacing: -0.02em;
}

.csi-admin input:focus,
.csi-admin textarea:focus,
.csi-admin select:focus {
  border-color: ${C.accentBd} !important;
  box-shadow: 0 0 0 3px rgba(185,164,240,0.14) !important;
}
.csi-admin input:hover:not(:focus),
.csi-admin textarea:hover:not(:focus),
.csi-admin select:hover:not(:focus) {
  border-color: rgba(255,255,255,0.16) !important;
}

.csi-admin button { transition: transform 0.4s cubic-bezier(0.32,0.72,0,1), filter 0.3s ease, background 0.2s ease; }
.csi-admin button:hover { filter: brightness(1.08); }
.csi-admin button:active { transform: scale(0.97); }
.csi-admin button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(185,164,240,0.32) !important;
}

.csi-brand__mark { transition: transform 0.45s cubic-bezier(0.32,0.72,0,1); }
.csi-brand:hover .csi-brand__mark { transform: translateY(-1px) scale(1.04); }

/* 프로젝트 제목 — 클릭 시 열기 */
.csi-admin .csi-titlelink { transition: color 0.2s ease; }
.csi-admin .csi-titlelink:hover { color: ${C.accent}; text-decoration: underline; text-underline-offset: 3px; }
.csi-admin .csi-titlelink:active { transform: none; }

/* 아이콘 버튼 hint — 즉시 뜨는 커스텀 툴팁 */
.csi-admin [data-tip] { position: relative; }
.csi-admin [data-tip]::after {
  content: attr(data-tip);
  position: absolute;
  bottom: calc(100% + 7px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  padding: 4px 9px;
  border-radius: 8px;
  background: #0d0d14;
  border: 1px solid ${C.line};
  color: ${C.txt};
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  box-shadow: 0 10px 24px -10px rgba(0,0,0,0.75);
  transition: opacity 0.18s ease, transform 0.32s cubic-bezier(0.32,0.72,0,1);
  z-index: 20;
}
.csi-admin [data-tip]::before {
  content: '';
  position: absolute;
  bottom: calc(100% + 3px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  border: 4px solid transparent;
  border-top-color: #0d0d14;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.18s ease, transform 0.32s cubic-bezier(0.32,0.72,0,1);
  z-index: 20;
}
.csi-admin [data-tip]:hover::after,
.csi-admin [data-tip]:focus-visible::after,
.csi-admin [data-tip]:hover::before,
.csi-admin [data-tip]:focus-visible::before {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.csi-admin tbody tr { transition: background 0.18s ease; }
.csi-admin tbody tr:hover { background: ${C.surfaceUp}; }
.csi-admin tbody tr.csi-nohover:hover { background: transparent; }

.csi-empty { animation: csiEmptyIn 0.6s cubic-bezier(0.22,1,0.36,1) both; }
@keyframes csiEmptyIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* 페이지 전환 enter — fill 미지정(none): 종료 후 transform이 남지 않아
   하위 position:fixed 모달(EvidenceModal)의 컨테이닝 블록을 깨지 않는다. */
.csi-page { animation: csiPageIn 0.45s cubic-bezier(0.22,1,0.36,1); }
@keyframes csiPageIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.csi-skeleton {
  position: relative;
  overflow: hidden;
  background: rgba(255,255,255,0.05);
}
.csi-skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.09), transparent);
  animation: csiShimmer 1.6s cubic-bezier(0.4,0,0.6,1) infinite;
}
@keyframes csiShimmer { to { transform: translateX(100%); } }

.csi-admin ::placeholder { color: ${C.txtFaint}; }

.csi-admin ::-webkit-scrollbar { width: 11px; height: 11px; }
.csi-admin ::-webkit-scrollbar-track { background: transparent; }
.csi-admin ::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.09);
  border: 3px solid transparent;
  background-clip: padding-box;
  border-radius: 999px;
}
.csi-admin ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.16); background-clip: padding-box; }

@media (prefers-reduced-motion: reduce) {
  .csi-admin *, .csi-page, .csi-empty, .csi-skeleton::after {
    animation: none !important;
    transition: none !important;
  }
}
`
