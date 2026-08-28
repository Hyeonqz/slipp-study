import { curriculum } from '@/content/data/curriculum'

/**
 * 회차 문서에서 가장 중요한 정보("다음 주까지 뭘 만들어 와야 하는가")를
 * 본문 하단에서 꺼내 독립된 파란 카드로 보여준다. --blue는 "지금 여기"에만
 * 쓴다는 전역 규칙에서 이 카드가 바로 그 "지금 여기"다.
 */
export function Homework({ week }: { week: number }) {
  const w = curriculum.find((x) => x.no === week)
  if (!w) throw new Error(`curriculum에 ${week}회차가 없습니다`)

  const isLast = week === curriculum.length

  return (
    <div
      style={{
        background: 'var(--blue-bg)',
        borderRadius: 'var(--r-card)',
        padding: '17px 19px',
        margin: '20px 0',
      }}
    >
      <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--blue-text)' }}>
        {isLast ? '숙제' : `${week + 1}주차 숙제`}
      </div>
      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--g900)', marginTop: 5 }}>
        {isLast ? '없어요 — 뒤풀이입니다' : w.deliverable}
      </div>
    </div>
  )
}
