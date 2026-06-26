export const S = {
  card: {
    background: '#fff', border: '1px solid #e4e4e7', borderRadius: 8,
    padding: '20px 24px', marginBottom: 20,
  },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  cardTitle: {
    fontSize: 12, fontWeight: 700, color: '#71717a',
    textTransform: 'uppercase', letterSpacing: 0.5, margin: 0,
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: {
    textAlign: 'left', padding: '8px 12px',
    borderBottom: '2px solid #e4e4e7', color: '#52525b', fontWeight: 600,
    whiteSpace: 'nowrap', fontSize: 12,
  },
  td: { padding: '8px 12px', borderBottom: '1px solid #f4f4f5', verticalAlign: 'middle' },
  input: {
    padding: '5px 8px', border: '1px solid #e4e4e7', borderRadius: 4,
    fontSize: 13, width: '100%', boxSizing: 'border-box',
    background: '#fafafa', color: '#1a1a1a', outline: 'none',
  },
  textarea: {
    padding: '6px 8px', border: '1px solid #e4e4e7', borderRadius: 4,
    fontSize: 12, width: '100%', boxSizing: 'border-box',
    background: '#fafafa', color: '#1a1a1a',
    fontFamily: 'monospace', resize: 'vertical', outline: 'none',
  },
  select: {
    padding: '5px 8px', border: '1px solid #e4e4e7', borderRadius: 4,
    fontSize: 13, background: '#fafafa', color: '#1a1a1a', width: '100%', outline: 'none',
  },
  warning: {
    background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 6,
    padding: '10px 14px', fontSize: 12, color: '#92400e', marginBottom: 16,
  },
}

export function btn(variant = 'default') {
  const map = {
    primary: { background: '#6d28d9', color: '#fff' },
    danger:  { background: '#dc2626', color: '#fff' },
    default: { background: '#f4f4f5', color: '#3f3f46' },
    ghost:   { background: 'none', color: '#6b7280', border: '1px solid #e4e4e7' },
  }
  return {
    padding: '6px 14px', border: 'none', borderRadius: 5,
    cursor: 'pointer', fontSize: 13, fontWeight: 500,
    ...(map[variant] ?? map.default),
  }
}

export function badge(color) {
  const map = {
    blue:   { background: '#dbeafe', color: '#1d4ed8' },
    green:  { background: '#dcfce7', color: '#15803d' },
    yellow: { background: '#fef3c7', color: '#b45309' },
    gray:   { background: '#f4f4f5', color: '#52525b' },
  }
  return {
    display: 'inline-block', padding: '2px 8px', borderRadius: 12,
    fontSize: 11, fontWeight: 600,
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
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#52525b', marginBottom: 4 }}>
        {label}
      </label>
      {children}
      {hint && <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 3 }}>{hint}</div>}
    </div>
  )
}

export function SaveBar({ onSave, saved }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
      <button style={btn('primary')} onClick={onSave}>
        {saved ? '✓ 저장됨' : '저장'}
      </button>
    </div>
  )
}

export function IconBtn({ icon, title, onClick, danger }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: 14, padding: '2px 5px',
        color: danger ? '#dc2626' : '#6b7280',
      }}
    >
      {icon}
    </button>
  )
}
