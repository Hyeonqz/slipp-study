import { roadmap } from '@/content/data/roadmap'

/**
 * 나의 방향성 로드맵 — 세로 타임라인.
 *
 * 모바일에서도 그대로 동작하고, 항목 수가 늘어도 안 깨진다. 현재 시점 마커에만
 * `--blue-text`를 쓴다(전역 규칙: "지금 여기"에만 — 점과 날짜 텍스트가 14px
 * 간격으로 붙어 있어 둘 다 같은 토큰으로 통일했다, app/global.css 참고).
 * 나머지 draft 마일스톤은 "작성 예정" 배지로 표시되고, `what`이 빈 문자열이어도
 * 배지만 뜨고 레이아웃은 그대로 유지된다.
 *
 * `finish: true`(8주 스터디의 도착점)는 `current`와 같은 파랑 계열을 쓰되 채운
 * 블록으로 구분한다 — 둘 다 파랑이어야 "지금 → 도착점"이 한 줄기로 읽히고,
 * 채움/테두리 차이로 "여기 있다"와 "여기로 간다"가 갈린다.
 *
 * `.fullbleed`로 본문 720px 상한(app/global.css)에서 빠져나오되 자체적으로
 * 900px에서 멈춘다 — 항목마다 한 줄짜리 `detail` 산문이 붙어 있어서 화면 끝까지
 * 늘리면 오히려 읽기 나빠진다. 상한을 푸는 목적은 무한정 넓히는 게 아니라
 * 720px 산문 컬럼보다 한 단계 넓은 자기 폭을 갖는 것이다.
 */
export function Roadmap() {
  return (
    <ul
      className="fullbleed"
      style={{ listStyle: 'none', padding: 0, margin: '20px 0', maxWidth: 900 }}
    >
      {roadmap.map((m, i) => (
        <li key={m.when} style={{ display: 'flex', gap: 14 }}>
          <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}
            aria-hidden
          >
            <span
              style={{
                width: 11,
                height: 11,
                borderRadius: '50%',
                marginTop: 6,
                // Fix Round 1: 점 자체는 텍스트 없는 채움이라 규칙상 --blue로 둬도
                // 대비 기준(3:1)은 통과하지만, 바로 옆(14px 간격) 날짜 라벨이
                // --blue-text라 실측 스크린샷에서 점만 더 밝게 튀어 보였다
                // (task-13-report.md Fix Round 1 참고). 점+라벨을 한 단위로 묶는다.
                background: m.current || m.finish ? 'var(--blue-text)' : 'var(--g300)',
                boxShadow: m.current ? '0 0 0 4px var(--blue-bg)' : undefined,
              }}
            />
            {i < roadmap.length - 1 && (
              <span style={{ width: 2, flex: 1, minHeight: 34, background: 'var(--g200)' }} />
            )}
          </div>

          <div style={{ paddingBottom: 22, flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: m.current || m.finish ? 800 : 700,
                color: m.current || m.finish ? 'var(--blue-text)' : 'var(--g600)',
              }}
            >
              {m.finish && <span aria-hidden>🏁 </span>}
              {m.when}
            </div>

            <div style={{ marginTop: 4 }}>
              {m.draft ? (
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
              ) : (
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: m.finish ? 700 : 400,
                    color: 'var(--g800)',
                  }}
                >
                  {m.what}
                </span>
              )}
            </div>

            {!m.draft && m.detail && (
              <p
                style={{
                  margin: '6px 0 0',
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: 'var(--g600)',
                  background: m.finish ? 'var(--blue-bg)' : 'var(--g50)',
                  borderRadius: 'var(--r-block)',
                  padding: '9px 12px',
                }}
              >
                {m.detail}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
