import { C } from "../shared.jsx";

const T = {
  section: {
    background: C.surface,
    border: `1px solid ${C.line}`,
    borderRadius: 14,
    padding: "22px 24px",
    marginBottom: 20,
    boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset, 0 18px 40px -28px rgba(0,0,0,0.8)",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: C.txt,
    borderBottom: `1px solid ${C.lineStrong}`,
    paddingBottom: 10,
    marginBottom: 16,
  },
  h3: {
    fontSize: 13,
    fontWeight: 700,
    color: "#d6d5e0",
    margin: "20px 0 8px",
  },
  p: {
    fontSize: 13,
    color: C.txtDim,
    lineHeight: 1.7,
    margin: "0 0 8px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 12,
    marginBottom: 8,
  },
  th: {
    textAlign: "left",
    padding: "7px 10px",
    background: "rgba(255,255,255,0.04)",
    borderBottom: `1px solid ${C.line}`,
    fontWeight: 700,
    color: "#d6d5e0",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "7px 10px",
    borderBottom: `1px solid ${C.lineSoft}`,
    verticalAlign: "top",
    color: C.txt,
  },
  code: {
    fontFamily: "ui-monospace, 'JetBrains Mono', Consolas, monospace",
    fontSize: 11,
    background: C.accentBg,
    padding: "1px 6px",
    borderRadius: 5,
    color: C.accent,
  },
  note: {
    background: "rgba(120,214,160,0.10)",
    border: "1px solid rgba(120,214,160,0.28)",
    borderRadius: 10,
    padding: "9px 13px",
    fontSize: 12,
    color: C.ok,
    margin: "8px 0",
  },
  warn: {
    background: "rgba(241,207,142,0.08)",
    border: "1px solid rgba(241,207,142,0.28)",
    borderRadius: 10,
    padding: "9px 13px",
    fontSize: 12,
    color: C.warn,
    margin: "8px 0",
  },
  flow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    margin: "12px 0",
  },
  flowItem: (highlight) => ({
    padding: "6px 13px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background: highlight ? C.accent : "rgba(255,255,255,0.06)",
    color: highlight ? "#1b1530" : "#d6d5e0",
    border: "1px solid " + (highlight ? C.accent : C.line),
  }),
  arrow: { color: C.txtFaint, fontSize: 14 },
};

function Code({ children }) {
  return <span style={T.code}>{children}</span>;
}

function Section({ title, children }) {
  return (
    <div style={T.section}>
      <div style={T.sectionTitle}>{title}</div>
      {children}
    </div>
  );
}

