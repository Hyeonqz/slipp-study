import { STAGES } from '@/lib/stage'

/**
 * how/three-stages.mdx 원본의 ASCII 3단 구조 블록 + 요리 비유 표 + 단계별 결과
 * 차이("1단만 하면"/"1+2단만 하면"/"3단까지 하면")를 그대로 옮긴다.
 * 단계 이름·이모지·회차 범위는 lib/stage.ts의 STAGES를 그대로 쓴다 — 이 파일이
 * 유일하게 그 값을 아는 곳이라는 규칙을 지키기 위해서다.
 *
 * 단계 틴트(색)는 여정 맵의 바·칩 전용 규칙이라 여기서는 --g50 회색 카드를 쓴다.
 * 단계 구분은 이모지 + 라벨로 한다.
 *
 * 세로 스택으로 렌더링한다 (가로 그리드가 아니다). `repeat(auto-fit, minmax(Npx, 1fr))`로
 * "데스크톱 3칸 → 좁은 화면 세로 스택"을 미디어 쿼리 없이 구현하면, 본문 컬럼이 640px로
 * 고정된 이 문서에서 사이드바가 걸치는 중간 너비(예: 400~480px, 768px 부근)마다 "2+1"로
 * 깨지는 지점이 실측으로 확인됐다 — 3칸에 맞을 만큼 min-width를 낮추면 이번엔 데스크톱
 * 텍스트가 너무 좁아진다. 이 컴포넌트가 보여주는 눈→손→머리는 순서가 논지 그 자체라
 * 어중간한 폭에서 대열이 끊기는 걸 감수할 수 없어서, 모든 폭에서 결정론적으로 한 줄씩
 * 쌓이는 세로 스택으로 확정했다 (`<TwoHourBlock />`과 같은 이유).
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
        display: 'flex',
        flexDirection: 'column',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 26 }}>{s.emoji}</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--g900)' }}>{s.label}</span>
              <span className="tabular" style={{ fontSize: 12.5, color: 'var(--g600)' }}>
                {s.range}
              </span>
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
