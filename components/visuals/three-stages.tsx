import { STAGES } from '@/lib/stage'

/**
 * how/three-stages.mdx 원본의 ASCII 3단 구조 블록 + 요리 비유 표 + 단계별 결과
 * 차이("1단만 하면"/"1+2단만 하면"/"3단까지 하면")를 그대로 옮긴다.
 * 단계 이름·이모지·회차 범위는 lib/stage.ts의 STAGES를 그대로 쓴다 — 이 파일이
 * 유일하게 그 값을 아는 곳이라는 규칙을 지키기 위해서다.
 *
 * 단계 틴트(색)는 여정 맵의 바·칩 전용 규칙이라 여기서는 --g50 회색 카드를 쓴다.
 * 단계 구분은 이모지 + 라벨로 한다.
 */
const DETAIL: Record<string, { doing: string; cooking: string; ifOnly: string }> = {
  eye: {
    doing: '남의 서비스를 뜯어본다',
    cooking: '맛집 가서 먹어보고 레시피 추측하기',
    ifOnly: '1단만 하면 — 분석은 잘하는데 문서는 못 쓰는 사람',
  },
  hand: {
    doing: '내가 직접 기획 문서를 쓴다',
    cooking: '레시피 직접 써보기',
    ifOnly: '1+2단만 하면 — 문서는 쓰는데 결정은 못 하는 사람',
  },
  head: {
    doing: '내 아이디어를 실제로 검증한다',
    cooking: '내 요리 만들어서 남한테 먹여보기 — 여기서만 실력이 늚',
    ifOnly: '3단까지 하면 — 마음가짐이 생김. 3단에서만 생깁니다',
  },
}

export function ThreeStages() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 10,
        margin: '20px 0',
      }}
    >
      {Object.values(STAGES).map((s) => {
        const d = DETAIL[s.key]
        return (
          <div
            key={s.key}
            style={{
              background: 'var(--g50)',
              borderRadius: 'var(--r-card)',
              padding: '16px 18px',
            }}
          >
            <div style={{ fontSize: 26 }}>{s.emoji}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--g900)', marginTop: 4 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--g600)' }} className="tabular">
              {s.range}
            </div>
            <p style={{ fontSize: 14.5, color: 'var(--g700)', marginTop: 10, lineHeight: 1.7 }}>
              {d.doing}
            </p>
            <p
              style={{
                fontSize: 12.5,
                color: 'var(--g600)',
                marginTop: 10,
                paddingTop: 10,
                borderTop: '1px solid var(--g200)',
              }}
            >
              {d.cooking}
            </p>
            <p style={{ fontSize: 12.5, color: 'var(--g600)', marginTop: 8 }}>{d.ifOnly}</p>
          </div>
        )
      })}
    </div>
  )
}
