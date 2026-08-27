import { curriculum } from '@/content/data/curriculum'

/**
 * `Submission` 타입과 순수 함수 `groupByWeek`/`groupByAuthor`만 여기 둔다.
 *
 * `@/lib/source`를 import하지 않는다 — 그걸 import하면 이 파일의 단위 테스트가
 * Fumadocs 빌드 산출물(`.source/`)에 의존하게 된다. 실제 문서 수집은
 * `lib/archive-source.ts`의 `collectSubmissions()`가 맡는다. `curriculum`은
 * 순수 데이터라 여기서 import해도 문제없다.
 */
export interface Submission {
  url: string
  title: string
  week: number
  author: string
  type: string
  date: string
}

export function groupByWeek(subs: Submission[]): { week: number; items: Submission[] }[] {
  return curriculum.map((w) => ({
    week: w.no,
    items: subs.filter((s) => s.week === w.no),
  }))
}

export function groupByAuthor(subs: Submission[]): { author: string; items: Submission[] }[] {
  const map = new Map<string, Submission[]>()
  for (const s of subs) {
    const list = map.get(s.author) ?? []
    list.push(s)
    map.set(s.author, list)
  }
  return Array.from(map.entries())
    .map(([author, items]) => ({ author, items }))
    .sort((a, b) => a.author.localeCompare(b.author, 'ko'))
}
