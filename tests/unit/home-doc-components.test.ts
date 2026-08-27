import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

/**
 * Task 8/9에서 반복된 결함(계획이 준 테스트가 산출물을 실제로 지키지 못하는 것)을
 * 여기서도 막는다. journey-map.test.tsx / current-week-banner.test.tsx는
 * <JourneyMap />과 <CurrentWeekBanner />를 고립된 컴포넌트로만 검사해서,
 * content/docs/index.mdx가 실제로 이 컴포넌트를 갖고 있는지는 아무도 보지 않는다.
 *
 * 그래서 index.mdx의 raw 텍스트를 직접 읽어 다음을 단언한다:
 *  - frontmatter 뒤에 <CurrentWeekBanner />를 실제로 갖는다
 *  - <JourneyMap />을 실제로 갖는다
 *  - 교체 대상이었던 원본 8회차 표(회차/단계/이번 시간에 하는 것/다음 시간까지
 *    만들어 올 것)가 더 이상 남아 있지 않다
 *  - Task 6이 쓴 "누구를 위한 스터디인가" 섹션과 그 뒤 "왜 하는가" 섹션은
 *    손대지 않고 그대로 남아 있다 (교체 대상은 표 하나뿐)
 */

function readIndexDoc(): string {
  return readFileSync('content/docs/index.mdx', 'utf-8')
}

describe('content/docs/index.mdx에 <CurrentWeekBanner />와 <JourneyMap />이 실제로 삽입되어 있다', () => {
  it('<CurrentWeekBanner />를 갖는다', () => {
    const raw = readIndexDoc()
    expect(raw).toMatch(/<CurrentWeekBanner\s*\/>/)
  })

  it('<JourneyMap />을 갖는다', () => {
    const raw = readIndexDoc()
    expect(raw).toMatch(/<JourneyMap\s*\/>/)
  })

  it('원본 8회차 표(4열 마크다운 표)가 더 이상 없다', () => {
    const raw = readIndexDoc()
    expect(raw).not.toMatch(/\|\s*회차\s*\|\s*단계\s*\|/)
    expect(raw).not.toMatch(/\*\*\[1\]\(\/weeks\/01-kickoff\)\*\*/)
  })

  it('"누구를 위한 스터디인가" 섹션은 손대지 않고 그대로 남아 있다', () => {
    const raw = readIndexDoc()
    expect(raw).toMatch(/## 누구를 위한 스터디인가/)
    expect(raw).toMatch(/개발은 다루지 않습니다/)
    expect(raw).toMatch(/\*\*1인 사업이든 부업이든, 실제로 뭔가를 이루는 것\.\*\*/)
  })

  it('"왜 하는가" 섹션은 손대지 않고 그대로 남아 있다', () => {
    const raw = readIndexDoc()
    expect(raw).toMatch(/## 왜 하는가/)
    expect(raw).toMatch(/이거 왜 만들어요/)
  })
})
