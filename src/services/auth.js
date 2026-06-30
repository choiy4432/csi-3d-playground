// 어드민 인증 세션 관리 — 하드코딩 유저(USERS) 기반.
//
// ⚠️ 이 파일의 인터페이스(login/logout/getSession/refreshActivity)를 고정한다.
// 추후 Supabase 테이블 + Edge Function(서버사이드 검증) 으로 교체할 때
// 이 파일의 '내부 구현'만 바꾸고 호출부(LoginPage/AdminApp)는 그대로 둔다.

import { USERS } from '../constants/users'

export const SESSION_KEY = 'csi_auth_session'
const IDLE_LIMIT_MS = 60 * 60 * 1000 // 1시간 무활동 시 만료

// id/pw 검증 → 성공 시 세션 저장 후 세션 객체 반환, 실패 시 null
export function login(id, pw) {
  const user = USERS.find((u) => u.id === id && u.pw === pw)
  if (!user) return null

  const session = { userId: user.id, role: user.role, lastActivity: Date.now() }
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // localStorage 사용 불가 환경 — 세션은 메모리상으로만 반환
  }
  return session
}

// 세션 제거
export function logout() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* noop */
  }
}

// 저장된 세션 반환. 만료 시 logout() 후 null. 파싱 실패 시 null.
export function getSession() {
  let session
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    session = JSON.parse(raw)
  } catch {
    return null
  }

  // 스키마 무결성 검증 — 변조/누락 시 무효 세션 처리
  const validRole = USERS.some((u) => u.role === session?.role)
  if (
    !session ||
    typeof session.lastActivity !== 'number' ||
    typeof session.userId !== 'string' ||
    !validRole
  ) {
    logout()
    return null
  }

  if (Date.now() - session.lastActivity > IDLE_LIMIT_MS) {
    logout()
    return null
  }
  return session
}

// 유효 세션의 lastActivity 갱신. 만료/무세션이면 갱신하지 않음.
export function refreshActivity() {
  const session = getSession()
  if (!session) return
  session.lastActivity = Date.now()
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    /* noop */
  }
}
