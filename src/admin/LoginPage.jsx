import { useState } from 'react'
import { login } from '../services/auth'

// ── 프리미엄 다크 로그인 (Linear-tier) ───────────────────────────────
// 인터랙션(:hover/:focus)·키프레임·이중 베젤 하이라이트는 인라인 스타일로
// 표현할 수 없어 스코프드 <style> 블록(csi-login-*)으로 처리한다.
// 로그인 로직(login/onLogin 계약)은 원본 그대로 유지한다.

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

.csi-login {
  --bg: #0b0b10;
  --core: #14141d;
  --line: rgba(255,255,255,0.08);
  --line-soft: rgba(255,255,255,0.05);
  --txt: #e8e7ef;
  --txt-dim: #8c8b9c;
  --txt-faint: #5b5a6b;
  --accent: #b9a4f0;
  --accent-2: #cbb8ff;
  --rose: #e98aa4;

  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  padding: 24px;
  box-sizing: border-box;
  overflow: hidden;
  background: var(--bg);
  color: var(--txt);
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* 보라 메시 글로우 — 단일 액센트, 채도 억제 */
.csi-login__mesh {
  position: absolute;
  inset: -25%;
  pointer-events: none;
  background:
    radial-gradient(38% 42% at 28% 22%, rgba(137,116,214,0.30), transparent 70%),
    radial-gradient(34% 40% at 78% 76%, rgba(86,96,140,0.26), transparent 72%),
    radial-gradient(50% 50% at 62% 30%, rgba(155,138,224,0.10), transparent 70%);
  filter: blur(8px);
  will-change: transform;
  animation: csiDrift 22s cubic-bezier(0.45,0,0.55,1) infinite alternate;
}

/* 필름 그레인 — 디지털 평면감 제거. fixed·pointer-events:none */
.csi-login__grain {
  position: fixed;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.csi-login__stage {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 408px;
}

/* 이중 베젤 — 바깥 트레이 */
.csi-login__shell {
  position: relative;
  padding: 7px;
  border-radius: 30px;
  background: rgba(255,255,255,0.035);
  border: 1px solid var(--line);
  box-shadow:
    0 1px 0 rgba(255,255,255,0.06) inset,
    0 40px 90px -30px rgba(8,6,20,0.9),
    0 12px 40px -18px rgba(96,80,168,0.35);
  animation: csiRise 0.9s cubic-bezier(0.22,1,0.36,1) both;
}

/* 이중 베젤 — 안쪽 코어 (동심 곡률: 30 - 7 = 23) */
.csi-login__core {
  position: relative;
  padding: 40px 38px 34px;
  border-radius: 23px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0) 38%),
    var(--core);
  border: 1px solid var(--line-soft);
  box-shadow: 0 1px 1px rgba(255,255,255,0.10) inset;
  overflow: hidden;
}

.csi-login__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 11px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(185,164,240,0.08);
  color: var(--accent);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  animation: csiUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.06s both;
}
.csi-login__eyebrow::before {
  content: '';
  width: 5px; height: 5px;
  border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 0 10px 1px var(--accent);
}

.csi-login__wordmark {
  margin: 20px 0 6px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 34px;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.05;
  color: var(--txt);
  animation: csiUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.12s both;
}
.csi-login__wordmark span {
  color: var(--txt-faint);
  font-weight: 400;
}

.csi-login__sub {
  margin: 0 0 26px;
  font-size: 13px;
  color: var(--txt-dim);
  letter-spacing: -0.01em;
  animation: csiUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.16s both;
}

.csi-login__field {
  display: block;
  margin-bottom: 14px;
  animation: csiUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.2s both;
}
.csi-login__field--pw { animation-delay: 0.24s; }

.csi-login__caption {
  display: block;
  margin-bottom: 7px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--txt-dim);
}

.csi-login__wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.csi-login__input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: rgba(8,8,13,0.6);
  color: var(--txt);
  font-family: inherit;
  font-size: 14px;
  letter-spacing: 0.01em;
  outline: none;
  transition: border-color 0.4s cubic-bezier(0.32,0.72,0,1),
              box-shadow 0.4s cubic-bezier(0.32,0.72,0,1),
              background 0.4s cubic-bezier(0.32,0.72,0,1);
}
.csi-login__input--pw { padding-right: 46px; }
.csi-login__input::placeholder { color: var(--txt-faint); }
.csi-login__input:hover { border-color: rgba(255,255,255,0.16); }
.csi-login__input:focus {
  border-color: rgba(185,164,240,0.65);
  background: rgba(8,8,13,0.85);
  box-shadow: 0 0 0 4px rgba(185,164,240,0.14);
}

.csi-login__peek {
  position: absolute;
  right: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px; height: 34px;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: var(--txt-faint);
  cursor: pointer;
  transition: color 0.3s ease, background 0.3s ease;
}
.csi-login__peek:hover { color: var(--txt-dim); background: rgba(255,255,255,0.05); }
.csi-login__peek:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(185,164,240,0.3);
}

