import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

/**
 * Task 8/9/10에서 반복되고 매 태스크마다 막아온 결함(계획이 준 테스트가 산출물을
 * 실제로 지키지 못하는 것)을 여기서도 막는다. archive-board.test.tsx는
 * `<ArchiveBoardView />`를 고립된 컴포넌트로만 검사해서, archive/index.mdx가
 * 실제로 `<ArchiveBoard />`를 갖고 있는지는 아무도 보지 않는다. 마찬가지로
 * templates/interview.mdx에 개인정보 배너가 실제로 삽입됐는지도 컴포넌트
 * 테스트만으로는 알 수 없다.
 *
 * 그래서 두 문서의 raw 텍스트를 직접 읽어 다음을 단언한다:
 *  - content/docs/archive/index.mdx가 `<ArchiveBoard />`를 실제로 갖는다
 *  - content/docs/templates/interview.mdx가 개인정보 경고 배너
 *    (`<Callout type="warn">` + "인터넷에 공개") 를 실제로 갖는다
 */

function readDoc(path: string): string {
  return readFileSync(path, 'utf-8')
}

describe('content/docs/archive/index.mdx에 <ArchiveBoard />가 실제로 삽입되어 있다', () => {
  it('<ArchiveBoard />를 갖는다', () => {
    const raw = readDoc('content/docs/archive/index.mdx')
    expect(raw).toMatch(/<ArchiveBoard\s*\/>/)
  })
})

describe('content/docs/templates/interview.mdx에 개인정보 배너가 실제로 삽입되어 있다', () => {
  it('<Callout type="warn">을 갖는다', () => {
    const raw = readDoc('content/docs/templates/interview.mdx')
    expect(raw).toMatch(/<Callout type="warn">/)
  })

  it('"이 사이트는 인터넷에 공개됩니다" 경고 문구를 갖는다', () => {
    const raw = readDoc('content/docs/templates/interview.mdx')
    expect(raw).toMatch(/이 사이트는 인터넷에 공개됩니다/)
  })

  it('가명 처리 형식(`A씨(30대 직장인)`) 안내를 갖는다', () => {
    const raw = readDoc('content/docs/templates/interview.mdx')
    expect(raw).toMatch(/A씨\(30대 직장인\)/)
  })
})
