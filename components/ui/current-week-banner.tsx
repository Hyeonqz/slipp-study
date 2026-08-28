import Link from 'next/link'
import { curriculum, currentWeek } from '@/content/data/curriculum'

/**
 * 홈 문서 상단에 "지금 여기"를 알리는 배너. currentWeek가 null이면(스터디
 * 시작 전, 기본값) 아무것도 그리지 않는다 — 이 상태가 예외가 아니라 정상
 * 상태이므로 null 렌더도 레이아웃이 멀쩡해야 한다.
 *
 * "blue는 지금 여기에만" 규칙의 그 "지금 여기"가 정확히 이 배너와 여정 맵의
 * 현재 회차 칸이다.
 */
export function CurrentWeekBanner() {
  if (currentWeek === null) return null
  const w = curriculum.find((x) => x.no === currentWeek)
  if (!w) return null

  return (
    <Link
      href={`/weeks/${w.slug}`}
      style={{
        display: 'block',
        background: 'var(--blue-bg)',
        borderRadius: 'var(--r-card)',
        padding: '14px 18px',
        margin: '0 0 24px',
        textDecoration: 'none',
      }}
    >
      <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--blue-text)' }}>이번 주</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--g900)', marginTop: 3 }}>
        {currentWeek}회차 · {w.title}
      </div>
      <div style={{ fontSize: 13, color: 'var(--g700)', marginTop: 3 }}>{w.headline}</div>
    </Link>
  )
}
