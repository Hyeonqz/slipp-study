import Link from 'next/link'
import { curriculum, currentWeek } from '@/content/data/curriculum'
import { stageOf } from '@/lib/stage'

/**
 * 홈 문서 "8회차 여정"의 원본 표를 대체한다.
 *
 * 원본 표는 회차 / 단계 / 이번 시간에 하는 것(headline) / 다음 시간까지 만들어
 * 올 것(deliverable) 4열이었다. 이 컴포넌트는 그 네 가지를 전부 카드 안에
 * 담는다 — 표의 "이번 시간에 하는 것"/"다음 시간까지 만들어 올 것" 열 헤더를
 * "이번 시간"/"다음까지"로 축약해 라벨로 붙이고, 값(headline/deliverable)은
 * 원문 그대로 보여준다. 단계는 emoji(👀/✋/🧠) + 짧은 라벨(눈/손/머리)로 표시해
 * 색에만 의존하지 않는다.
 *
 * 산출물이 다음 회차의 입력이 되는 사슬(1회차 숙제 → 2회차 발표 재료 → 3회차
 * 봉인 개봉)을 드러내는 게 목적이라, 표보다 "여정"으로 읽히도록 카드를 가로로
 * 이어 붙인다. 8칸을 세로로 쌓으면 너무 길어지므로(`<ThreeStages />`/
 * `<TwoHourBlock />`가 세로 스택을 택한 것과는 상황이 다르다 — 거기는 순서
 * 자체가 논지라 어중간한 폭에서 대열이 끊기면 안 됐고, 여기는 8개를 훑어보는
 * 게 목적이라 가로 스크롤이 자연스럽다) 가로 스크롤 + 스냅을 쓴다.
 *
 * 컨테이너 자신만 `overflow-x: auto`이고 폭을 100%로 고정한다 — #nd-page의
 * 640px 프로즈 컬럼 폭을 넘지 않고, 페이지 전체가 가로로 밀리지 않는다(그 컬럼
 * 안에서만 스크롤).
 */
export function JourneyMap() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        margin: '20px 0',
        width: '100%',
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        paddingBottom: 6,
      }}
    >
      {curriculum.map((w) => {
        const stage = stageOf(w.no)
        const isCurrent = currentWeek === w.no
        const stageLabel = stage.label.split(' ')[0]

        return (
          <Link
            key={w.slug}
            href={`/weeks/${w.slug}`}
            style={{
              flex: '0 0 172px',
              scrollSnapAlign: 'start',
              textDecoration: 'none',
              background: isCurrent ? 'var(--blue-bg)' : 'var(--g50)',
              borderRadius: 'var(--r-block)',
              padding: '10px 12px 12px',
            }}
          >
            <div
              aria-hidden
              style={{
                height: 6,
                borderRadius: 'var(--r-pill)',
                background: isCurrent ? 'var(--blue)' : stage.barVar,
                marginBottom: 8,
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span
                className="tabular"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: isCurrent ? 'var(--blue)' : 'var(--g600)',
                }}
              >
                {String(w.no).padStart(2, '0')}
              </span>
              <span style={{ fontSize: 12 }}>{stage.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--g600)' }}>
                {stageLabel}
              </span>
            </div>

            {isCurrent && (
              <div
                style={{
                  display: 'inline-block',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#fff',
                  background: 'var(--blue)',
                  borderRadius: 'var(--r-pill)',
                  padding: '1.5px 6px',
                  margin: '6px 0 0',
                }}
              >
                이번 주
              </div>
            )}

            <div
              style={{
                fontSize: 13.5,
                fontWeight: 800,
                color: 'var(--g900)',
                marginTop: 6,
                lineHeight: 1.35,
              }}
            >
              {w.title}
            </div>

            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--g600)', marginTop: 8 }}>
              이번 시간
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--g700)', marginTop: 2, lineHeight: 1.45 }}>
              {w.headline}
            </div>

            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--g600)', marginTop: 8 }}>
              다음까지
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--g700)', marginTop: 2, lineHeight: 1.45 }}>
              {w.deliverable}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
