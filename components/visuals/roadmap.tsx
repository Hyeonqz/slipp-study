import { roadmap } from '@/content/data/roadmap'

/**
 * 나의 방향성 로드맵 — 세로 타임라인.
 *
 * 모바일에서도 그대로 동작하고, 항목 수가 늘어도 안 깨진다. 현재 시점 마커에만
 * `--blue`를 쓴다(전역 규칙: "지금 여기"에만). 나머지 draft 마일스톤은 "작성
 * 예정" 배지로 표시되고, `what`이 빈 문자열이어도 배지만 뜨고 레이아웃은
 * 그대로 유지된다.
 */
export function Roadmap() {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0' }}>
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
                background: m.current ? 'var(--blue-text)' : 'var(--g300)',
                boxShadow: m.current ? '0 0 0 4px var(--blue-bg)' : undefined,
              }}
            />
            {i < roadmap.length - 1 && (
              <span style={{ width: 2, flex: 1, minHeight: 34, background: 'var(--g200)' }} />
            )}
          </div>
          <div style={{ paddingBottom: 22 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: m.current ? 800 : 700,
                color: m.current ? 'var(--blue-text)' : 'var(--g600)',
              }}
            >
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
                <span style={{ fontSize: 15, color: 'var(--g800)' }}>{m.what}</span>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
