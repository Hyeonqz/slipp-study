/**
 * how/two-hours.mdx 원본의 ASCII 타임테이블 코드블록을 옮긴다.
 * 데스크톱에서도 세로 스택이다 — 가로 120분 바는 모바일에서 라벨·설명 텍스트가
 * 들어갈 자리가 없고, 세로 나열이 "어디에 시간을 쓰는가"를 오히려 더 잘 보여준다.
 *
 * 반박 타임 하나만 파랑으로 강조한다 (이 스터디의 핵심이라는 게 논지이므로
 * "blue는 지금 여기에만" 규칙의 예외로 허용됨 — 태스크 브리프 결정 사항).
 * 분 단위 텍스트는 --blue-text, 진행률 바는 --blue — 바가 텍스트와 12px
 * 떨어져 있고 폭이 넓어 별개 시각 요소로 읽혀 통일하지 않았다(Fix Round 1
 * 판단, app/global.css 상단 규칙 주석 참고).
 */
export interface Block {
  minutes: number
  label: string
  detail: string
  hero?: boolean
}

export const BLOCKS: Block[] = [
  { minutes: 10, label: '체크인', detail: '이번 주 어땠는지, 산출물 만들다 막힌 지점 공유' },
  {
    minutes: 50,
    label: '발표',
    detail:
      '각자 만들어 온 산출물 발표 (1인당 10분 내외). 슬라이드 만들지 마세요 — 문서 그대로 화면공유하면 됩니다',
  },
  {
    minutes: 40,
    label: '🗡 반박 타임',
    detail:
      '"악마의 변호인" 1명이 그 회차 발표를 전부 깨려고 시도. 역기획 회차엔 "그 회사 CEO 역할" 1명이 개선안을 방어. 나머지는 질문. 역할은 매 회차 돌아가면서 맡습니다',
    hero: true,
  },
  {
    minutes: 20,
    label: '다음 회차 정하기',
    detail:
      '다음 주제·대상 회사 확정, 역할 배정 (악마의 변호인, CEO 역), 막히면 도와줄 사람 짝 지정',
  },
]

const TOTAL = 120

export function TwoHourBlock() {
  return (
    <div
      style={{
        background: 'var(--g50)',
        borderRadius: 'var(--r-card)',
        padding: '16px 18px',
        margin: '20px 0',
      }}
    >
      {BLOCKS.map((b) => (
        <div key={b.label} style={{ padding: '10px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              className="tabular"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: b.hero ? 'var(--blue-text)' : 'var(--g600)',
                width: 42,
                flexShrink: 0,
              }}
            >
              {b.minutes}분
            </span>
            <span
              aria-hidden
              style={{
                height: 8,
                borderRadius: 'var(--r-pill)',
                // Fix Round 1 판단: 이 바도 옆(12px 간격)에 --blue-text 분 라벨이
                // 있지만, 실측 스크린샷으로 비교한 결과 점 배지(journey-map/roadmap)와
                // 달리 폭이 넓은 진행률 바라서 "같은 배지가 어긋난" 것보다 "분량을
                // 나타내는 별개의 시각 요소"로 읽혔다 — Toss blue 유지
                // (task-13-report.md Fix Round 1 판단 근거 참고).
                background: b.hero ? 'var(--blue)' : 'var(--g300)',
                width: `${(b.minutes / TOTAL) * 100}%`,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 14.5,
                fontWeight: b.hero ? 800 : 600,
                color: b.hero ? 'var(--g900)' : 'var(--g700)',
              }}
            >
              {b.label}
            </span>
          </div>
          <p
            style={{ fontSize: 12.5, color: 'var(--g600)', margin: '4px 0 0 54px', lineHeight: 1.6 }}
          >
            {b.detail}
          </p>
        </div>
      ))}
      <p
        style={{
          fontSize: 12.5,
          color: 'var(--g600)',
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid var(--g200)',
          lineHeight: 1.7,
        }}
      >
        그래서 <b style={{ color: 'var(--g900)' }}>반박이 40분입니다.</b>
      </p>
    </div>
  )
}
