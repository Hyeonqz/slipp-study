import { curriculum } from '@/content/data/curriculum'
import { stageOf } from '@/lib/stage'

/**
 * 단계 배지에는 단계 틴트를 쓴다 — 전역 색 규칙("단계 틴트는 여정 맵의 바와
 * 단계 칩에서만")의 예외가 아니라 정확히 그 "단계 칩"이 이 컴포넌트다.
 * 색을 직접 쓰지 않고 반드시 lib/stage.ts의 chipBgVar/chipFgVar 매핑을 거친다.
 */
const badge: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  background: 'var(--g100)',
  color: 'var(--g700)',
  fontSize: 12,
  fontWeight: 700,
  padding: '5px 11px',
  borderRadius: 'var(--r-pill)',
}

export function WeekHeader({ week }: { week: number }) {
  const w = curriculum.find((x) => x.no === week)
  if (!w) throw new Error(`curriculum에 ${week}회차가 없습니다`)
  const stage = stageOf(week)

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '0 0 16px' }}>
      {/* 회차 번호 배지는 두지 않는다 — 문서 제목(frontmatter title)이 이미
          `N회차 — 제목` 형식이라(content/data/curriculum.ts weekLabel 참고)
          바로 위 H1 과 글자 그대로 겹친다. 여기 남는 건 제목이 말해주지 않는
          정보(단계, 소요 시간)뿐이다. `week` prop 은 여전히 단계 판정에 쓰이고,
          범위를 벗어난 회차면 stageOf 가 던진다. */}
      <span style={{ ...badge, background: stage.chipBgVar, color: stage.chipFgVar }}>
        {stage.emoji} {stage.label}
      </span>
      <span style={badge}>2시간</span>
    </div>
  )
}
