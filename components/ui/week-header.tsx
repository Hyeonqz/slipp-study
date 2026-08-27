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
      <span style={badge} className="tabular">{week}회차</span>
      <span style={{ ...badge, background: stage.chipBgVar, color: stage.chipFgVar }}>
        {stage.emoji} {stage.label}
      </span>
      <span style={badge}>2시간</span>
    </div>
  )
}
