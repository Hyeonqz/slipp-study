import Link from 'next/link'
import { why } from '@/content/data/why'

/**
 * "왜 이 스터디를 만들었나" — 겪은 문제 → 진단 → 설계 결정, 3칸.
 *
 * 브리프 원안은 `repeat(auto-fit, minmax(220px, 1fr))` 가로 그리드였다. 본문 폭이
 * `#nd-page`에 640px로 고정된 이 문서에서 <ThreeStages />(Task 9)·<JourneyMap />
 * (Task 10)이 정확히 같은 그리드로 "2+1" 붕괴를 겪었고, 두 컴포넌트 모두 실측 끝에
 * 세로 스택으로 확정했다. 이 컴포넌트는 세 칸의 순서(겪은 문제 → 진단 → 그래서
 * 이렇게 설계했다) 자체가 논지라 어중간한 폭에서 대열이 끊기는 걸 감수할 수 없어서
 * 처음부터 세로 스택으로 간다.
 *
 * 세로만으로는 "다음 칸이 이전 칸의 결과"라는 방향성이 드러나지 않는다. 그래서
 * <JourneyMap />이 회차 사이에 화살표 + 연결 문구를 넣은 것과 같은 이유로, 칸
 * 사이에 "그래서" 화살표를 넣어 문제 → 진단 → 설계라는 인과 사슬을 명시한다.
 */
const CONNECTORS = ['그래서', '그래서']

function Draft() {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--g600)',
        background: 'var(--g100)',
        borderRadius: 'var(--r-pill)',
        padding: '2px 8px',
      }}
    >
      작성 예정
    </span>
  )
}

export function WhyStudy() {
  return (
    <ul
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        margin: '20px 0',
        padding: 0,
        listStyle: 'none',
      }}
    >
      {why.map((c, i) => (
        <li key={c.label}>
          <div
            style={{
              background: 'var(--g50)',
              borderRadius: 'var(--r-card)',
              padding: '16px 18px',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: 'var(--g600)',
                textTransform: 'uppercase',
              }}
            >
              {c.label}
            </div>
            <div style={{ marginTop: 8 }}>
              {c.draft ? (
                <Draft />
              ) : (
                <p style={{ fontSize: 14, color: 'var(--g700)', lineHeight: 1.7, margin: 0 }}>
                  {c.body}
                </p>
              )}
            </div>
            {c.links && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {c.links.map((l) => (
                  <Link key={l.href} href={l.href} style={{ fontSize: 13, color: 'var(--blue-text)' }}>
                    {l.text} →
                  </Link>
                ))}
              </div>
            )}
          </div>

          {i < why.length - 1 && (
            <div
              aria-hidden
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                margin: '6px 0 6px 20px',
                fontSize: 11.5,
                fontWeight: 700,
                color: 'var(--g600)',
              }}
            >
              <span>↓</span>
              <span>{CONNECTORS[i]}</span>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
