// ⚠️ 임시 하드코딩 계정 — 실제 배포 전 반드시 변경할 것.
// 비밀번호가 클라이언트 번들에 평문 노출됨(개발자 도구에서 확인 가능).
// 추후 Supabase users 테이블 + Edge Function 으로 이전 예정 (docs/TODO.md 보류 항목).
// role 은 'admin' | 'teacher' — 현재는 인증 여부만 체크, 권한 분기는 미구현.
export const USERS = [
  { id: 'admin',   pw: 'admin1234',   role: 'admin' },
  { id: 'teacher', pw: 'teacher1234', role: 'teacher' },
]
