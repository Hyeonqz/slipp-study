import { source } from '@/lib/source'
import type { Submission } from '@/lib/archive'

/**
 * `@/lib/source`를 여기서만 import한다 — `lib/archive.ts`의 순수 함수 테스트가
 * Fumadocs 빌드 산출물(`.source/`)에 의존하지 않도록 수집(서버) 로직을 분리했다.
 *
 * `content/docs/archive/index.mdx` 자기 자신은 제외하고, `week`·`author`가 채워진
 * (=제출물 frontmatter를 갖춘) 문서만 제출물로 취급한다.
 */
export function collectSubmissions(): Submission[] {
  return source
    .getPages()
    .filter((p) => p.url.startsWith('/archive/') && p.url !== '/archive')
    .filter((p) => p.data.week != null && p.data.author != null)
    .map((p) => ({
      url: p.url,
      title: p.data.title,
      week: p.data.week as number,
      author: p.data.author as string,
      type: p.data.type as string,
      date: p.data.date as string,
    }))
    .sort((a, b) => a.week - b.week || a.date.localeCompare(b.date))
}
