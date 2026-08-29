import Link from 'next/link'
import { curriculum, currentWeek, formatWeekDate } from '@/content/data/curriculum'
import { stageOf } from '@/lib/stage'

/**
 * 참가자 관점으로 커리큘럼을 뒤집어 보여준다.
 *
 * `<JourneyMap />`은 진행 방향("이번 시간에 뭘 하고, 다음까지 뭘 만들어 오나")으로
 * 커리큘럼을 읽는다. 팀원이 실제로 묻는 건 반대 방향이다 — "N회차에 들어가기
 * 전에 나는 뭘 끝내놨어야 하나". 그 답은 두 조각이고, 사이트 어디에도 모여
 * 있지 않았다:
 *
 *  - 만들어 갈 것 = **전 회차**의 `deliverable` (1회차는 없음)
 *  - 미리 볼 것   = **이번 회차**의 `preread` (회차 문서 안에만 있었다)
 *
 * 특히 `preread`는 지금까지 8개 회차 문서를 하나씩 열어야만 보였다. 이 목록이
 * preread를 한 자리에 모으는 유일한 화면이다.
 *
 * 커리큘럼 자체는 여전히 `content/data/curriculum.ts` 하나가 원천이다 — 여기서
 * 새로 만드는 값은 없고, 회차를 한 칸 밀어 짝지을 뿐이다.
 */
export function PrepList() {
  return (
    <div
      data-testid="prep-list"
      style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '20px 0' }}
    >
      {curriculum.map((w, i) => {
        const stage = stageOf(w.no)
        const isCurrent = currentWeek === w.no
        const bring = curriculum[i - 1]?.deliverable
        const preread = w.preread ?? []

        return (
          <Link
            key={w.slug}
            href={`/weeks/${w.slug}`}
            style={{
              display: 'block',
              textDecoration: 'none',
              background: isCurrent ? 'var(--blue-bg)' : 'var(--g50)',
              borderRadius: 'var(--r-card)',
              padding: '14px 16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
              <span
                className="tabular"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: isCurrent ? 'var(--blue-text)' : 'var(--g600)',
                }}
              >
                {String(w.no).padStart(2, '0')}
              </span>
              <span style={{ fontSize: 13 }} aria-hidden>
                {stage.emoji}
              </span>
              <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--g900)' }}>{w.title}</span>
              {w.date && (
                <span
                  className="tabular"
                  style={{
                    marginLeft: 'auto',
                    fontSize: 12,
                    fontWeight: 700,
                    color: isCurrent ? 'var(--blue-text)' : 'var(--g600)',
                  }}
                >
                  {formatWeekDate(w.date)}
                </span>
              )}
              {isCurrent && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#fff',
                    background: 'var(--blue-fill)',
                    borderRadius: 'var(--r-pill)',
                    padding: '1.5px 6px',
                  }}
                >
                  이번 주
                </span>
              )}
            </div>

            {bring ? (
              <>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--g600)', marginTop: 10 }}>
                  만들어 갈 것
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--g700)', marginTop: 2, lineHeight: 1.55 }}>
                  {bring}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13.5, color: 'var(--g700)', marginTop: 10, lineHeight: 1.55 }}>
                준비물 없어요 — 그냥 오시면 돼요.
              </div>
            )}

            {preread.length > 0 && (
              <>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--g600)', marginTop: 10 }}>
                  미리 볼 것
                </div>
                <ul
                  style={{
                    fontSize: 13.5,
                    color: 'var(--g700)',
                    margin: '2px 0 0',
                    paddingLeft: 17,
                    lineHeight: 1.55,
                  }}
                >
                  {preread.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </>
            )}
          </Link>
        )
      })}
    </div>
  )
}
