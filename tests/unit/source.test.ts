import { describe, it, expect } from 'vitest'
import { source } from '@/lib/source'

describe('source', () => {
  it('사이트 루트를 홈 문서로 매핑한다', () => {
    const page = source.getPage([])
    expect(page).toBeDefined()
    expect(page!.url).toBe('/')
    expect(page!.data.title).toBe('스터디 한눈에 보기')
  })

  it('페이지 트리를 만든다', () => {
    expect(source.getPageTree().children.length).toBeGreaterThan(0)
  })
})
