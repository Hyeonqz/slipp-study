import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

/**
 * Task 9 — Task 2/3/4/7에서 반복되고 Task 8에서 처음 막은 결함(계획이 준 테스트가
 * 산출물을 실제로 지키지 못하는 것)을 여기서도 막는다. three-stages.test.tsx /
 * two-hour-block.test.tsx는 <ThreeStages />와 <TwoHourBlock />를 고립된
 * 컴포넌트로만 검사해서, how/three-stages.mdx와 how/two-hours.mdx가 실제로
 * 이 컴포넌트를 갖고 있는지는 아무도 보지 않는다.
 *
 * 그래서 두 문서의 raw 텍스트를 직접 읽어 다음을 단언한다:
 *  - how/three-stages.mdx가 <ThreeStages />를 실제로 갖는다
 *  - how/two-hours.mdx가 <TwoHourBlock />를 실제로 갖는다
 *  - 교체 대상이었던 원본 ASCII 코드블록(3단 구조 다이어그램 / 2시간 타임테이블)이
 *    더 이상 남아 있지 않다
 */

function readDoc(slug: string): string {
  return readFileSync(`content/docs/how/${slug}.mdx`, 'utf-8')
}

describe('how/three-stages.mdx에 <ThreeStages />가 실제로 삽입되어 있다', () => {
  it('<ThreeStages />를 갖는다', () => {
    const raw = readDoc('three-stages')
    expect(raw).toMatch(/<ThreeStages\s*\/>/)
  })

  it('원본 3단 구조 ASCII 코드블록이 더 이상 없다', () => {
    const raw = readDoc('three-stages')
    expect(raw).not.toMatch(/1단 \(1~3회\)/)
  })
})

describe('how/two-hours.mdx에 <TwoHourBlock />가 실제로 삽입되어 있다', () => {
  it('<TwoHourBlock />를 갖는다', () => {
    const raw = readDoc('two-hours')
    expect(raw).toMatch(/<TwoHourBlock\s*\/>/)
  })

  it('원본 타임테이블 ASCII 코드블록이 더 이상 없다', () => {
    const raw = readDoc('two-hours')
    expect(raw).not.toMatch(/00:00 ~ 00:10/)
  })

  it('"왜 반박 타임"이 40분이나 되나 이후 산문은 그대로 남아 있다', () => {
    const raw = readDoc('two-hours')
    expect(raw).toMatch(/왜 "반박 타임"이 40분이나 되나/)
    expect(raw).toMatch(/1회차만 예외/)
  })
})