function FieldTable({ rows }) {
  return (
    <table style={T.table}>
      <thead>
        <tr>
          <th style={T.th}>화면 표시 이름</th>
          <th style={T.th}>내부 필드명</th>
          <th style={T.th}>설명</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, field, desc]) => (
          <tr key={field}>
            <td style={T.td}>{label}</td>
            <td style={T.td}>
              <Code>{field}</Code>
            </td>
            <td style={{ ...T.td, color: C.txtDim }}>{desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function InfoPage() {
  return (
    <div>
      <div style={{ ...T.section, background: C.accentBg, border: `1px solid ${C.accentBd}`, color: C.txt }}>
        <p style={{ fontSize: 13, margin: 0, lineHeight: 1.8 }}>
          이 페이지는{" "}
          <strong style={{ color: C.accent }}>개발자 참고용</strong>입니다. 각
          에디터 화면에서 사용하는 내부 필드명, 데이터 구조, AI 생성 흐름을
          설명합니다. 일반 사용자는 이 페이지를 열 필요가 없습니다.
        </p>
      </div>

      <Section title="📋 시나리오 정보 — 내부 구조">
        <p style={T.p}>
          화면에서 "시나리오 정보" 탭에서 편집하는 데이터입니다.
        </p>
        <h3 style={T.h3}>SCENARIO 테이블</h3>
        <FieldTable
          rows={[
            [
              "시나리오 제목",
              "scenario.title",
              "게임 메인 화면과 브리핑에 표시됩니다.",
            ],
            [
              "사건 유형",
              "scenario.case_type_id",
              "CASE_TYPE 테이블의 id 참조. '사건 유형 관리' 탭에서 선택합니다.",
            ],
            [
              "기본 학년 그룹",
              "scenario.grade_band_id",
              "A / B / C 중 하나. 기본 난이도를 결정합니다.",
            ],
          ]}
        />
        <h3 style={T.h3}>CONFIG 테이블 (grade_band 별 파라미터)</h3>
        <FieldTable
          rows={[
            ["대상 학생", "config[band].label", "학년 그룹 설명 문자열입니다."],
            [
              "증거 훼손율 (%)",
              "config[band].evidence_damage_rate",
              "해당 학년에서 증거물 중 훼손된 비율입니다.",
            ],
            [
              "용의자 수",
              "config[band].suspect_count",
              "게임에 등장하는 용의자 수입니다.",
            ],
            [
              "체험 시간 (분)",
              "config[band].experience_time",
              "전체 게임 제한 시간입니다.",
            ],
            [
              "증거물 수",
              "config[band].evidence_count",
              "AI가 씬에 배치할 증거물 개수입니다.",
            ],
          ]}
        />
        <div style={T.note}>
          💡 <Code>grade_band</Code> 값(A/B/C)은 슬롯 생성 시 AI 프롬프트
          조립에도 사용됩니다. 난이도 파라미터를 변경하면 생성 결과도
          달라집니다.
        </div>
      </Section>

      <Section title="🗂️ 사건 유형 관리 — 내부 구조">
        <p style={T.p}>
          화면에서 "사건 유형 관리" 탭에서 편집하는 데이터입니다.{" "}
          <Code>scenario.case_type_id</Code>는 이 테이블의 <Code>id</Code>를
          참조합니다.
        </p>
        <h3 style={T.h3}>CASE_TYPE 테이블</h3>
        <FieldTable
          rows={[
            ["(내부 ID)", "caseTypes[].id", '"ct-01" 형식. 자동 부여.'],
            ["유형명", "caseTypes[].name", "절도·살인·방화 등 사건 종류 이름."],
            ["설명", "caseTypes[].description", "사건 유형 간단 설명."],
          ]}
        />
        <h3 style={T.h3}>CASE_JOB_RULE 테이블 (직업 제한)</h3>
        <FieldTable
          rows={[
            ["(내부 ID)", "caseJobRules[].id", '"cjr-01" 형식. 자동 부여.'],
            ["사건 유형", "caseJobRules[].case_type_id", "FK → CASE_TYPE.id."],
            ["허용 직업 키워드", "caseJobRules[].job_keyword", "이 사건 유형에서 AI가 생성할 수 있는 NPC 직업 키워드."],
          ]}
        />
        <h3 style={T.h3}>CASE_EVIDENCE_RULE 테이블 (증거 카테고리 제한)</h3>
        <FieldTable
          rows={[
            ["(내부 ID)", "caseEvidenceRules[].id", '"cer-01" 형식. 자동 부여.'],
            ["사건 유형", "caseEvidenceRules[].case_type_id", "FK → CASE_TYPE.id."],
            ["허용 증거 카테고리", "caseEvidenceRules[].evidence_category", "이 사건 유형에서 유효한 증거물 종류."],
          ]}
        />
        <h3 style={T.h3}>CASE_TARGET_RULE 테이블 (타겟 유형 제한)</h3>
        <FieldTable
          rows={[
            ["(내부 ID)", "caseTargetRules[].id", '"ctr-01" 형식. 자동 부여.'],
            ["사건 유형", "caseTargetRules[].case_type_id", "FK → CASE_TYPE.id."],
            ["허용 타겟 유형", "caseTargetRules[].allowed_target_type", "이 사건 유형에서 범행 대상이 될 수 있는 물품 유형."],
          ]}
        />
        <div style={T.note}>
          💡 세 규칙 테이블은 현재 <strong>문서화 목적</strong>으로 저장됩니다.
          추후 AI 슬롯 생성 시 프롬프트 조립 단계에서 제약 조건으로 주입될
          예정입니다.
        </div>
      </Section>

      <Section title="👥 등장인물 관리 — 내부 구조">
        <p style={T.p}>
          화면에서 "등장인물 관리" 탭에서 편집하는 데이터입니다. 테이블명:{" "}
          <Code>NPC</Code>
        </p>
        <FieldTable
          rows={[
            ["이름", "npcList[].name", "등장인물 이름입니다."],
            [
              "구분",
              "npcList[].npc_kind",
              '"suspect" (용의자) · "witness" (목격자) · "briefer" (안내자) · "target_character" (사건 대상).',
            ],
            [
              "직업/역할",
              "npcList[].profile",
              "등장인물의 직업이나 사건과의 관계입니다.",
            ],
            [
              "(내부 ID)",
              "npcList[].id",
              '"npc-01" 형식. 자동 부여. 정답·단서에서 참조합니다.',
            ],
          ]}
        />
        <div style={T.warn}>
          ⚠️ <Code>id</Code>는 정답 설정(<Code>culprit_npc_id</Code>)과
          연결됩니다. 등장인물을 삭제하면 해당 ID를 참조하는 정답 설정도
          무효화됩니다.
        </div>
      </Section>

      <Section title="🎯 정답 설정 — 내부 구조">
        <p style={T.p}>화면에서 "정답 설정" 탭에서 편집하는 데이터입니다.</p>
        <h3 style={T.h3}>SOLUTION 테이블</h3>
        <FieldTable
          rows={[
            [
              "범인",
              "solution.culprit_npc_id",
              "NPC의 id 값. 범인인 용의자를 지정합니다.",
            ],
            [
              "정답 추론문",
              "solution.correct_inference",
              "학생의 최종 제출 내용과 LLM이 비교할 기준 문장입니다.",
            ],
          ]}
        />
        <h3 style={T.h3}>SOLUTION_CLUE 테이블 (단서 체인)</h3>
        <FieldTable
          rows={[
            [
              "관련 증거물",
              "solutionClues[].evidence_def_id",
              "이 단서와 연결된 증거물의 id입니다.",
            ],
            [
              "이 증거물이 범인을 가리키는 이유",
              "solutionClues[].reasoning_link",
              "LLM 추론 평가 시 근거로 활용됩니다.",
            ],
          ]}
        />
        <div style={T.warn}>
          ⚠️ <strong>불변 원칙</strong> — <Code>culprit_npc_id</Code>,{" "}
          <Code>correct_inference</Code>, 단서 체인 전체는 런타임(플레이어
          씬)에서 읽기 전용입니다. 게임 코드(<Code>SceneWrapper.jsx</Code>{" "}
          등)에서 절대 수정하지 않습니다.
        </div>
      </Section>

      <Section title="🔍 증거물 목록 — 내부 구조">
        <p style={T.p}>
          화면에서 "증거물 목록" 탭에서 편집하는 데이터입니다. 테이블명:{" "}
          <Code>EVIDENCE_DEF</Code>
        </p>
        <h3 style={T.h3}>기본 필드</h3>
        <FieldTable
          rows={[
            ["증거물 이름", "evidenceDefs[].name", "게임 내 표시 이름입니다."],
            [
              "3D 모델 파일",
              "evidenceDefs[].file",
              "public/models/ 기준 .glb 파일명입니다.",
            ],
            [
              "충돌 영역 크기",
              "evidenceDefs[].colliderSize",
              "[W, H, D] 배열. Rapier CuboidCollider 크기(Three.js 단위).",
            ],
            [
              "(내부 ID)",
              "evidenceDefs[].id",
              '"ev-01" 형식. 자동 부여. 단서 설정(evidence_def_id)에서 참조합니다.',
            ],
          ]}
        />
        <h3 style={T.h3}>채증 활동 (miniGame)</h3>
        <FieldTable
          rows={[
            ["활동 유형", "miniGame.type", '"timing" 또는 "rapidclick".'],
            [
              "활동 안내 문구",
              "miniGame.label",
              "미니게임 오버레이에 표시될 설명 문자열입니다.",
            ],
            [
              "난이도",
              "miniGame.difficulty",
              'timing 전용. "easy" / "normal" / "hard" — 바 속도·구간 크기 결정.',
            ],
            [
              "목표 클릭 횟수",
              "miniGame.target",
              "rapidclick 전용. 이 횟수 클릭 시 성공.",
            ],
            [
              "제한 시간 (초)",
              "miniGame.time",
              "rapidclick 전용. 초 단위 타이머.",
            ],
          ]}
        />
      </Section>

      <Section title="🤖 AI 생성 설정 — 내부 구조">
        <p style={T.p}>화면에서 "AI 생성 설정" 탭에서 편집하는 데이터입니다.</p>

        <h3 style={T.h3}>생성 실행 순서</h3>
        <div style={T.flow}>
          {[
            "S3 사건배경",
            "S4 알리바이",
            "S1 공간배치",
            "S2 증거물배치",
            "S5 NPC대사",
          ].map((s, i, arr) => (
            <>
              <div key={s} style={T.flowItem(true)}>
                {s}
              </div>
              {i < arr.length - 1 && (
                <span key={`a${i}`} style={T.arrow}>
                  →
                </span>
              )}
            </>
          ))}
        </div>
        <p style={{ ...T.p, fontSize: 12, color: C.txtMute }}>
          각 슬롯은 이전 슬롯의 생성 결과를 컨텍스트로 받아 프롬프트를
          조립합니다.
        </p>

        <h3 style={T.h3}>GENERATION_SLOT 테이블 필드</h3>
        <FieldTable
          rows={[
            [
              "순서",
              "generation_order",
              "슬롯 실행 순서. S3=1, S4=2, S1=3, S2=4, S5=5.",
            ],
            [
              "항목 (슬롯 키)",
              "slot_key",
              '"S1"~"S5". 생성 파이프라인의 식별자입니다.',
            ],
            [
              "생성 유형",
              "slot_kind",
              "scene_narrative / suspect_alibi / space_placement / evidence_placement / npc_dialogue",
            ],
            [
              "적용 위치",
              "target_field",
              "생성 결과가 저장될 DB 필드 경로 (예: SPACE.placement / NPC.dialogue).",
            ],
            [
              "변형 기준",
              "variable_axis",
              '"grade_band" / "suspect" / "evidence". AI가 어떤 단위로 생성할지 결정.',
            ],
            [
              "기본값",
              "fallback_payload",
              "AI 생성 실패(제약 위반·timeout) 시 대신 사용할 JSON 객체.",
            ],
          ]}
        />

        <h3 style={T.h3}>GENERATION_CONSTRAINT 테이블 필드</h3>
        <FieldTable
          rows={[
            ["적용 항목", "slot_id", "이 규칙이 검증할 슬롯의 id입니다."],
            [
              "규칙 유형",
              "rule_type",
              '"culprit_in_suspects", "evidence_count" 등.',
            ],
            ["규칙 내용", "rule_value", "규칙에 대한 텍스트 설명입니다."],
          ]}
        />
        <div style={T.note}>
          💡 제약 위반 시 <Code>used_fallback=true</Code>로 기록되고{" "}
          <Code>fallback_payload</Code>가 적용됩니다. 어떤 상황에서도 게임은
          중단되지 않습니다.
        </div>
      </Section>

      <Section title="💾 저장 구조">
        <h3 style={T.h3}>현재 (개발 단계)</h3>
        <p style={T.p}>
          에디터에서 "저장" 버튼을 누르면 브라우저의 <Code>localStorage</Code>에
          <Code>csi_fixedLayer</Code> 키로 JSON이 저장됩니다. 페이지를
          새로고침해도 유지되지만, 다른 브라우저·기기에서는 공유되지 않습니다.
        </p>
        <p style={T.p}>
          "JSON 내보내기" 버튼으로 현재 상태를 파일로 다운로드할 수 있습니다.
        </p>

        <h3 style={T.h3}>배포 단계 (예정)</h3>
        <p style={T.p}>
          <Code>localStorage</Code> → Supabase PostgreSQL로 교체 예정입니다. 각
          탭의 "저장" 버튼이 API를 호출하게 됩니다. 런타임 3개 테이블(
          <Code>PLAY_SESSION</Code>, <Code>GENERATED_CONTENT</Code>,
          <Code>PLAY_RESULT</Code>)은 별도 백엔드(FastAPI)가 관리합니다.
        </p>
        <h3 style={T.h3}>PLAY_RESULT 테이블 필드 (런타임, 백엔드 관리)</h3>
        <FieldTable
          rows={[
            ["(내부 ID)", "id", "uuid PK. 백엔드가 자동 부여합니다."],
            [
              "(세션 ID)",
              "session_id",
              "uuid FK → PLAY_SESSION. 플레이 세션과 연결됩니다.",
            ],
            [
              "지목 용의자",
              "accused_npc_id",
              "uuid FK → NPC. 학생이 최종 선택한 용의자의 npc id입니다.",
            ],
            [
              "추론 입력",
              "chosen_inference",
              "학생이 입력한 최종 추론문입니다. LLM 채점 기준(correct_inference)과 비교됩니다.",
            ],
            ["점수", "score", "int. AI 채점 결과 점수입니다."],
            [
              "정답 여부",
              "is_correct",
              "boolean. accused_npc_id가 culprit_npc_id와 일치하고 추론이 정답으로 판정될 때 true.",
            ],
          ]}
        />

        <h3 style={T.h3}>라우팅</h3>
        <table style={T.table}>
          <thead>
            <tr>
              <th style={T.th}>URL</th>
              <th style={T.th}>화면</th>
              <th style={T.th}>컴포넌트</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["/", "학생용 3D 게임 씬", "SceneWrapper.jsx"],
              ["/#/admin", "관리자 에디터 (이 화면)", "AdminApp.jsx"],
            ].map(([url, name, comp]) => (
              <tr key={url}>
                <td style={T.td}>
                  <Code>{url}</Code>
                </td>
                <td style={T.td}>{name}</td>
                <td style={T.td}>
                  <Code>{comp}</Code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  );
}
