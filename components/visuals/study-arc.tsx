import { curriculum, type Stage } from '@/content/data/curriculum'
import { STAGES } from '@/lib/stage'

/**
 * 8주 스터디를 한눈에 — 단계(눈 → 손 → 머리) 3개 밴드에 8회차를 나눠 담고,
 * 마지막 회차를 결승선으로 강조한다.
 *
 * <JourneyMap />과 목적이 다르다. 여정 맵은 "N회차 산출물이 N+1회차 재료가 된다"는
 * 사슬을 회차 단위로 따라가는 세로 타임라인이고, 이건 8주 전체가 어떤 모양인지
 * 위에서 내려다보는 조감도다 — 로드맵 페이지에서 "이 8주가 무엇인가"를 한 화면에
 * 보여주는 자리에 쓴다.
 *
 * 색 규칙: 단계 틴트(barVar/chipBgVar/chipFgVar)는 여정 맵 바와 단계 칩에서만
 * 쓴다는 전역 규칙을 따른다 — 여기서 틴트가 나가는 곳은 밴드 상단 바와 단계 칩,
 * 정확히 그 두 곳뿐이다. 결승선 카드는 단계와 무관한 "도착점" 표시라서 단계
 * 틴트가 아니라 파랑 토큰(--blue-bg / --blue-text)을 쓴다.
 *
 * 레이아웃: `repeat(auto-fit, minmax(240px, 1fr))` 이라 넓은 화면에서는 3열로
 * 펼쳐지고, 좁아지면 2열 → 1열로 알아서 접힌다. 밴드 안에서 회차는 항상 세로로
 * 쌓이므로 회차가 늘어도 카드가 찌그러지지 않는다.
 */

const STAGE_ORDER: Stage[] = ['eye', 'hand', 'head']

export function StudyArc() {
  const lastWeek = curriculum[curriculum.length - 1]!.no

  return (
    <div className="fullbleed" style={{ margin: '20px 0' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 14,
          alignItems: 'start',
        }}
      >
        {STAGE_ORDER.map((key) => {
          const stage = STAGES[key]
          const weeks = curriculum.filter((w) => w.stage === key)

          return (
            <section
              key={key}
              style={{
                background: 'var(--g50)',
                borderRadius: 'var(--r-card)',
                overflow: 'hidden',
              }}
            >
              <div style={{ height: 4, background: stage.barVar }} aria-hidden />

              <div style={{ padding: '14px 14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      background: stage.chipBgVar,
                      color: stage.chipFgVar,
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '5px 11px',
                      borderRadius: 'var(--r-pill)',
                    }}
                  >
                    {stage.emoji} {stage.label}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--g600)' }}>
                    {stage.range}
                  </span>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0' }}>
                  {weeks.map((w) => {
                    const isFinish = w.no === lastWeek
                    return (
                      <li
                        key={w.no}
                        style={{
                          background: isFinish ? 'var(--blue-bg)' : 'var(--g100)',
                          borderRadius: 'var(--r-block)',
                          padding: '10px 12px',
                          marginTop: 8,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: isFinish ? 'var(--blue-text)' : 'var(--g900)',
                          }}
                        >
                          {isFinish && <span aria-hidden>🏁 </span>}
                          {w.no}회차 — {w.title}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--g600)', marginTop: 3 }}>
                          {w.headline}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