.csi-login__error {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 18px;
  padding: 11px 13px;
  border-radius: 12px;
  border: 1px solid rgba(233,138,164,0.28);
  background: rgba(233,138,164,0.08);
  color: var(--rose);
  font-size: 12.5px;
  letter-spacing: -0.01em;
  animation: csiShake 0.5s cubic-bezier(0.36,0.07,0.19,0.97);
}
.csi-login__error svg { flex-shrink: 0; }

/* CTA — 아일랜드 필 + 버튼인버튼 트레일링 아이콘 */
.csi-login__cta {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 22px;
  padding: 7px 7px 7px 22px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--accent-2), var(--accent));
  color: #1b1530;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14.5px;
  font-weight: 600;
  letter-spacing: 0.01em;
  cursor: pointer;
  box-shadow:
    0 1px 0 rgba(255,255,255,0.5) inset,
    0 14px 30px -10px rgba(150,124,232,0.6);
  transition: transform 0.5s cubic-bezier(0.32,0.72,0,1),
              box-shadow 0.5s cubic-bezier(0.32,0.72,0,1);
  animation: csiUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s both;
}
.csi-login__cta:hover {
  box-shadow:
    0 1px 0 rgba(255,255,255,0.6) inset,
    0 18px 40px -10px rgba(150,124,232,0.75);
}
.csi-login__cta:active { transform: scale(0.985); }
.csi-login__cta:focus-visible {
  outline: none;
  box-shadow:
    0 1px 0 rgba(255,255,255,0.5) inset,
    0 0 0 4px rgba(185,164,240,0.35),
    0 14px 30px -10px rgba(150,124,232,0.6);
}

.csi-login__cta-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px; height: 36px;
  border-radius: 999px;
  background: rgba(27,21,48,0.16);
  transition: transform 0.5s cubic-bezier(0.32,0.72,0,1),
              background 0.5s cubic-bezier(0.32,0.72,0,1);
}
.csi-login__cta:hover .csi-login__cta-icon {
  transform: translate(3px, -1px) scale(1.06);
  background: rgba(27,21,48,0.24);
}

.csi-login__foot {
  margin: 22px 0 0;
  text-align: center;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--txt-faint);
  animation: csiUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.36s both;
}

@keyframes csiRise {
  from { opacity: 0; transform: translateY(26px) scale(0.985); filter: blur(6px); }
  to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}
@keyframes csiUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes csiDrift {
  from { transform: translate3d(-2%, -1%, 0) scale(1); }
  to   { transform: translate3d(3%, 2%, 0) scale(1.08); }
}
@keyframes csiShake {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-4px); }
  40%, 60% { transform: translateX(4px); }
}

@media (prefers-reduced-motion: reduce) {
  .csi-login *, .csi-login__shell, .csi-login__mesh {
    animation: none !important;
    transition: none !important;
  }
}
`

function EyeIcon({ off }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.6" />
      {off && <line x1="4" y1="20" x2="20" y2="4" />}
    </svg>
  )
}

export default function LoginPage({ onLogin }) {
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [showPw, setShowPw] = useState(false)
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
    <div className="csi-login">
      <style>{CSS}</style>
      <div className="csi-login__mesh" aria-hidden="true" />
      <div className="csi-login__grain" aria-hidden="true" />

      <main className="csi-login__stage">
        <div className="csi-login__shell">
          <form className="csi-login__core" onSubmit={handleSubmit} noValidate>
            <span className="csi-login__eyebrow">Secure access</span>
            <h1 className="csi-login__wordmark">CSI <span>Admin</span></h1>
            <p className="csi-login__sub">고정층 에디터 — 관리자 인증</p>

            {error && (
              <div className="csi-login__error" role="alert">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <line x1="12" y1="8" x2="12" y2="13" />
                  <line x1="12" y1="16.5" x2="12" y2="16.5" />
                </svg>
                {error}
              </div>
            )}

            <label className="csi-login__field">
              <span className="csi-login__caption">아이디</span>
              <span className="csi-login__wrap">
                <input
                  className="csi-login__input"
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  autoComplete="username"
                  autoFocus
                  aria-invalid={!!error}
                />
              </span>
            </label>

            <label className="csi-login__field csi-login__field--pw">
              <span className="csi-login__caption">비밀번호</span>
              <span className="csi-login__wrap">
                <input
                  className="csi-login__input csi-login__input--pw"
                  type={showPw ? 'text' : 'password'}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  autoComplete="current-password"
                  aria-invalid={!!error}
                />
                <button
                  type="button"
                  className="csi-login__peek"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 표시'}
                  aria-pressed={showPw}
                >
                  <EyeIcon off={showPw} />
                </button>
              </span>
            </label>

            <button className="csi-login__cta" type="submit">
              <span>로그인</span>
              <span className="csi-login__cta-icon" aria-hidden="true">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="18" y2="12" />
                  <polyline points="12 6 18 12 12 18" />
                </svg>
              </span>
            </button>

            <p className="csi-login__foot">콘진원 AI 직업체험 · 관리자 전용</p>
          </form>
        </div>
      </main>
    </div>
  )
}
