import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { curriculum } from '@/content/data/curriculum'

/**
 * Task 8 — Task 2/3/4/7에서 네 번 반복된 결함(계획이 준 테스트가 산출물을 실제로
 * 지키지 못하는 것)을 여기서 막는다. week-header.test.tsx / homework.test.tsx는
 * <WeekHeader />와 <Homework />를 고립된 컴포넌트로만 검사해서, 8개 회차 문서에
 * 실제로 삽입됐는지는 아무도 보지 않는다.
 *
 * 그래서 8개 회차 문서 각각의 raw 텍스트를 직접 읽어 다음을 단언한다:
 *  - 문서마다 <WeekHeader week={N} /> 을 "자기 번호"로 갖고 있다
 *  - 마지막 회차(스터디 종료, 숙제 없음)를 제외하고 <Homework week={N} /> 을 갖고 있다
 *  - `> ⚠️` 인용 경고 블록이 <Callout type="warn">으로 교체되어 원본 인용 블록이
 *    남아 있지 않다 (해당 문서: 06, 07)
 */

const DIR = 'content/docs/weeks'

function readWeekDoc(slug: string): string {
  return readFileSync(`${DIR}/${slug}.mdx`, 'utf-8')
}

describe('회차 문서에 <WeekHeader />가 실제로 삽입되어 있다', () => {
  curriculum.forEach((w) => {
    it(`${w.slug}.mdx는 <WeekHeader week={${w.no}} />를 갖는다`, () => {
      const raw = readWeekDoc(w.slug)
      const pattern = new RegExp(`<WeekHeader\\s+week=\\{${w.no}\\}\\s*/>`)
      expect(raw, `${w.slug}.mdx에 <WeekHeader week={${w.no}} />가 없음`).toMatch(pattern)
    })
  })
})

describe('회차 문서에 <Homework />가 실제로 삽입되어 있다 (마지막 회차 제외)', () => {
  const lastWeek = curriculum.length

  curriculum
    .filter((w) => w.no !== lastWeek)
    .forEach((w) => {
      it(`${w.slug}.mdx는 <Homework week={${w.no}} />를 갖는다`, () => {
        const raw = readWeekDoc(w.slug)
        const pattern = new RegExp(`<Homework\\s+week=\\{${w.no}\\}\\s*/>`)
        expect(raw, `${w.slug}.mdx에 <Homework week={${w.no}} />가 없음`).toMatch(pattern)
      })
    })

  it('마지막 회차 문서는 <Homework />를 갖지 않는다 (숙제 없이 뒤풀이로 끝남)', () => {
    const last = curriculum.find((w) => w.no === lastWeek)!
    const raw = readWeekDoc(last.slug)
    expect(raw).not.toMatch(/<Homework\s+week=/)
  })
})

describe('`> ⚠️` 인용 경고 블록이 <Callout type="warn">으로 교체되어 있다', () => {
  it('06-metrics-priority.mdx와 07-my-idea.mdx에 원본 `> ⚠️` 블록이 남아 있지 않다', () => {
    const files = ['06-metrics-priority', '07-my-idea']
    files.forEach((slug) => {
      const raw = readWeekDoc(slug)
      expect(raw, `${slug}.mdx에 미교체 '> ⚠️' 블록이 남아 있음`).not.toMatch(/^> ⚠️/m)
    })
  })

  it('06-metrics-priority.mdx는 <Callout type="warn">을 2개 갖는다', () => {
    const raw = readWeekDoc('06-metrics-priority')
    const count = (raw.match(/<Callout type="warn">/g) ?? []).length
    expect(count).toBe(2)
  })

  it('07-my-idea.mdx는 <Callout type="warn">을 1개 갖는다', () => {
    const raw = readWeekDoc('07-my-idea')
    const count = (raw.match(/<Callout type="warn">/g) ?? []).length
    expect(count).toBe(1)
  })
})
