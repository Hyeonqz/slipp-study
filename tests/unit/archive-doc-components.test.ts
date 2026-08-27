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

/**
 * Fix Round 1 — 리뷰 발견: 아카이브는 실제로 동작하지만(파일 추가 → PR → 자동 등장),
 * 그걸 어떻게 트리거하는지 아무도 알려주지 않았다. 빈 상태 CTA는
 * `/templates/reverse-engineering`(1~3회차 역기획 숙제 양식)을 가리켰고, 본문은
 * "올리는 법은 README에 있다"고 했지만 README에는 아카이브 관련 내용이 전혀 없다.
 * 두 경로 모두 죽은 링크였다.
 *
 * 그래서 "올리는 법" 안내를 archive/index.mdx 자체에 두기로 했고(README와 이중
 * 관리하며 어긋날 소지를 없앰), 빈 상태 CTA도 그 섹션(`/archive#how-to-upload`)을
 * 가리키게 바꿨다. 여기서 그 두 가지가 실제로 있는지 단언한다:
 *  - index.mdx에 "올리는 법" 섹션이 있고, 파일 위치·파일명 규칙·5개 frontmatter
 *    필드·Vercel Preview 안내를 실제로 담고 있다
 *  - archive-board.tsx의 빈 상태 CTA가 그 섹션을 가리키고, 죽은 링크
 *    (`/templates/reverse-engineering`)로 되돌아가지 않는다
 *  - index.mdx가 더 이상 README에 안내가 있다고 주장하지 않는다
 */
describe('content/docs/archive/index.mdx에 "올리는 법" 섹션이 있고, 빈 상태 CTA가 거기를 가리킨다', () => {
  it('index.mdx가 올리는 법 섹션(파일 위치·파일명 규칙·5개 frontmatter 필드·Vercel Preview)을 갖는다', () => {
    const raw = readDoc('content/docs/archive/index.mdx')
    expect(raw).toMatch(/## 올리는 법/)
    expect(raw).toMatch(/content\/docs\/archive\//)
    expect(raw).toMatch(/wNN-이름-종류\.mdx/)
    expect(raw).toMatch(/title:/)
    expect(raw).toMatch(/week:/)
    expect(raw).toMatch(/author:/)
    expect(raw).toMatch(/type:/)
    expect(raw).toMatch(/date:/)
    expect(raw).toMatch(/Vercel Preview/)
  })

  it('archive-board.tsx의 빈 상태 CTA가 /archive#how-to-upload를 가리킨다 (죽은 링크로 되돌아가지 않도록)', () => {
    const raw = readFileSync('components/archive/archive-board.tsx', 'utf-8')
    expect(raw).toMatch(/href="\/archive#how-to-upload"/)
    expect(raw).not.toMatch(/\/templates\/reverse-engineering/)
  })

  it('index.mdx는 더 이상 README에 안내가 있다고 주장하지 않는다', () => {
    const raw = readDoc('content/docs/archive/index.mdx')
    expect(raw).not.toMatch(/README/)
  })
})
