import { describe, it, expect } from 'vitest'
import { collectSubmissions } from '@/lib/archive-source'

/**
 * Fix Wave finding 2: `collectSubmissions()`가 실제 Fumadocs 콜렉션(`.source`,
 * `tests/unit/source.test.ts`와 같은 방식으로 vitest 플러그인이 빌드 시점에
 * 생성한다)을 읽어 아카이브 예시 문서(`content/docs/archive/w02-example-reverse.mdx`)
 * 를 제대로 돌려주는지 직접 검증한다.
 *
 * 이 테스트가 없던 이전 상태의 위험: `collectSubmissions()`의 필터가 깨지면
 * `ArchiveBoardView`는 그냥 빈 상태로 떨어지고, `tests/unit/archive-board.test.tsx`는
 * 그 빈 상태를 "정상"으로 단언한다 — 282개 테스트가 전부 초록인 채로 아카이브
 * 수집 기능만 조용히 죽을 수 있었다.
 */
describe('collectSubmissions()', () => {
  it('아카이브 예시 제출물(w02-example-reverse)을 week/author/type/date 그대로 돌려준다', () => {
    const submissions = collectSubmissions()
    const example = submissions.find((s) => s.url === '/archive/w02-example-reverse')

    expect(example).toBeDefined()
    expect(example).toMatchObject({
      week: 2,
      author: '예시',
      type: '역기획',
      date: '2026-09-15',
    })
  })

  it('archive/index.mdx 자기 자신은 제출물로 취급하지 않는다', () => {
    const submissions = collectSubmissions()
    expect(submissions.find((s) => s.url === '/archive')).toBeUndefined()
  })

  it('week 오름차순으로 정렬한다', () => {
    const submissions = collectSubmissions()
    const weeks = submissions.map((s) => s.week)
    expect(weeks).toEqual([...weeks].sort((a, b) => a - b))
  })
})
