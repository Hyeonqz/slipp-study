import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

/**
 * Task 8/9/10에서 반복된 결함(계획이 준 테스트가 산출물을 실제로 지키지 못하는 것)을
 * 여기서도 막는다. why-study.test.tsx / roadmap.test.tsx는 <WhyStudy />와
 * <Roadmap />을 고립된 컴포넌트로만 검사해서, start/why.mdx와 start/roadmap.mdx가
 * 실제로 이 컴포넌트를 갖고 있는지는 아무도 보지 않는다.
 *
 * 그래서 두 문서의 raw 텍스트를 직접 읽어 다음을 단언한다:
 *  - start/why.mdx가 <WhyStudy />를 실제로 갖는다
 *  - start/roadmap.mdx가 <Roadmap />를 실제로 갖는다
 */

function readDoc(slug: string): string {
  return readFileSync(`content/docs/start/${slug}.mdx`, 'utf-8')
}

describe('start/why.mdx에 <WhyStudy />가 실제로 삽입되어 있다', () => {
  it('<WhyStudy />를 갖는다', () => {
    const raw = readDoc('why')
    expect(raw).toMatch(/<WhyStudy\s*\/>/)
  })
})

describe('start/roadmap.mdx에 <Roadmap />이 실제로 삽입되어 있다', () => {
  it('<Roadmap />을 갖는다', () => {
    const raw = readDoc('roadmap')
    expect(raw).toMatch(/<Roadmap\s*\/>/)
  })

  it('<StudyArc />도 갖는다 — 8주가 어떤 모양인지 보여주는 조감도', () => {
    const raw = readDoc('roadmap')
    expect(raw).toMatch(/<StudyArc\s*\/>/)
  })
})
