import { useState } from 'react'
import { login } from '../services/auth'

// 어드민 다크테마 팔레트 (AdminApp 사이드바와 통일)
const S = {
  root: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', background: '#1e1e2e',
    color: '#cdd6f4', fontFamily: 'sans-serif',
  },
  card: {
    background: '#313244', border: '1px solid #45475a',
    borderRadius: 10, padding: '36px 40px',
    width: '100%', maxWidth: 360,
    boxShadow: '0 8px 28px rgba(0,0,0,0.45)',
  },
  title: {
    fontSize: 18, fontWeight: 700, color: '#cba6f7',
    letterSpacing: 1, textTransform: 'uppercase',
    textAlign: 'center', margin: 0,
  },
  sub: {
    fontSize: 12, color: '#6c7086', textAlign: 'center',
    margin: '6px 0 24px',
  },
  label: { fontSize: 11, color: '#9399b2', marginBottom: 5, display: 'block' },
  input: {
    padding: '9px 12px', border: '1px solid #45475a', borderRadius: 6,
    fontSize: 13, width: '100%', boxSizing: 'border-box',
    background: '#1e1e2e', color: '#cdd6f4',
    marginBottom: 14, outline: 'none',
  },
  button: {
    width: '100%', padding: '10px 14px', border: 'none', borderRadius: 6,
    fontSize: 13, fontWeight: 600, marginTop: 4,
    background: '#cba6f7', color: '#1e1e2e', cursor: 'pointer',
  },
  error: {
    background: '#45233a', border: '1px solid #f38ba8',
    color: '#f38ba8', fontSize: 12,
    borderRadius: 6, padding: '8px 12px', marginBottom: 14,
  },
}

export default function LoginPage({ onLogin }) {
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const session = login(id, pw)
    if (!session) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.')
      return
    }
    setError('')
    onLogin(session)
  }

  return (
    <div style={S.root}>
      <form style={S.card} onSubmit={handleSubmit}>
        <h1 style={S.title}>CSI Admin</h1>
        <p style={S.sub}>고정층 에디터 — 관리자 로그인</p>

        {error && <div style={S.error}>{error}</div>}

        <label style={S.label}>아이디</label>
        <input
          style={S.input}
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          autoFocus
        />

        <label style={S.label}>비밀번호</label>
        <input
          style={S.input}
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />

        <button style={S.button} type="submit">로그인</button>
      </form>
    </div>
  )
}
