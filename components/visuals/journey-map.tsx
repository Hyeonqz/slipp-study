import Link from 'next/link'
import { curriculum, currentWeek } from '@/content/data/curriculum'
import { stageOf } from '@/lib/stage'

/**
 * 홈 문서 "8회차 여정"의 원본 표를 대체한다.
 *
 * 원본 표는 회차 / 단계 / 이번 시간에 하는 것(headline) / 다음 시간까지 만들어
 * 올 것(deliverable) 4열이었다. 이 컴포넌트는 그 네 가지를 전부 담는다 —
 * "이번 시간"/"다음까지" 라벨을 붙이고 값(headline/deliverable)은 원문 그대로
 * 보여준다. 단계는 emoji(👀/✋/🧠) + 짧은 라벨(눈/손/머리) + 색 점으로 표시해
 * 색에만 의존하지 않는다.
 *
 * 세로 타임라인으로 그린다 (가로 스크롤 카드가 아니다). 최초 구현은 가로
 * 스크롤 카드였는데, 리뷰에서 "640px 프로즈 컬럼 안에서는 어떤 카드 폭을
 * 골라도 8칸 중 3.5칸 정도만 보이고, 넓혀도(8×172px+7×8gap=1432px) 1440px
 * 데스크톱의 실제 본문 폭(~890px)조차 못 채워서 '한눈에 여정을 본다'는 목적을
 * 구조적으로 달성할 수 없다"는 지적을 받았다 — 좁혀서 8칸을 다 넣으려면
 * 칸당 80px이 되어 방금 되살린 headline을 다시 잘라내야 했다. `<ThreeStages />`가
 * 정확히 같은 640px 스퀴즈를 세로 스택으로 푼 선례를 그대로 따른다.
 *
 * 세로 스택은 표보다 나은 점이 하나 더 있다 — 화면 순서 자체가 "1회차
 * 산출물이 2회차 재료가 된다"는 사슬과 같은 방향이라, 각 회차 카드 사이에
 * 화살표 + 설명 한 줄을 넣어 "이번 산출물 → 다음 회차 재료"를 명시적으로
 * 보여줄 수 있다. 가로 스크롤러에서는 이 연결을 읽기 좋게 그릴 수 없었다.
 */
export function JourneyMap() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', margin: '20px 0' }}>
      {curriculum.map((w, i) => {
        const stage = stageOf(w.no)
        const isCurrent = currentWeek === w.no
        const stageLabel = stage.label.split(' ')[0]
        const next = curriculum[i + 1]

        return (
          <div key={w.slug}>
            <Link
              href={`/weeks/${w.slug}`}
              style={{
                display: 'block',
                textDecoration: 'none',
                background: isCurrent ? 'var(--blue-bg)' : 'var(--g50)',
                borderRadius: 'var(--r-card)',
                padding: '14px 16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span
                  aria-hidden
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 'var(--r-pill)',
                    background: isCurrent ? 'var(--blue)' : stage.barVar,
                    flexShrink: 0,
                  }}
                />
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
                <span style={{ fontSize: 13 }}>{stage.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--g600)' }}>
                  {stageLabel}
                </span>
                {isCurrent && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#fff',
                      background: 'var(--blue)',
                      borderRadius: 'var(--r-pill)',
                      padding: '1.5px 6px',
                    }}
                  >
                    이번 주
                  </span>
                )}
              </div>

              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: 'var(--g900)',
                  marginTop: 7,
                  lineHeight: 1.35,
                }}
              >
                {w.title}
              </div>

              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--g600)', marginTop: 10 }}>
                이번 시간
              </div>
              <div
                style={{ fontSize: 13.5, color: 'var(--g700)', marginTop: 2, lineHeight: 1.55 }}
              >
                {w.headline}
              </div>

              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--g600)', marginTop: 10 }}>
                다음까지
              </div>
              <div
                style={{ fontSize: 13.5, color: 'var(--g700)', marginTop: 2, lineHeight: 1.55 }}
              >
                {w.deliverable}
              </div>
            </Link>

            {next && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  margin: '6px 0 6px 20px',
                  fontSize: 11.5,
                  color: 'var(--g600)',
                }}
              >
                <span aria-hidden style={{ fontWeight: 700 }}>
                  ↓
                </span>
                <span>
                  {w.no}회차 산출물이 {next.no}회차 재료가 돼요
                </span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
